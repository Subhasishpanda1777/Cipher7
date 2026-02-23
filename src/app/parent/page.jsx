'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { fetchCurrentUser } from "@/lib/authClient";
import { downloadParentReport, fetchUserScreenings } from "@/lib/api";
import { loadTherapyProgress } from "@/lib/therapyProgress";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function ParentDashboardPage() {
  const [user, setUser] = useState(null);
  const [screenings, setScreenings] = useState([]);
  const [status, setStatus] = useState({ state: "loading", message: "Loading your dashboard…" });
  const [reportStatus, setReportStatus] = useState({ state: "idle", message: "" });

  useEffect(() => {
    const loadData = async () => {
      try {
        const me = await fetchCurrentUser();
        setUser(me.data);
        const screeningResponse = await fetchUserScreenings(me.data.id);
        setScreenings(screeningResponse.data || []);
        setStatus({ state: "ready", message: "" });
      } catch (error) {
        setStatus({ state: "error", message: error.message || "Unable to load dashboard." });
      }
    };

    loadData();
  }, []);

  const therapyProgress = useMemo(() => loadTherapyProgress(), []);

  const trendData = useMemo(() => {
    const sorted = [...screenings].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    return {
      labels: sorted.map((item) => new Date(item.createdAt).toLocaleDateString()),
      datasets: [
        {
          label: "Risk Score",
          data: sorted.map((item) => (item.finalRiskScore ?? 0) * 100),
          borderColor: "#3AC6A8",
          backgroundColor: "rgba(58, 198, 168, 0.2)",
          tension: 0.3,
        },
      ],
    };
  }, [screenings]);

  const handleDownloadReport = async () => {
    setReportStatus({ state: "loading", message: "Preparing PDF…" });
    try {
      const blob = await downloadParentReport();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "visionai-parent-summary.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setReportStatus({ state: "success", message: "Report downloaded." });
    } catch (error) {
      setReportStatus({ state: "error", message: error.message });
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16">
      <header className="glass-panel p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-rounded text-3xl font-semibold text-[color:var(--color-emphasis)]">
              Parent Dashboard
            </h1>
            <p className="text-sm text-[color:var(--color-muted)]">
              Monitor screenings, therapy streaks, and download reports for your next ophthalmologist visit.
            </p>
          </div>
          <div className="glass-badge text-sm">
            {user ? `Welcome back, ${user.firstName}` : ""}
          </div>
        </div>
      </header>

      {status.state === "loading" && (
        <p className="glass-card glass-card--subtle p-4 text-sm text-[color:var(--color-muted)]">
          {status.message}
        </p>
      )}
      {status.state === "error" && (
        <p className="glass-card p-4 text-sm text-red-700">
          {status.message}
        </p>
      )}

      {status.state === "ready" && (
        <>
          <section className="grid gap-6 md:grid-cols-3">
            <StatCard
              title="Screenings completed"
              value={screenings.length}
              description="Total VisionAI screenings run for your child"
            />
            <StatCard
              title="Therapy sessions"
              value={therapyProgress.movingDot.totalSessions + therapyProgress.contrastChallenge.totalSessions + therapyProgress.objectMatch.totalSessions}
              description="Sessions tracked across all games"
            />
            <StatCard
              title="Best streak"
              value={therapyProgress.contrastChallenge.bestStreak ?? 0}
              description="Longest contrast challenge streak"
            />
          </section>

          <section className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
            <div className="glass-panel p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-rounded text-xl font-semibold text-[color:var(--color-emphasis)]">
                    Risk trend
                  </h2>
                  <p className="text-sm text-[color:var(--color-muted)]">
                    Track how VisionAI classifies risk across recent screenings.
                  </p>
                </div>
                <div className="glass-badge text-xs">
                  Newest score: {screenings[0] ? `${(screenings[0].finalRiskScore * 100).toFixed(0)}%` : "--"}
                </div>
              </div>
              <div className="mt-6">
                {screenings.length > 0 ? (
                  <Line
                    data={trendData}
                    options={{
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100,
                          ticks: {
                            callback: (value) => `${value}%`,
                          },
                        },
                      },
                    }}
                  />
                ) : (
                  <p className="glass-card glass-card--subtle border border-dashed border-[color:var(--color-primary)]/40 p-6 text-sm text-[color:var(--color-muted)]">
                    Run your first screening to see risk trends.
                  </p>
                )}
              </div>
            </div>

            <div className="glass-panel p-6">
              <h2 className="font-rounded text-xl font-semibold text-[color:var(--color-emphasis)]">
                Therapy summary
              </h2>
              <ul className="mt-4 space-y-3 text-sm text-[color:var(--color-muted)]">
                <li>• Moving dot high score: {therapyProgress.movingDot.highScore ?? 0} hits</li>
                <li>• Object match best time: {therapyProgress.objectMatch.bestTime ? `${(therapyProgress.objectMatch.bestTime / 1000).toFixed(1)}s` : "--"}</li>
                <li>• Total sessions: {therapyProgress.movingDot.totalSessions + therapyProgress.contrastChallenge.totalSessions + therapyProgress.objectMatch.totalSessions}</li>
                <li>• Last updated: {formatDate(therapyProgress.lastUpdated)}</li>
              </ul>
              <div className="mt-6 space-y-3 text-sm">
                <button
                  type="button"
                  onClick={handleDownloadReport}
                  disabled={reportStatus.state === "loading"}
                  className={`inline-flex w-full items-center justify-center ${
                    reportStatus.state === "loading" ? "outline-button" : "cta-button"
                  } disabled:cursor-not-allowed disabled:bg-[color:var(--color-muted)]/40 disabled:text-[color:var(--color-muted)]`}
                >
                  {reportStatus.state === "loading" ? "Generating PDF…" : "Download PDF report"}
                </button>
                <Link
                  href="/therapy"
                  className="outline-button inline-flex w-full justify-center"
                >
                  Go to therapy games
                </Link>
                {reportStatus.state === "error" && (
                  <p className="glass-card glass-card--subtle px-4 py-2 text-xs text-red-700">
                    {reportStatus.message}
                  </p>
                )}
                {reportStatus.state === "success" && (
                  <p className="glass-chip px-4 py-2 text-xs text-[color:var(--color-secondary)]">
                    {reportStatus.message}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="glass-panel p-6">
            <h2 className="font-rounded text-xl font-semibold text-[color:var(--color-emphasis)]">
              Screening history
            </h2>
            <div className="mt-4 overflow-x-auto rounded-2xl border border-[color:var(--color-primary)]/30 bg-white/60 backdrop-blur">
              <table className="min-w-full divide-y divide-[color:var(--color-primary)]/18 text-sm">
                <thead className="bg-[color:var(--color-primary)]/12 text-left text-[color:var(--color-emphasis)]">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Alignment</th>
                    <th className="px-4 py-3">Tracking</th>
                    <th className="px-4 py-3">Contrast</th>
                    <th className="px-4 py-3">Risk</th>
                    <th className="px-4 py-3">Classification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[color:var(--color-primary)]/15 text-[color:var(--color-muted)]">
                  {screenings.map((screen) => (
                    <tr key={screen.id}>
                      <td className="px-4 py-3">{new Date(screen.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-3">{(screen.alignmentScore * 100).toFixed(0)}%</td>
                      <td className="px-4 py-3">{(screen.trackingScore * 100).toFixed(0)}%</td>
                      <td className="px-4 py-3">{(screen.contrastScore * 100).toFixed(0)}%</td>
                      <td className="px-4 py-3">{(screen.finalRiskScore * 100).toFixed(0)}%</td>
                      <td className="px-4 py-3 capitalize">{screen.classification}</td>
                    </tr>
                  ))}
                  {screenings.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-[color:var(--color-muted)]">
                        No screenings logged yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({ title, value, description }) {
  return (
    <div className="glass-card glass-card--subtle p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-muted)]/80">{title}</p>
      <p className="mt-3 font-rounded text-3xl font-semibold text-[color:var(--color-emphasis)]">{value}</p>
      <p className="mt-2 text-xs text-[color:var(--color-muted)]">{description}</p>
    </div>
  );
}

function formatDate(dateString) {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  return date.toLocaleString();
}
