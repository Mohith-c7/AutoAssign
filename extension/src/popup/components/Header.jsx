export default function Header({ syncStatus }) {
  async function handleRefresh() {
    await chrome.runtime.sendMessage({ type: 'SYNC_NOW' });
  }

  return (
    <header className="flex h-[60px] items-center justify-between border-b border-white/10 px-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-indigo-200/80">
          AutoAssign AI
        </p>
        <h1 className="text-lg font-semibold text-white">Assignment Radar</h1>
        <p className="text-[11px] text-slate-400">
          {syncStatus?.stage === 'syncing' ? 'Sync in progress' : 'Gmail sync ready'}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleRefresh}
          className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/10"
        >
          Refresh
        </button>
        <button className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/10">
          Settings
        </button>
      </div>
    </header>
  );
}
