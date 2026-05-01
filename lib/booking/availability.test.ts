import { describe, expect, it } from 'vitest';
import { SLOT_DURATION_MS } from './availability';

describe('SLOT_DURATION_MS', () => {
  it('HOUR_1 = 1 hour in ms', () => {
    expect(SLOT_DURATION_MS.HOUR_1).toBe(3_600_000);
  });

  it('HOUR_2 = 2 hours in ms', () => {
    expect(SLOT_DURATION_MS.HOUR_2).toBe(7_200_000);
  });

  it('HALF_DAY = 4 hours in ms', () => {
    expect(SLOT_DURATION_MS.HALF_DAY).toBe(14_400_000);
  });

  it('DAY = 8 hours in ms', () => {
    expect(SLOT_DURATION_MS.DAY).toBe(28_800_000);
  });

  it('does not pre-define MULTI_DAY (depends on day count)', () => {
    expect(SLOT_DURATION_MS.MULTI_DAY).toBeUndefined();
  });
});
