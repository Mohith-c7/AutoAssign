const statusRank = {
  overdue: 0,
  urgent: 1,
  upcoming: 2,
  pending: 2,
  'needs-review': 3,
  completed: 4,
  snoozed: 5
};

export function sortAssignments(assignments) {
  return [...assignments].sort((left, right) => {
    const leftRank = statusRank[left.status] ?? 99;
    const rightRank = statusRank[right.status] ?? 99;

    if (leftRank !== rightRank) {
      return leftRank - rightRank;
    }

    const leftDeadline = left.deadline ? new Date(left.deadline).getTime() : Number.MAX_SAFE_INTEGER;
    const rightDeadline = right.deadline ? new Date(right.deadline).getTime() : Number.MAX_SAFE_INTEGER;

    return leftDeadline - rightDeadline;
  });
}

