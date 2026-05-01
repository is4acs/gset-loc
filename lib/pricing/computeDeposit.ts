import { DEPOSIT_MULTIPLIER } from './constants';

export type TrustLevel = 'STANDARD' | 'CONFIRMED' | 'PREMIUM';

export interface ComputeDepositInput {
  baseDeposit: number;
  trustLevel: TrustLevel;
  requiresOperator: boolean;
}

/**
 * Returns the deposit amount in cents to pre-authorize on the customer's card.
 *
 * Rules (see CLAUDE.md > "Caution adaptative"):
 * - Equipment with operator (mini-pelle, nacelle, etc.) → 0
 * - Otherwise: baseDeposit × multiplier(trustLevel)
 */
export function computeDeposit(input: ComputeDepositInput): number {
  if (input.requiresOperator) return 0;
  if (!Number.isInteger(input.baseDeposit) || input.baseDeposit < 0) {
    throw new Error('baseDeposit must be a non-negative integer (cents).');
  }
  const multiplier = DEPOSIT_MULTIPLIER[input.trustLevel];
  return Math.round(input.baseDeposit * multiplier);
}
