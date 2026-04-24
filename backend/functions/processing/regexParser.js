function applyMeridiem(hour, meridiem) {
  if (!meridiem) {
    return hour;
  }

  const normalized = meridiem.toLowerCase();

  if (normalized === 'pm' && hour < 12) {
    return hour + 12;
  }

  if (normalized === 'am' && hour === 12) {
    return 0;
  }

  return hour;
}

export function extractDeadlineRegex(text, now = new Date()) {
  const normalized = text.replace(/\s+/g, ' ').trim();
  const explicitDatePattern =
    /\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})(?:\s*(?:at|by)?\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?)?/i;
  const monthDatePattern =
    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:,\s*(\d{4}))?(?:\s*(?:at|by)?\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?)?/i;
  const nextWeekdayPattern =
    /\bnext\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)(?:\s*(?:at|by)?\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?)?/i;

  const explicitMatch = normalized.match(explicitDatePattern);

  if (explicitMatch) {
    const [, day, month, year, hour, minute, meridiem] = explicitMatch;
    const fullYear = year.length === 2 ? `20${year}` : year;
    const date = new Date(Date.UTC(
      Number(fullYear),
      Number(month) - 1,
      Number(day),
      applyMeridiem(Number(hour || 23), meridiem),
      Number(minute || (hour ? 0 : 59))
    ));

    return {
      deadline: date.toISOString(),
      confidence: 0.95
    };
  }

  const monthMatch = normalized.match(monthDatePattern);

  if (monthMatch) {
    const [, monthName, day, year, hour, minute, meridiem] = monthMatch;
    const monthIndex = [
      'january',
      'february',
      'march',
      'april',
      'may',
      'june',
      'july',
      'august',
      'september',
      'october',
      'november',
      'december'
    ].indexOf(monthName.toLowerCase());
    const date = new Date(Date.UTC(
      Number(year || now.getFullYear()),
      monthIndex,
      Number(day),
      applyMeridiem(Number(hour || 23), meridiem),
      Number(minute || (hour ? 0 : 59))
    ));

    return {
      deadline: date.toISOString(),
      confidence: 0.92
    };
  }

  const weekdayMatch = normalized.match(nextWeekdayPattern);

  if (weekdayMatch) {
    const [, weekday, hour, minute, meridiem] = weekdayMatch;
    const targetDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(
      weekday.toLowerCase()
    );
    const date = new Date(now);
    let diff = targetDay - date.getDay();

    if (diff <= 0) {
      diff += 7;
    }

    date.setDate(date.getDate() + diff);
    date.setHours(
      applyMeridiem(Number(hour || 23), meridiem),
      Number(minute || (hour ? 0 : 59)),
      0,
      0
    );

    return {
      deadline: date.toISOString(),
      confidence: 0.85
    };
  }

  return {
    deadline: null,
    confidence: 0
  };
}
