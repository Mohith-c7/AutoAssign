import { describe, expect, it } from 'vitest';
import { sortAssignments } from './sortAssignments';

describe('sortAssignments', () => {
  it('sorts overdue items first and then by deadline ascending', () => {
    const input = [
      {
        id: '3',
        status: 'upcoming',
        deadline: '2026-05-02T10:00:00.000Z'
      },
      {
        id: '1',
        status: 'overdue',
        deadline: '2026-04-20T10:00:00.000Z'
      },
      {
        id: '2',
        status: 'urgent',
        deadline: '2026-04-25T10:00:00.000Z'
      }
    ];

    expect(sortAssignments(input).map((item) => item.id)).toEqual(['1', '2', '3']);
  });
});

