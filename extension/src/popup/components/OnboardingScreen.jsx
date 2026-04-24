export default function OnboardingScreen({ onConnect, error }) {
  return (
    <div className="flex h-full flex-col justify-between bg-[linear-gradient(180deg,_#0f172a_0%,_#1e1b4b_100%)] p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-indigo-200/80">
          AutoAssign AI
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white">
          Connect Gmail, stay ahead of deadlines.
        </h1>
        <p className="mt-4 text-sm leading-6 text-slate-300">
          We only use Gmail access to read assignment-related emails, extract
          deadlines, and show reminders inside the extension.
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <ul className="space-y-2 text-sm text-slate-200">
          <li>Reads assignment and deadline emails from Gmail.</li>
          <li>Stores reminders and extracted deadlines in your workspace.</li>
          <li>Never stores Gmail OAuth tokens in Firestore.</li>
        </ul>
        {error ? (
          <p className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error}
          </p>
        ) : null}
        <button
          onClick={onConnect}
          className="mt-5 w-full rounded-2xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white"
        >
          Connect Gmail
        </button>
      </div>
    </div>
  );
}
