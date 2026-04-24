const tabs = ['Urgent', 'Upcoming', 'Overdue', 'Completed'];

export default function FilterBar() {
  return (
    <div className="flex h-[50px] items-center gap-2 border-b border-white/10 px-4">
      <div className="flex flex-1 gap-2 overflow-x-auto pb-1">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              index === 0
                ? 'bg-indigo-500 text-white'
                : 'bg-white/5 text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <select className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-200 outline-none">
        <option>All subjects</option>
      </select>
      <input
        className="w-24 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200 outline-none placeholder:text-slate-500"
        placeholder="Search"
      />
    </div>
  );
}
