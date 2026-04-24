export default function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-6 text-center text-slate-300">
      <p className="text-sm font-semibold text-white">No assignments detected</p>
      <p className="mt-2 text-xs leading-5 text-slate-400">
        Once Gmail sync is connected, assignments and deadlines will appear here.
      </p>
    </div>
  );
}

