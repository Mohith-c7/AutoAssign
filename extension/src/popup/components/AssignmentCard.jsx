import { formatDeadlineLabel, getStatusMeta } from '../utils/assignmentPresentation';

export default function AssignmentCard({ assignment }) {
  const statusMeta = getStatusMeta(assignment);

  return (
    <article
      className={`rounded-2xl border p-4 shadow-card backdrop-blur ${statusMeta.cardClass}`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${statusMeta.badgeClass}`}>
              {statusMeta.label}
            </span>
            <span className="text-[11px] text-slate-300">
              Confidence {Math.round(assignment.confidence * 100)}%
            </span>
          </div>
          <h2 className="text-sm font-semibold text-white">{assignment.title}</h2>
          <p className="mt-1 text-xs text-slate-300">{assignment.subject}</p>
        </div>
        <div className={`h-3 w-3 rounded-full ${statusMeta.priorityDotClass}`} />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 text-xs text-slate-200">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-slate-400">
            Deadline
          </p>
          <p className="mt-1">{formatDeadlineLabel(assignment.deadline)}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-slate-400">
            Priority
          </p>
          <p className="mt-1 capitalize">{assignment.priority}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-900">
          Mark Done
        </button>
        <button className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white">
          Snooze
        </button>
        <button className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white">
          Calendar
        </button>
        <button className="rounded-full border border-white/15 bg-transparent px-3 py-1.5 text-xs font-medium text-slate-200">
          View Email
        </button>
      </div>
    </article>
  );
}

