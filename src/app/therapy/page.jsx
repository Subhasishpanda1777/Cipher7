import TherapyHero from "@/components/therapy/TherapyHero";
import MovingDotGame from "@/components/therapy/MovingDotGame";
import ContrastChallenge from "@/components/therapy/ContrastChallenge";
import ObjectMatchGame from "@/components/therapy/ObjectMatchGame";
import { loadTherapyProgress } from "@/lib/therapyProgress";

function formatDate(dateString) {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  return date.toLocaleString();
}

export default function TherapyPage() {
  const progress = loadTherapyProgress();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16">
      <TherapyHero />

      <section
        id="progress"
        className="grid gap-6 rounded-[var(--radius-card)] border border-white/60 bg-white/95 p-6 shadow-xl backdrop-blur md:grid-cols-3"
      >
        <div>
          <h2 className="font-rounded text-xl font-semibold text-[color:var(--color-emphasis)]">
            Progress snapshot
          </h2>
          <p className="mt-2 text-sm text-[color:var(--color-muted)]">
            Track best scores and session streaks to keep therapy fun and goal-oriented.
          </p>
          <p className="mt-4 text-xs text-[color:var(--color-muted)]">
            Last updated: {formatDate(progress.lastUpdated)}
          </p>
        </div>
        <ProgressCard
          title="Moving dot"
          value={`${progress.movingDot?.highScore ?? 0} hits`}
          subtitle={`${progress.movingDot?.totalSessions ?? 0} sessions`}
        />
        <ProgressCard
          title="Contrast challenge"
          value={`Best streak ${progress.contrastChallenge?.bestStreak ?? 0}`}
          subtitle={`${progress.contrastChallenge?.totalSessions ?? 0} sessions`}
        />
        <ProgressCard
          title="Object match"
          value={
            progress.objectMatch?.bestTime
              ? `${(progress.objectMatch.bestTime / 1000).toFixed(1)}s`
              : "--"
          }
          subtitle={`${progress.objectMatch?.totalSessions ?? 0} sessions`}
        />
      </section>

      <section
        id="games"
        className="grid gap-6 md:grid-cols-2"
      >
        <MovingDotGame />
        <ContrastChallenge />
        <ObjectMatchGame />
        <GuidanceCard />
      </section>
    </div>
  );
}

function ProgressCard({ title, value, subtitle }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-[color:var(--color-primary)]/30 bg-[#f5fbff] p-5">
      <p className="text-sm text-[color:var(--color-muted)]">{title}</p>
      <p className="mt-2 font-rounded text-2xl font-semibold text-[color:var(--color-emphasis)]">
        {value}
      </p>
      <p className="mt-1 text-xs text-[color:var(--color-muted)]">{subtitle}</p>
    </div>
  );
}

function GuidanceCard() {
  return (
    <div className="space-y-4 rounded-[var(--radius-card)] border border-white/60 bg-white/95 p-6 shadow-xl backdrop-blur">
      <h3 className="font-rounded text-xl font-semibold text-[color:var(--color-emphasis)]">
        Therapy tips for guardians
      </h3>
      <ul className="space-y-3 text-sm text-[color:var(--color-muted)]">
        <li>• Schedule short, daily sessions instead of longer infrequent ones.</li>
        <li>• Encourage both eyes to work together—avoid covering an eye unless prescribed.</li>
        <li>• Celebrate achievements and streaks to motivate consistent participation.</li>
        <li>• Share progress summaries with your clinician for tailored advice.</li>
      </ul>
    </div>
  );
}
