import EmptyState from './EmptyState';
import FilterBar from './FilterBar';
import Header from './Header';
import AssignmentCard from './AssignmentCard';
import Footer from './Footer';
import { sortAssignments } from '../utils/sortAssignments';

export default function Dashboard({ assignments, syncStatus, lastSyncResults }) {
  const sortedAssignments = sortAssignments(assignments);

  return (
    <div className="flex h-full flex-col bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.35),_transparent_45%),linear-gradient(180deg,_#0f172a_0%,_#111827_100%)]">
      <Header syncStatus={syncStatus} />
      <FilterBar />
      <main className="flex-1 overflow-y-auto px-4 pb-4">
        {syncStatus ? (
          <div className="mb-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
            <p className="font-semibold text-white">{syncStatus.message}</p>
            <p className="mt-1 text-slate-400">
              Updated {new Date(syncStatus.updatedAt).toLocaleTimeString('en-IN')}
            </p>
          </div>
        ) : null}

        {lastSyncResults?.length ? (
          <div className="mb-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-50">
            <p className="font-semibold">Latest Gmail fetch preview</p>
            <p className="mt-1 line-clamp-2 text-emerald-100/80">
              {lastSyncResults[0].subject || 'No subject'} from{' '}
              {lastSyncResults[0].from || 'Unknown sender'}
            </p>
          </div>
        ) : null}

        <section className="space-y-3">
          {sortedAssignments.length === 0 ? (
            <EmptyState />
          ) : (
            sortedAssignments.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
