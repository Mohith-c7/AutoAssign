export function formatDeadlineLabel(deadline) {
  if (!deadline) {
    return 'Needs manual review';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(deadline));
}

export function getStatusMeta(assignment) {
  if (assignment.status === 'overdue') {
    return {
      label: 'Overdue',
      badgeClass: 'bg-red-500/20 text-red-100',
      cardClass: 'border-red-500/30 bg-red-500/10',
      priorityDotClass: 'bg-red-500'
    };
  }

  if (assignment.status === 'completed') {
    return {
      label: 'Completed',
      badgeClass: 'bg-emerald-500/20 text-emerald-100',
      cardClass: 'border-emerald-500/30 bg-emerald-500/10',
      priorityDotClass: 'bg-emerald-500'
    };
  }

  if (assignment.needsReview || assignment.status === 'needs-review') {
    return {
      label: 'Needs Review',
      badgeClass: 'bg-amber-500/20 text-amber-100',
      cardClass: 'border-amber-400/30 bg-amber-500/10',
      priorityDotClass: 'bg-amber-400'
    };
  }

  if (assignment.status === 'urgent') {
    return {
      label: 'Urgent',
      badgeClass: 'bg-red-500/20 text-red-100',
      cardClass: 'border-red-400/30 bg-slate-900/80',
      priorityDotClass: 'bg-red-500'
    };
  }

  return {
    label: 'Upcoming',
    badgeClass: 'bg-blue-500/20 text-blue-100',
    cardClass: 'border-white/10 bg-slate-900/80',
    priorityDotClass: assignment.priority === 'high' ? 'bg-red-500' : 'bg-amber-400'
  };
}

