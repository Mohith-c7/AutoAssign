import { describe, expect, it } from 'vitest';
import { cleanEmailBody, extractDeadlineRegex, removeQuotedText, truncateText } from './parser';

const baseDate = new Date('2026-04-24T10:00:00.000Z');

describe('parser utilities', () => {
  it('strips html tags from email body', () => {
    expect(cleanEmailBody('<p>Hello <b>world</b></p>')).toBe('Hello world');
  });

  it('removes quoted reply lines', () => {
    expect(removeQuotedText('First line\n> quoted line\nFinal line')).toBe(
      'First line\nFinal line'
    );
  });

  it('truncates text to the requested length', () => {
    expect(truncateText('abcdef', 3)).toBe('abc');
  });

  it('parses dd/mm/yyyy deadlines', () => {
    const result = extractDeadlineRegex('Submit by 25/04/2026 at 11:59 pm', 'UTC', baseDate);
    expect(result.confidence).toBeGreaterThan(0.9);
    expect(result.deadline).toContain('2026-04-25');
  });

  it('parses dd-mm-yyyy deadlines', () => {
    const result = extractDeadlineRegex('Deadline 25-04-2026 5 pm', 'UTC', baseDate);
    expect(result.deadline).toContain('2026-04-25');
  });

  it('parses month day deadlines', () => {
    const result = extractDeadlineRegex('Deadline on March 25 at 5 pm', 'UTC', baseDate);
    expect(result.deadline).toContain('2026-03-25');
  });

  it('parses month day with year', () => {
    const result = extractDeadlineRegex('Due April 30, 2026 by 9 am', 'UTC', baseDate);
    expect(result.deadline).toContain('2026-04-30');
  });

  it('parses next weekday deadlines', () => {
    const result = extractDeadlineRegex('Submit before next Monday at 6 pm', 'UTC', baseDate);
    expect(result.deadline).toContain('2026-04-27');
  });

  it('parses by time only deadlines', () => {
    const result = extractDeadlineRegex('Upload by 11:59 pm today', 'UTC', baseDate);
    expect(result.confidence).toBe(0.8);
    expect(result.deadline).toContain('T23:59:00.000Z');
  });

  it('returns null when no deadline exists', () => {
    const result = extractDeadlineRegex('Please review the assignment brief soon', 'UTC', baseDate);
    expect(result.deadline).toBeNull();
  });

  it('does not parse vague text alone', () => {
    const result = extractDeadlineRegex('ASAP please submit it', 'UTC', baseDate);
    expect(result.confidence).toBe(0);
  });

  it('supports lowercase month names', () => {
    const result = extractDeadlineRegex('submit march 2 by 7 pm', 'UTC', baseDate);
    expect(result.deadline).toContain('2026-03-02');
  });

  it('supports uppercase weekday phrasing', () => {
    const result = extractDeadlineRegex('deadline NEXT FRIDAY at 4 pm', 'UTC', baseDate);
    expect(result.deadline).toContain('2026-05-01');
  });

  it('defaults missing time on month dates to end of day', () => {
    const result = extractDeadlineRegex('Due May 2', 'UTC', baseDate);
    expect(result.deadline).toContain('T23:59:00.000Z');
  });

  it('defaults missing time on numeric dates to end of day', () => {
    const result = extractDeadlineRegex('Submit on 02/05/2026', 'UTC', baseDate);
    expect(result.deadline).toContain('T23:59:00.000Z');
  });

  it('uses regex as the source label when matched', () => {
    const result = extractDeadlineRegex('Due 26/04/2026', 'UTC', baseDate);
    expect(result.source).toBe('regex');
  });
});
