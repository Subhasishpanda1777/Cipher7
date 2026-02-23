'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const VALIDATION_TARGETS = {
  FACE_CENTERED: "faceCentered",
  EYES_VISIBLE: "eyesVisible",
  LIGHTING: "lighting",
};

const faceCenterThreshold = 0.08; // allowable offset from center (normalized)
const eyeVisibilityThreshold = 0.12; // max vertical distance difference between eye lids

const faceMeshCdn = (asset) =>
  `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/${asset}`;

export default function WebcamSetupPage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const router = useRouter();
  const [permissionState, setPermissionState] = useState("pending");
  const [error, setError] = useState("");
  const [status, setStatus] = useState({
    faceCentered: false,
    eyesVisible: false,
    lighting: "checking",
  });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cameraInstance;
    let faceMeshInstance;
    let animationFrame;
    let stream;
    let didCancel = false;

    const init = async () => {
      if (!navigator?.mediaDevices?.getUserMedia) {
        setError("Webcam access is not supported on this device/browser.");
        setPermissionState("denied");
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 960 },
            height: { ideal: 720 },
          },
        });
        if (didCancel) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        setPermissionState("granted");
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();

        const [{ FaceMesh }, { Camera }] = await Promise.all([
          import("@mediapipe/face_mesh"),
          import("@mediapipe/camera_utils"),
        ]);

        faceMeshInstance = new FaceMesh({
          locateFile: faceMeshCdn,
        });
        faceMeshInstance.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.5,
        });

        faceMeshInstance.onResults((results) => {
          if (!videoRef.current || !canvasRef.current) {
            return;
          }
          drawOverlay(results);
          evaluateResults(results);
        });

        cameraInstance = new Camera(video, {
          onFrame: async () => {
            if (faceMeshInstance) {
              await faceMeshInstance.send({ image: video });
            }
          },
          width: 640,
          height: 480,
        });

        cameraInstance.start();
      } catch (err) {
        console.error("VisionAI webcam init error", err);
        setPermissionState("denied");
        setError(
          err?.name === "NotAllowedError"
            ? "Camera permission was denied. Please allow camera access to continue."
            : "Unable to access the webcam. Please check your device and try again."
        );
      }
    };

    const evaluateResults = (results) => {
      const landmarks = results?.multiFaceLandmarks?.[0];
      if (!landmarks) {
        setStatus((prev) => ({
          ...prev,
          faceCentered: false,
          eyesVisible: false,
          lighting: "checking",
        }));
        setIsReady(false);
        return;
      }

      const isFaceCentered = checkFaceCentered(landmarks);
      const areEyesVisible = checkEyesVisible(landmarks);
      const lightingLabel = assessLighting(canvasRef.current);

      const allGood =
        isFaceCentered &&
        areEyesVisible &&
        (lightingLabel === "good" || lightingLabel === "bright");

      setStatus({
        faceCentered: isFaceCentered,
        eyesVisible: areEyesVisible,
        lighting: lightingLabel,
      });
      setIsReady(allGood);
    };

    const drawOverlay = (results) => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;
      const ctx = canvas.getContext("2d");
      const { image, multiFaceLandmarks } = results;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (image) {
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      }

      const landmarks = multiFaceLandmarks?.[0];
      if (landmarks) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(16, 78, 123, 0.8)";
        ctx.fillStyle = "rgba(98, 182, 240, 0.7)";

        const leftEye = selectLandmarks(landmarks, LEFT_EYE_INDICES);
        const rightEye = selectLandmarks(landmarks, RIGHT_EYE_INDICES);
        drawClosedShape(ctx, leftEye);
        drawClosedShape(ctx, rightEye);

        const noseTip = landmarks[1];
        ctx.beginPath();
        ctx.arc(
          noseTip.x * canvas.width,
          noseTip.y * canvas.height,
          6,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      ctx.restore();
    };

    init();

    return () => {
      didCancel = true;
      if (cameraInstance?.stop) {
        cameraInstance.stop();
      }
      if (faceMeshInstance?.close) {
        faceMeshInstance.close();
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  const statusItems = useMemo(
    () => [
      {
        key: VALIDATION_TARGETS.FACE_CENTERED,
        label: "Face centered",
        description: "Keep the face aligned with the center of the frame.",
        satisfied: status.faceCentered,
      },
      {
        key: VALIDATION_TARGETS.EYES_VISIBLE,
        label: "Both eyes visible",
        description: "Ensure both eyes are open and not blocked.",
        satisfied: status.eyesVisible,
      },
      {
        key: VALIDATION_TARGETS.LIGHTING,
        label: "Lighting",
        description: "Use soft, even lighting without strong shadows.",
        satisfied: status.lighting === "good" || status.lighting === "bright",
        hint:
          status.lighting === "dim"
            ? "Please increase the lighting in the room."
            : status.lighting === "bright"
            ? "Lighting is slightly strong but acceptable."
            : undefined,
      },
    ],
    [status]
  );

  return (
    <div className="min-h-screen bg-gradient px-6 py-12">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="rounded-[var(--radius-card)] border border-white/70 bg-white/90 p-8 shadow-lg backdrop-blur">
          <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-primary)]/15 px-4 py-1 text-sm font-semibold text-[color:var(--color-primary)]">
            Step 2 • Webcam Setup
          </span>
          <h1 className="mt-4 font-rounded text-3xl font-semibold text-[color:var(--color-emphasis)] md:text-4xl">
            Align Your Child Within the Frame
          </h1>
          <p className="mt-3 max-w-3xl text-base text-[color:var(--color-muted)] md:text-lg">
            VisionAI uses your webcam and privacy-safe facial landmarks to verify that both eyes are visible before running the screening tests. Follow the guidance below until all checks turn green.
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
              {permissionState === "pending" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white">
                  <p>Requesting camera access…</p>
                </div>
              )}
              {permissionState === "denied" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 px-6 text-center text-white">
                  <p className="text-lg font-semibold">Camera permission required</p>
                  <p className="mt-2 text-sm opacity-80">{error}</p>
                </div>
              )}
            </div>
            <div className="mt-4 rounded-2xl bg-[color:var(--color-primary)]/10 p-4 text-sm text-[color:var(--color-muted)]">
              <strong className="font-rounded text-[color:var(--color-emphasis)]">
                Privacy notice:
              </strong>{" "}
              VisionAI runs all face landmark analysis locally in the browser and never stores raw video footage.
            </div>
          </section>

          <aside className="space-y-6 rounded-[var(--radius-card)] border border-white/60 bg-white/95 p-6 shadow-xl backdrop-blur lg:col-span-2">
            <h2 className="font-rounded text-xl font-semibold text-[color:var(--color-emphasis)]">
              Live Validation
            </h2>
            <ul className="space-y-4">
              {statusItems.map((item) => (
                <li
                  key={item.key}
                  className="flex items-start gap-3 rounded-2xl border border-[color:var(--color-primary)]/20 bg-[color:var(--color-primary)]/5 p-4"
                >
                  <span
                    className={`mt-1 inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${
                      item.satisfied
                        ? "bg-[color:var(--color-secondary)]"
                        : "bg-[color:var(--color-muted)]/50"
                    }`}
                  >
                    {item.satisfied ? "✓" : "!"}
                  </span>
                  <div>
                    <p className="font-semibold text-[color:var(--color-emphasis)]">
                      {item.label}
                    </p>
                    <p className="text-sm text-[color:var(--color-muted)]">
                      {item.description}
                    </p>
                    {item.hint && (
                      <p className="mt-2 text-xs font-medium text-[color:var(--color-accent)]">
                        {item.hint}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <div className="rounded-2xl bg-[color:var(--color-emphasis)]/8 p-4 text-sm text-[color:var(--color-muted)]">
              <p>
                Sit slightly below eye level with the camera, and have your child look towards the center dot on screen during all tests.
              </p>
            </div>
            <div className="flex flex-col gap-3 md:flex-row">
              <Link
                href="/screening/instructions"
                className="inline-flex items-center justify-center rounded-full border border-[color:var(--color-primary)]/40 px-6 py-3 text-sm font-semibold text-[color:var(--color-emphasis)] transition hover:bg-[color:var(--color-primary)]/10"
              >
                Back
              </Link>
              <button
                type="button"
                disabled={!isReady}
                onClick={() => {
                  if (!isReady) return;
                  router.push("/screening/alignment");
                }}
                className="inline-flex flex-1 items-center justify-center rounded-full bg-[color:var(--color-secondary)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[color:var(--color-secondary)]/40 transition hover:bg-[color:var(--color-secondary)]/90 disabled:cursor-not-allowed disabled:bg-[color:var(--color-muted)]/40"
              >
                Continue to Eye Alignment Test
              </button>
            </div>
            {!isReady && permissionState === "granted" && (
              <p className="text-xs text-[color:var(--color-muted)]">
                Waiting for all validation checks to pass…
              </p>
            )}
          </aside>
        </main>
      </div>
    </div>
  );
}

const LEFT_EYE_INDICES = [33, 7, 163, 144, 145, 153, 154, 155];
const RIGHT_EYE_INDICES = [263, 249, 390, 373, 374, 380, 381, 382];

function selectLandmarks(landmarks, indices) {
  return indices.map((index) => landmarks[index]);
}

function drawClosedShape(ctx, points) {
  if (!points.length) return;
  ctx.beginPath();
  const [first, ...rest] = points;
  ctx.moveTo(first.x * ctx.canvas.width, first.y * ctx.canvas.height);
  rest.forEach((point) => {
    ctx.lineTo(point.x * ctx.canvas.width, point.y * ctx.canvas.height);
  });
  ctx.closePath();
  ctx.stroke();
}

function checkFaceCentered(landmarks) {
  const nose = landmarks[1];
  const { x, y } = nose;
  const centerOffsetX = Math.abs(x - 0.5);
  const centerOffsetY = Math.abs(y - 0.5);
  return centerOffsetX < faceCenterThreshold && centerOffsetY < faceCenterThreshold;
}

function checkEyesVisible(landmarks) {
  const leftEye = selectLandmarks(landmarks, LEFT_EYE_INDICES);
  const rightEye = selectLandmarks(landmarks, RIGHT_EYE_INDICES);
  if (!leftEye.length || !rightEye.length) return false;

  const leftEyeHeight = verticalEyeDistance(leftEye);
  const rightEyeHeight = verticalEyeDistance(rightEye);

  const balanced = Math.abs(leftEyeHeight - rightEyeHeight) < eyeVisibilityThreshold;
  const openEnough = leftEyeHeight > 0.02 && rightEyeHeight > 0.02;

  return balanced && openEnough;
}

function verticalEyeDistance(eyeLandmarks) {
  const top = eyeLandmarks[1];
  const bottom = eyeLandmarks[5];
  if (!top || !bottom) return 0;
  return Math.abs(top.y - bottom.y);
}

function assessLighting(canvas) {
  if (!canvas) return "checking";
  const ctx = canvas.getContext("2d");
  if (!ctx) return "checking";
  const width = canvas.width;
  const height = canvas.height;
  if (!width || !height) return "checking";

  const sampleSize = 10;
  const stepX = Math.floor(width / sampleSize);
  const stepY = Math.floor(height / sampleSize);

  let total = 0;
  let count = 0;

  for (let y = stepY / 2; y < height; y += stepY) {
    for (let x = stepX / 2; x < width; x += stepX) {
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const brightness = (pixel[0] + pixel[1] + pixel[2]) / 3;
      total += brightness;
      count += 1;
    }
  }

  if (!count) return "checking";
  const avg = total / count;

  if (avg < 60) return "dim";
  if (avg > 200) return "bright";
  return "good";
}
