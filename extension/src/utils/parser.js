import { normalizeToUTC, parseRelativeDate } from './dateUtils';

const monthNames =
  'january february march april may june july august september october november december';

export function cleanEmailBody(input) {
  return removeQuotedText(
    input
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

export function extractDeadlineRegex() {
  const text = arguments[0] ?? '';
  const timezone = arguments[1] ?? 'UTC';
  const now = arguments[2] ?? new Date();
  const normalized = text.replace(/\s+/g, ' ').trim();

  const explicitDatePattern =
    /\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})(?:\s*(?:at|by)?\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?)?/i;
  const monthDatePattern = new RegExp(
    `\\b(${monthNames.split(' ').join('|')})\\s+(\\d{1,2})(?:,\\s*(\\d{4}))?(?:\\s*(?:at|by)?\\s*(\\d{1,2})(?::(\\d{2}))?\\s*(am|pm)?)?`,
    'i'
  );
  const nextWeekdayPattern =
    /\bnext\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)(?:\s*(?:at|by)?\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?)?/i;
  const timeOnlyPattern = /\bby\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i;

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
      deadline: normalizeToUTC(date),
      confidence: 0.95,
      source: 'regex'
    };
  }

  const monthDateMatch = normalized.match(monthDatePattern);

  if (monthDateMatch) {
    const [, monthName, day, year, hour, minute, meridiem] = monthDateMatch;
    const monthIndex = monthNames.split(' ').indexOf(monthName.toLowerCase());
    const fullYear = Number(year || now.getFullYear());
    const date = new Date(Date.UTC(
      fullYear,
      monthIndex,
      Number(day),
      applyMeridiem(Number(hour || 23), meridiem),
      Number(minute || (hour ? 0 : 59))
    ));

    return {
      deadline: normalizeToUTC(date),
      confidence: 0.92,
      source: 'regex'
    };
  }

  const relativeDateMatch = normalized.match(nextWeekdayPattern);

  if (relativeDateMatch) {
    const [, weekday, hour, minute, meridiem] = relativeDateMatch;
    const date = parseRelativeDate(`next ${weekday}`, timezone, now);

    if (date) {
      date.setHours(
        applyMeridiem(Number(hour || 23), meridiem),
        Number(minute || (hour ? 0 : 59)),
        0,
        0
      );

      return {
        deadline: normalizeToUTC(date),
        confidence: 0.85,
        source: 'regex'
      };
    }
  }

  const timeOnlyMatch = normalized.match(timeOnlyPattern);

  if (timeOnlyMatch) {
    const [, hour, minute, meridiem] = timeOnlyMatch;
    const date = new Date(now);
    date.setHours(
      applyMeridiem(Number(hour), meridiem),
      Number(minute || 0),
      0,
      0
    );

    return {
      deadline: new Date(
        Date.UTC(
          date.getUTCFullYear(),
          date.getUTCMonth(),
          date.getUTCDate(),
          applyMeridiem(Number(hour), meridiem),
          Number(minute || 0),
          0,
          0
        )
      ).toISOString(),
      confidence: 0.8,
      source: 'regex'
    };
  }

  return { deadline: null, confidence: 0, source: 'regex' };
}

export function removeQuotedText(input) {
  return input
    .split('\n')
    .filter((line) => !line.trim().startsWith('>'))
    .join('\n')
    .replace(/--\s.*$/gms, '')
    .trim();
}

export function truncateText(input, maxLength = 2000) {
  return input.slice(0, maxLength);
}

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
