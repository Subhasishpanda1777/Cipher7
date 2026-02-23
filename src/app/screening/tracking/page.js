'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  mergeScreeningSession,
  readScreeningSession,
} from "@/lib/screeningSession";

const faceMeshCdn = (asset) =>
  `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/${asset}`;

const TEST_DURATION_MS = 12000;
const MOVE_SEQUENCE = [
  { x: 0.2, y: 0.5 },
  { x: 0.8, y: 0.5 },
  { x: 0.5, y: 0.2 },
  { x: 0.5, y: 0.8 },
];
const SEGMENT_DURATION = TEST_DURATION_MS / MOVE_SEQUENCE.length;

const LEFT_PUPIL = 468;
const RIGHT_PUPIL = 473;

export default function TrackingTestPage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const pointerRef = useRef(null);
  const router = useRouter();

  const [error, setError] = useState("");
  const [testState, setTestState] = useState("idle");
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [samples, setSamples] = useState([]);
  const [score, setScore] = useState(null);
  const faceMeshRef = useRef(null);
  const cameraRef = useRef(null);
  const animationRef = useRef(null);
  const startTimestamp = useRef(null);

  useEffect(() => {
    const session = readScreeningSession();
    if (!session.consentGiven || session.alignmentDeviationScore === undefined) {
      router.replace(
        !session.consentGiven
          ? "/screening/instructions"
          : "/screening/alignment"
      );
    }
  }, [router]);

  useEffect(() => {
    const setup = async () => {
      try {
        const [{ FaceMesh }, { Camera }] = await Promise.all([
          import("@mediapipe/face_mesh"),
          import("@mediapipe/camera_utils"),
        ]);

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 960 },
            height: { ideal: 720 },
          },
        });

        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();

        const faceMesh = new FaceMesh({ locateFile: faceMeshCdn });
        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.5,
        });
        faceMesh.onResults((results) => {
          drawOverlay(results);
          if (testState === "running") {
            captureSample(results);
          }
        });
        faceMeshRef.current = faceMesh;

        const camera = new Camera(video, {
          onFrame: async () => {
            if (faceMeshRef.current) {
              await faceMeshRef.current.send({ image: video });
            }
          },
          width: 640,
          height: 480,
        });
        cameraRef.current = camera;
        camera.start();
      } catch (err) {
        console.error("VisionAI tracking setup error", err);
        setError(
          err?.name === "NotAllowedError"
            ? "Camera permission was denied. Please allow access to continue."
            : "Unable to initialise the test. Please refresh and try again."
        );
      }
    };

    setup();

    return () => {
      if (cameraRef.current?.stop) cameraRef.current.stop();
      if (faceMeshRef.current?.close) faceMeshRef.current.close();
      const tracks = videoRef.current?.srcObject?.getTracks?.();
      tracks?.forEach((track) => track.stop());
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [testState]);

  useEffect(() => {
    if (score?.trackingStabilityScore === undefined) return;
    mergeScreeningSession({
      trackingStabilityScore: score.trackingStabilityScore,
    });
  }, [score]);

  const drawOverlay = (results) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { image } = results;
    if (image) {
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    }
  };

  const captureSample = (results) => {
    const landmarks = results?.multiFaceLandmarks?.[0];
    if (!landmarks) return;

    const currentSegment = MOVE_SEQUENCE[segmentIndex];
    const expectedPosition = currentSegment;
    const leftPupil = landmarks[LEFT_PUPIL];
    const rightPupil = landmarks[RIGHT_PUPIL];
    if (!leftPupil || !rightPupil) return;

    const averagePupil = {
      x: (leftPupil.x + rightPupil.x) / 2,
      y: (leftPupil.y + rightPupil.y) / 2,
    };

    const distance = Math.hypot(
      averagePupil.x - expectedPosition.x,
      averagePupil.y - expectedPosition.y
    );
    const interEyeLag = Math.abs(leftPupil.x - rightPupil.x);

    setSamples((prev) => [
      ...prev,
      {
        timestamp: Date.now(),
        distance,
        interEyeLag,
        segment: segmentIndex,
      },
    ]);
  };

  const startTest = () => {
    setSamples([]);
    setScore(null);
    setTestState("running");
    setSegmentIndex(0);
    startTimestamp.current = null;
    animatePointer();

    setTimeout(() => {
      finishTest();
    }, TEST_DURATION_MS + 200);
  };

  const animatePointer = (timestamp) => {
    if (testState !== "running") return;

    if (!startTimestamp.current) {
      startTimestamp.current = timestamp ?? performance.now();
    }
    const elapsed = (timestamp ?? performance.now()) - startTimestamp.current;
    const currentSegment = Math.min(
      MOVE_SEQUENCE.length - 1,
      Math.floor(elapsed / SEGMENT_DURATION)
    );
    setSegmentIndex(currentSegment);

    const pointer = pointerRef.current;
    if (pointer) {
      const target = MOVE_SEQUENCE[currentSegment];
      pointer.style.transform = `translate(-50%, -50%) translate(${target.x * 100}%,${
        target.y * 100
      }%)`;
    }

    animationRef.current = requestAnimationFrame(animatePointer);
  };

  const finishTest = () => {
    setTestState("complete");
    if (!samples.length) {
      setScore({ trackingStabilityScore: 0, lagScore: 0, smoothness: 0 });
      return;
    }

    const segments = groupBy(samples, (sample) => sample.segment);
    const segmentScores = Object.values(segments).map((segmentData) => {
      const avgDistance = average(segmentData.map((s) => s.distance));
      const avgLag = average(segmentData.map((s) => s.interEyeLag));
      return {
        distanceScore: Math.max(0, 1 - avgDistance * 4),
        lagScore: Math.max(0, 1 - avgLag * 8),
      };
    });

    const distanceScore = average(segmentScores.map((s) => s.distanceScore));
    const lagScore = average(segmentScores.map((s) => s.lagScore));

    const smoothness = calculateSmoothness(samples);

    const trackingStabilityScore = Number(
      (distanceScore * 0.6 + lagScore * 0.25 + smoothness * 0.15).toFixed(2)
    );

    setScore({ trackingStabilityScore, lagScore, distanceScore, smoothness });
  };

  const summary = useMemo(() => {
    if (!score) return null;
    return [
      {
        label: "Tracking accuracy",
        value: score.distanceScore,
      },
      {
        label: "Eye coordination",
        value: score.lagScore,
      },
      {
        label: "Smoothness",
        value: score.smoothness,
      },
    ];
  }, [score]);

  const handleContinue = () => {
    if (!score) return;
    const existing = JSON.parse(sessionStorage.getItem("visionai-screening") || "{}");
    sessionStorage.setItem(
      "visionai-screening",
      JSON.stringify({
        ...existing,
        trackingStabilityScore: score.trackingStabilityScore,
      })
    );
    router.push("/screening/contrast");
  };

  return (
    <div className="min-h-screen bg-gradient px-6 py-12">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="rounded-[var(--radius-card)] border border-white/70 bg-white/90 p-8 shadow-lg backdrop-blur">
          <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-primary)]/15 px-4 py-1 text-sm font-semibold text-[color:var(--color-primary)]">
            Step 4 • Eye Tracking Test
          </span>
          <h1 className="mt-4 font-rounded text-3xl font-semibold text-[color:var(--color-emphasis)] md:text-4xl">
            Follow the Moving Dot Across the Screen
          </h1>
          <p className="mt-3 max-w-3xl text-base text-[color:var(--color-muted)] md:text-lg">
            Ask your child to track the dot with their eyes only, keeping the head still. VisionAI measures reaction time, smooth pursuit, and inter-eye coordination.
          </p>
        </header>

        <main className="grid gap-8 lg:grid-cols-5">
          <section className="rounded-[var(--radius-card)] border border-white/60 bg-white/95 p-6 shadow-xl backdrop-blur lg:col-span-3">
            <div className="relative aspect-video overflow-hidden rounded-[20px] bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
              />
              <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
              {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 px-6 text-center text-white">
                  <p className="text-lg font-semibold">Unable to run test</p>
                  <p className="mt-2 text-sm opacity-80">{error}</p>
                </div>
              )}
              <div
                ref={pointerRef}
                className="pointer-events-none absolute top-1/2 left-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[color:var(--color-accent)] shadow-lg shadow-[color:var(--color-accent)]/40"
              />
            </div>
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-[color:var(--color-primary)]/10 p-4 text-sm text-[color:var(--color-muted)]">
              <div>
                <p className="font-semibold text-[color:var(--color-emphasis)]">
                  Test status
                </p>
                <p>
                  {testState === "idle"
                    ? "Press start when your child is ready."
                    : testState === "running"
                    ? "Tracking movement…"
                    : "Test complete."}
                </p>
              </div>
              <button
                type="button"
                onClick={startTest}
                disabled={testState === "running" || !!error}
                className="rounded-full bg-[color:var(--color-secondary)] px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-[color:var(--color-secondary)]/40 transition hover:bg-[color:var(--color-secondary)]/90 disabled:cursor-not-allowed disabled:bg-[color:var(--color-muted)]/40"
              >
                {testState === "running" ? "Running…" : "Start movement"}
              </button>
            </div>
          </section>

          <aside className="space-y-6 rounded-[var(--radius-card)] border border-white/60 bg-white/95 p-6 shadow-xl backdrop-blur lg:col-span-2">
            <h2 className="font-rounded text-xl font-semibold text-[color:var(--color-emphasis)]">
              What VisionAI Measures
            </h2>
            <ul className="space-y-4 text-sm text-[color:var(--color-muted)]">
              <li>
                <strong className="block text-[color:var(--color-emphasis)]">Reaction latency</strong>
                How quickly the eyes move to follow the dot as it shifts direction.
              </li>
              <li>
                <strong className="block text-[color:var(--color-emphasis)]">Smooth pursuit</strong>
                Whether eye movement remains fluid without sudden jumps.
              </li>
              <li>
                <strong className="block text-[color:var(--color-emphasis)]">Inter-eye lag</strong>
                Ensures both eyes track together without delay.
              </li>
            </ul>

            {score && (
              <div className="rounded-2xl border border-[color:var(--color-primary)]/30 bg-[color:var(--color-primary)]/10 p-4">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-emphasis)]/70">
                  Summary
                </p>
                <h3 className="mt-2 font-rounded text-xl text-[color:var(--color-emphasis)]">
                  Tracking Stability Score: {score.trackingStabilityScore.toFixed(2)}
                </h3>
                <ul className="mt-3 space-y-2 text-sm">
                  {summary?.map((item) => (
                    <li key={item.label} className="flex items-center justify-between">
                      <span>{item.label}</span>
                      <span className="font-semibold text-[color:var(--color-emphasis)]">
                        {item.value.toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col gap-3 md:flex-row">
              <Link
                href="/screening/alignment"
                className="inline-flex items-center justify-center rounded-full border border-[color:var(--color-primary)]/40 px-6 py-3 text-sm font-semibold text-[color:var(--color-emphasis)] transition hover:bg-[color:var(--color-primary)]/10"
              >
                Back
              </Link>
              <button
                type="button"
                onClick={handleContinue}
                disabled={!score}
                className="inline-flex flex-1 items-center justify-center rounded-full bg-[color:var(--color-secondary)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[color:var(--color-secondary)]/40 transition hover:bg-[color:var(--color-secondary)]/90 disabled:cursor-not-allowed disabled:bg-[color:var(--color-muted)]/40"
              >
                Continue to Contrast Test
              </button>
            </div>
            {!score && (
              <p className="text-xs text-[color:var(--color-muted)]">
                Complete the tracking sequence to proceed.
              </p>
            )}
          </aside>
        </main>
      </div>
    </div>
  );
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((acc, val) => acc + val, 0) / values.length;
}

function groupBy(array, getKey) {
  return array.reduce((acc, item) => {
    const key = getKey(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

function calculateSmoothness(samples) {
  if (samples.length < 3) return 0;
  let totalVariation = 0;
  let count = 0;
  for (let i = 2; i < samples.length; i += 1) {
    const prev = samples[i - 1];
    const curr = samples[i];
    const variation = Math.abs(curr.distance - prev.distance);
    totalVariation += variation;
    count += 1;
  }
  if (!count) return 0;
  const avgVariation = totalVariation / count;
  return Math.max(0, 1 - avgVariation * 10);
}
