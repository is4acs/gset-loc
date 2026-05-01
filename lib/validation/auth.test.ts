import { describe, expect, it } from 'vitest';
import { loginSchema, requestPasswordResetSchema, signupSchema } from './auth';

describe('signupSchema', () => {
  const valid = {
    email: 'jean@example.com',
    password: 'Aaaaaaa1aa',
    firstName: 'Jean',
    lastName: 'Durand',
    customerType: 'INDIVIDUAL' as const,
  };

  it('accepts a well-formed payload', () => {
    expect(signupSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects an invalid email', () => {
    const r = signupSchema.safeParse({ ...valid, email: 'not-an-email' });
    expect(r.success).toBe(false);
  });

  it('rejects passwords shorter than 10 chars', () => {
    expect(signupSchema.safeParse({ ...valid, password: 'Aa1aaaaa' }).success).toBe(false);
  });

  it('requires uppercase, lowercase and digit', () => {
    expect(signupSchema.safeParse({ ...valid, password: 'aaaaaaaaaa1' }).success).toBe(false); // no upper
    expect(signupSchema.safeParse({ ...valid, password: 'AAAAAAAAAA1' }).success).toBe(false); // no lower
    expect(signupSchema.safeParse({ ...valid, password: 'Aaaaaaaaaa' }).success).toBe(false); // no digit
    expect(signupSchema.safeParse({ ...valid, password: 'Aaaaaaaaa1' }).success).toBe(true);
  });

  it('rejects unknown customerType', () => {
    expect(signupSchema.safeParse({ ...valid, customerType: 'OTHER' }).success).toBe(false);
  });

  it('requires non-empty first/last name', () => {
    expect(signupSchema.safeParse({ ...valid, firstName: '' }).success).toBe(false);
    expect(signupSchema.safeParse({ ...valid, lastName: '' }).success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('accepts any non-empty password (no strength check at login)', () => {
    expect(loginSchema.safeParse({ email: 'a@b.fr', password: 'x' }).success).toBe(true);
  });

  it('rejects empty password', () => {
    expect(loginSchema.safeParse({ email: 'a@b.fr', password: '' }).success).toBe(false);
  });
});

describe('requestPasswordResetSchema', () => {
  it('accepts a valid email', () => {
    expect(requestPasswordResetSchema.safeParse({ email: 'a@b.fr' }).success).toBe(true);
  });

  it('rejects a non-email', () => {
    expect(requestPasswordResetSchema.safeParse({ email: 'nope' }).success).toBe(false);
  });
});
