import { describe, expect, it } from 'vitest';
import { draftToValues, EMPTY_MEASUREMENTS_DRAFT } from './measurementsForm';

describe('draftToValues', () => {
  it('sends nothing when nothing was typed', () => {
    expect(draftToValues(EMPTY_MEASUREMENTS_DRAFT)).toEqual({});
  });

  it('keeps the filled fields and reads French decimals', () => {
    expect(draftToValues({ ...EMPTY_MEASUREMENTS_DRAFT, weightKg: '78,5', pushUps: '12' })).toEqual(
      {
        weightKg: 78.5,
        pushUps: 12,
      },
    );
  });

  it('turns minutes and seconds into seconds for the 1 km walk', () => {
    expect(
      draftToValues({ ...EMPTY_MEASUREMENTS_DRAFT, brisk1kmMinutes: '9', brisk1kmSeconds: '30' }),
    ).toEqual({ brisk1kmSeconds: 570 });
  });
});
