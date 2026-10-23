import { Balance, ClaimOptions } from "../api/client";

export function parseAmount(amount: string): number {
  const amt = parseFloat(amount);
  return isNaN(amt) ? 0 : amt;
}

export function calculateFee(amount: string, options: ClaimOptions | null): number {
  if (!amount || !options) return 0;
  return parseFloat(options.fee);
}

export function calculateReceivedAmount(amount: string, fee: number): number {
  const amt = parseAmount(amount);
  if (amt === 0) return 0;
  return Math.max(0, amt - fee);
}

export function calculateUsdValue(amount: string, balance: Balance | null): number {
  const amt = parseAmount(amount);
  if (amt === 0 || !balance) return 0;
  return amt * parseFloat(balance.usdPrice);
}

export function calculateTotalAssetBalance(balance: Balance): number {
  return (
    parseAmount(balance.available) +
    parseAmount(balance.pending) +
    parseAmount(balance.claiming)
  );
}

export function calculateTotalUsdValue(balance: Balance): number {
  return calculateTotalAssetBalance(balance) * parseFloat(balance.usdPrice || '0');
}

export function calculatePortfolioValue(balances: Balance[]): number {
  return balances.reduce((acc, balance) => acc + calculateTotalUsdValue(balance), 0);
}

export type ValidationError = 'NO_ASSET' | 'INVALID_NUMBER' | 'NEGATIVE_AMOUNT' | 'INSUFFICIENT_BALANCE' | 'MIN_AMOUNT' | 'TOO_MANY_DECIMALS';

export function validateAmount(
  amount: string,
  selectedAsset: string | null,
  balance: Balance | null,
  options: ClaimOptions | null
): { isValid: boolean; error?: ValidationError } {
  const amt = parseAmount(amount);
  
  if (!selectedAsset || !balance || !options) {
    return { isValid: false, error: 'NO_ASSET' };
  }

  if (isNaN(parseFloat(amount))) {
    return { isValid: false, error: 'INVALID_NUMBER' };
  }

  if (amt <= 0) {
    return { isValid: false, error: 'NEGATIVE_AMOUNT' };
  }

  // Rule: amount <= available
  if (amt > parseFloat(balance.available)) {
    return { isValid: false, error: 'INSUFFICIENT_BALANCE' };
  }

  // Rule: amount >= minAmount
  if (amt < parseFloat(options.minAmount)) {
    return { isValid: false, error: 'MIN_AMOUNT' };
  }

  // Rule: decimals
  const parts = amount.split('.');
  if (parts.length > 1 && parts[1].length > balance.decimals) {
    return { isValid: false, error: 'TOO_MANY_DECIMALS' };
  }

  return { isValid: true };
}
