const weekdayMap = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6
};

function clone(date) {
  return new Date(date.getTime());
}

function nextWeekday(referenceDate, weekdayName) {
  const targetDay = weekdayMap[weekdayName.toLowerCase()];

  if (targetDay === undefined) {
    return null;
  }

  const result = clone(referenceDate);
  const currentDay = result.getDay();
  let diff = targetDay - currentDay;

  if (diff <= 0) {
    diff += 7;
  }

  result.setDate(result.getDate() + diff);
  return result;
}

export function parseRelativeDate(text, timezone = 'UTC', now = new Date()) {
  void timezone;

  const normalized = text.toLowerCase();

  if (normalized.includes('today')) {
    return clone(now);
  }

  if (normalized.includes('tomorrow')) {
    const tomorrow = clone(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }

  const nextWeekdayMatch = normalized.match(/next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);

  if (nextWeekdayMatch) {
    return nextWeekday(now, nextWeekdayMatch[1]);
  }

  return null;
}

export function normalizeToUTC(date) {
  return date ? new Date(date).toISOString() : null;
}

export function formatDeadline(timestamp, timezone = 'UTC') {
  if (!timestamp) {
    return 'No deadline';
  }

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: timezone,
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(timestamp));
}

export function getTimeUntilDeadline(timestamp) {
  if (!timestamp) {
    return null;
  }

  return new Date(timestamp).getTime() - Date.now();
}

export function isOverdue(timestamp) {
  return timestamp ? new Date(timestamp).getTime() < Date.now() : false;
}
