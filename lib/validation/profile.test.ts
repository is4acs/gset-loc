import { describe, expect, it } from 'vitest';
import { profileSchema } from './profile';

const baseIndividual = {
  firstName: 'Jean',
  lastName: 'Durand',
  phone: '',
  customerType: 'INDIVIDUAL' as const,
  companyName: '',
  siret: '',
};

describe('profileSchema', () => {
  it('accepts a minimal individual profile', () => {
    expect(profileSchema.safeParse(baseIndividual).success).toBe(true);
  });

  it('accepts a phone in French format', () => {
    expect(
      profileSchema.safeParse({ ...baseIndividual, phone: '+594 6 94 12 34 56' }).success,
    ).toBe(true);
  });

  it('rejects an unparseable phone', () => {
    expect(profileSchema.safeParse({ ...baseIndividual, phone: 'phone@' }).success).toBe(false);
  });

  it('accepts a PRO profile with companyName + 14-digit SIRET', () => {
    expect(
      profileSchema.safeParse({
        ...baseIndividual,
        customerType: 'PRO',
        companyName: 'GSET Guyane SARL',
        siret: '12345678901234',
      }).success,
    ).toBe(true);
  });

  it('rejects a PRO profile missing companyName', () => {
    expect(
      profileSchema.safeParse({
        ...baseIndividual,
        customerType: 'PRO',
        companyName: '',
        siret: '12345678901234',
      }).success,
    ).toBe(false);
  });

  it('rejects a PRO profile with non-14-digit SIRET', () => {
    expect(
      profileSchema.safeParse({
        ...baseIndividual,
        customerType: 'PRO',
        companyName: 'X',
        siret: '123',
      }).success,
    ).toBe(false);
  });

  it('does NOT require companyName/siret for INDIVIDUAL', () => {
    expect(
      profileSchema.safeParse({
        ...baseIndividual,
        customerType: 'INDIVIDUAL',
        companyName: '',
        siret: '',
      }).success,
    ).toBe(true);
  });
});
