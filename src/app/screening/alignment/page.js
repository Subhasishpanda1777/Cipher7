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

const TEST_DURATION_MS = 10_000;
const SAMPLING_INTERVAL_MS = 150;
const SYMMETRY_THRESHOLD = 0.08;
const DEVIATION_THRESHOLD = 0.1;

const LEFT_EYE_CENTER = [33, 133];
const RIGHT_EYE_CENTER = [362, 263];
const NOSE_BRIDGE = [6, 168];

export default function AlignmentTestPage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streamReady, setStreamReady] = useState(false);
  const [testState, setTestState] = useState("idle"); // idle | running | complete
  const [score, setScore] = useState(null);
  const [samples, setSamples] = useState([]);
  const [error, setError] = useState("");
  const router = useRouter();
  const startTimeRef = useRef(null);
  const timerRef = useRef(null);
  const faceMeshRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    const session = readScreeningSession();
    if (!session.consentGiven) {
      router.replace("/screening/instructions");
    }
  }, [router]);

  useEffect(() => {
    let active = true;

    const setup = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 960 },
            height: { ideal: 720 },
          },
        });
        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        setStreamReady(true);

        const [{ FaceMesh }, { Camera }] = await Promise.all([
          import("@mediapipe/face_mesh"),
          import("@mediapipe/camera_utils"),
        ]);

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
            collectSample(results);
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
        console.error("VisionAI alignment setup error", err);
        setError(
          err?.name === "NotAllowedError"
            ? "Camera permission was denied. Please allow access to continue."
            : "Unable to initialize the test. Please refresh the page and try again."
        );
      }
    };

    setup();

    return () => {
      active = false;
      if (cameraRef.current?.stop) cameraRef.current.stop();
      if (faceMeshRef.current?.close) faceMeshRef.current.close();
      const tracks = videoRef.current?.srcObject?.getTracks?.();
      tracks?.forEach((track) => track.stop());
      clearTimeout(timerRef.current);
    };
  }, [testState]);

  useEffect(() => {
    if (score?.alignmentDeviationScore === undefined) {
      return;
    }
    mergeScreeningSession({
      alignmentDeviationScore: score.alignmentDeviationScore,
    });
  }, [score]);

  useEffect(() => {
    if (testState !== "running") return;

    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      finalizeScore();
    }, TEST_DURATION_MS);

    const interval = setInterval(() => {
      setSamples((prev) => [...prev]);
    }, SAMPLING_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [testState]);

  const drawOverlay = (results) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { image, multiFaceLandmarks } = results;
    if (image) {
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    }

    const landmarks = multiFaceLandmarks?.[0];
    if (!landmarks) {
      return;
    }

    ctx.strokeStyle = "rgba(16, 78, 123, 0.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    const nose = landmarks[1];
    if (nose) {
      ctx.fillStyle = "rgba(58, 198, 168, 0.8)";
      ctx.beginPath();
      ctx.arc(nose.x * canvas.width, nose.y * canvas.height, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const collectSample = (results) => {
    const landmarks = results?.multiFaceLandmarks?.[0];
    if (!landmarks) {
      return;
    }
    const leftEye = averagePoint(landmarks, LEFT_EYE_CENTER);
    const rightEye = averagePoint(landmarks, RIGHT_EYE_CENTER);
    const noseBridgeTop = landmarks[NOSE_BRIDGE[0]];
    const noseBridgeBottom = landmarks[NOSE_BRIDGE[1]];

    if (!leftEye || !rightEye || !noseBridgeTop || !noseBridgeBottom) return;

    const horizontalDeviation = Math.abs(leftEye.x - (1 - rightEye.x));
    const verticalDeviation = Math.abs(leftEye.y - rightEye.y);
    const noseAngle = Math.atan2(
      noseBridgeBottom.x - noseBridgeTop.x,
      noseBridgeBottom.y - noseBridgeTop.y
    );

    const sample = {
      timestamp: Date.now(),
      horizontalDeviation,
      verticalDeviation,
      noseAngle,
    };

    setSamples((prev) => [...prev, sample]);
  };

  const finalizeScore = () => {
    setTestState("complete");
    if (!samples.length) {
      setScore({
        symmetryRatio: 0,
        deviationScore: 1,
        alignmentDeviationScore: 1,
      });
      return;
    }

    const horizontalSpread = standardDeviation(samples.map((s) => s.horizontalDeviation));
    const verticalSpread = standardDeviation(samples.map((s) => s.verticalDeviation));
    const angleSpread = standardDeviation(samples.map((s) => s.noseAngle));

    const symmetryRatio = 1 - Math.min(horizontalSpread / SYMMETRY_THRESHOLD, 1);
    const deviationScore = 1 - Math.min(verticalSpread / DEVIATION_THRESHOLD, 1);
    const angleScore = 1 - Math.min(Math.abs(angleSpread) / 0.05, 1);

    const alignmentDeviationScore = Math.max(
      0,
      Number(((symmetryRatio * 0.5 + deviationScore * 0.3 + angleScore * 0.2)).toFixed(2))
    );

    setScore({ symmetryRatio, deviationScore, angleScore, alignmentDeviationScore });
  };

  const startTest = () => {
    setSamples([]);
    setScore(null);
    setTestState("running");
  };

  const resultSummary = useMemo(() => {
    if (!score) return null;
    const statusLabel =
      score.alignmentDeviationScore > 0.7
        ? "Excellent alignment"
        : score.alignmentDeviationScore > 0.4
        ? "Mild deviation detected"
        : "Significant asymmetry detected";
    return {
      statusLabel,
      highlights: [
        { label: "Symmetry ratio", value: score.symmetryRatio },
        { label: "Vertical stability", value: score.deviationScore },
        { label: "Nose alignment", value: score.angleScore },
      ],
    };
  }, [score]);

  const handleContinue = () => {
    if (!score) return;
    router.push("/screening/tracking");
  };

  return (
    <div className="min-h-screen bg-gradient px-6 py-12">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="rounded-[var(--radius-card)] border border-white/70 bg-white/90 p-8 shadow-lg backdrop-blur">
          <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-primary)]/15 px-4 py-1 text-sm font-semibold text-[color:var(--color-primary)]">
            Step 3 • Eye Alignment Test
          </span>
          <h1 className="mt-4 font-rounded text-3xl font-semibold text-[color:var(--color-emphasis)] md:text-4xl">
            Focus on the Center Dot for 10 Seconds
          </h1>
          <p className="mt-3 max-w-3xl text-base text-[color:var(--color-muted)] md:text-lg">
            Keep your child looking directly at the dot while VisionAI ensures both eyes remain aligned. Please avoid moving or tilting the head during the test window.
          </p>
        </header>

        <main className="grid gap-8 lg:grid-cols-5">
          <section className="rounded-[var(--radius-card)] border border-white/60 bg-white/95 p-6 shadow-xl backdrop-blur lg:col-span-3">
            <div className="relative aspect-video overflow-hidden rounded-[20px] bg-black">
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className="h-full w-full object-cover"
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 h-full w-full"
              />
              {!streamReady && !error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white">
                  <p>Initialising camera…</p>
                </div>
              )}
              {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 px-6 text-center text-white">
                  <p className="text-lg font-semibold">Unable to run test</p>
                  <p className="mt-2 text-sm opacity-80">{error}</p>
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-6 w-6 rounded-full bg-[color:var(--color-accent)] shadow-lg shadow-[color:var(--color-accent)]/50" />
              </div>
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
                    ? "Recording alignment metrics…"
                    : "Test complete."}
                </p>
              </div>
              <button
                type="button"
                onClick={startTest}
                disabled={testState === "running" || !!error}
                className="rounded-full bg-[color:var(--color-secondary)] px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-[color:var(--color-secondary)]/40 transition hover:bg-[color:var(--color-secondary)]/90 disabled:cursor-not-allowed disabled:bg-[color:var(--color-muted)]/40"
              >
                {testState === "running" ? "Running…" : "Start 10s Test"}
              </button>
            </div>
          </section>

          <aside className="space-y-6 rounded-[var(--radius-card)] border border-white/60 bg-white/95 p-6 shadow-xl backdrop-blur lg:col-span-2">
            <h2 className="font-rounded text-xl font-semibold text-[color:var(--color-emphasis)]">
              What VisionAI Measures
            </h2>
            <ul className="space-y-4 text-sm text-[color:var(--color-muted)]">
              <li>
                <strong className="block text-[color:var(--color-emphasis)]">Horizontal deviation</strong>
                Tracks the symmetry between both eye centers to identify strabismus risk.
              </li>
              <li>
                <strong className="block text-[color:var(--color-emphasis)]">Vertical balance</strong>
                Monitors eye height differences to detect drooping or tilting.
              </li>
              <li>
                <strong className="block text-[color:var(--color-emphasis)]">Nose bridge angle</strong>
                Ensures the child’s head remains straight during the assessment.
              </li>
            </ul>

            {score && resultSummary && (
              <div className="rounded-2xl border border-[color:var(--color-primary)]/30 bg-[color:var(--color-primary)]/10 p-4">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-emphasis)]/70">
                  Summary
                </p>
                <h3 className="mt-2 font-rounded text-xl text-[color:var(--color-emphasis)]">
                  {resultSummary.statusLabel}
                </h3>
                <ul className="mt-3 space-y-2 text-sm">
                  {resultSummary.highlights.map((item) => (
                    <li key={item.label} className="flex items-center justify-between">
                      <span>{item.label}</span>
                      <span className="font-semibold text-[color:var(--color-emphasis)]">
                        {item.value.toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 rounded-xl bg-white/70 p-3 text-xs text-[color:var(--color-muted)]">
                  Alignment score: <strong>{score.alignmentDeviationScore.toFixed(2)}</strong>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 md:flex-row">
              <Link
                href="/screening/webcam"
                className="inline-flex items-center justify-center rounded-full border border-[color:var(--color-primary)]/40 px-6 py-3 text-sm font-semibold text-[color:var(--color-emphasis)] transition hover:bg-[color:var(--color-primary)]/10"
              >
                Back
              </Link>
              <button
                type="button"
                disabled={!score}
                onClick={handleContinue}
                className="inline-flex flex-1 items-center justify-center rounded-full bg-[color:var(--color-secondary)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[color:var(--color-secondary)]/40 transition hover:bg-[color:var(--color-secondary)]/90 disabled:cursor-not-allowed disabled:bg-[color:var(--color-muted)]/40"
              >
                Continue to Tracking Test
              </button>
            </div>
            {!score && (
              <p className="text-xs text-[color:var(--color-muted)]">
                Complete the 10-second alignment test to proceed.
              </p>
            )}
          </aside>
        </main>
      </div>
    </div>
  );
}

function averagePoint(landmarks, indices) {
  const points = indices.map((index) => landmarks[index]).filter(Boolean);
  if (!points.length) return null;
  const sum = points.reduce(
    (acc, point) => ({
      x: acc.x + point.x,
      y: acc.y + point.y,
    }),
    { x: 0, y: 0 }
  );
  return {
    x: sum.x / points.length,
    y: sum.y / points.length,
  };
}

function standardDeviation(values) {
  if (!values.length) return 0;
  const mean = values.reduce((acc, val) => acc + val, 0) / values.length;
  const variance =
    values.reduce((acc, val) => acc + (val - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}
