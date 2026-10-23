import { 
  parseAmount, 
  calculateFee, 
  calculateReceivedAmount, 
  calculateUsdValue, 
  validateAmount,
  calculateTotalAssetBalance,
  calculateTotalUsdValue,
  calculatePortfolioValue
} from '../amount-logic';
import { Balance, ClaimOptions } from '../../api/client';

describe('amount-logic', () => {
  const mockBalance: Balance = {
    asset: 'USDT',
    decimals: 6,
    available: '100.00',
    pending: '10.0',
    claiming: '5.0',
    usdPrice: '1.0'
  };

  const mockOptions: ClaimOptions = {
    asset: 'USDT',
    minAmount: '10.0',
    fee: '1.0',
    destinations: [{ id: '1', label: 'Wallet' }]
  };

  describe('parseAmount', () => {
    it('should parse valid amount strings', () => {
      expect(parseAmount('10.5')).toBe(10.5);
      expect(parseAmount('0.0001')).toBe(0.0001);
    });

    it('should return 0 for invalid amount strings', () => {
      expect(parseAmount('abc')).toBe(0);
      expect(parseAmount('')).toBe(0);
    });
  });

  describe('calculateFee', () => {
    it('should return 0 if amount is empty or options missing', () => {
      expect(calculateFee('', mockOptions)).toBe(0);
      expect(calculateFee('10', null)).toBe(0);
    });

    it('should return the fee from options', () => {
      expect(calculateFee('10', mockOptions)).toBe(1.0);
    });
  });

  describe('calculateReceivedAmount', () => {
    it('should subtract fee from amount', () => {
      expect(calculateReceivedAmount('10', 1.0)).toBe(9.0);
    });

    it('should not return negative amount', () => {
      expect(calculateReceivedAmount('0.5', 1.0)).toBe(0);
    });

    it('should return 0 if amount is 0', () => {
      expect(calculateReceivedAmount('0', 1.0)).toBe(0);
    });
  });

  describe('calculateUsdValue', () => {
    it('should calculate USD value correctly', () => {
      expect(calculateUsdValue('10', mockBalance)).toBe(10.0);
      expect(calculateUsdValue('10', { ...mockBalance, usdPrice: '0.5' })).toBe(5.0);
    });

    it('should return 0 if balance is missing', () => {
      expect(calculateUsdValue('10', null)).toBe(0);
    });
  });

  describe('validateAmount', () => {
    it('should return valid for correct inputs', () => {
      expect(validateAmount('50', 'USDT', mockBalance, mockOptions)).toEqual({ isValid: true });
    });

    it('should fail if no asset/balance/options', () => {
      expect(validateAmount('50', null, mockBalance, mockOptions).error).toBe('NO_ASSET');
    });

    it('should fail for invalid numbers', () => {
      expect(validateAmount('abc', 'USDT', mockBalance, mockOptions).error).toBe('INVALID_NUMBER');
    });

    it('should fail for zero or negative amounts', () => {
      expect(validateAmount('0', 'USDT', mockBalance, mockOptions).error).toBe('NEGATIVE_AMOUNT');
      expect(validateAmount('-1', 'USDT', mockBalance, mockOptions).error).toBe('NEGATIVE_AMOUNT');
    });

    it('should fail if amount exceeds available balance', () => {
      expect(validateAmount('150', 'USDT', mockBalance, mockOptions).error).toBe('INSUFFICIENT_BALANCE');
    });

    it('should fail if amount is less than minimum', () => {
      expect(validateAmount('5', 'USDT', mockBalance, mockOptions).error).toBe('MIN_AMOUNT');
    });

    it('should fail if amount has too many decimals', () => {
      expect(validateAmount('10.1234567', 'USDT', mockBalance, mockOptions).error).toBe('TOO_MANY_DECIMALS');
    });

    it('should pass if decimals match exactly', () => {
      expect(validateAmount('10.123456', 'USDT', mockBalance, mockOptions)).toEqual({ isValid: true });
    });
  });

  describe('total calculations', () => {
    it('should calculate total asset balance correctly', () => {
      expect(calculateTotalAssetBalance(mockBalance)).toBe(115.0);
    });

    it('should calculate total USD value correctly', () => {
      expect(calculateTotalUsdValue(mockBalance)).toBe(115.0);
      expect(calculateTotalUsdValue({ ...mockBalance, usdPrice: '0.5' })).toBe(57.5);
    });

    it('should calculate portfolio value correctly', () => {
      const balances: Balance[] = [
        mockBalance,
        { ...mockBalance, asset: 'BTC', available: '1', pending: '0', claiming: '0', usdPrice: '50000' }
      ];
      expect(calculatePortfolioValue(balances)).toBe(115.0 + 50000.0);
    });
  });
});
