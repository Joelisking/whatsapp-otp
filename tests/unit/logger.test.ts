import { maskPhoneNumber } from '../../src/utils/logger';

describe('Logger Utils', () => {
  describe('maskPhoneNumber', () => {
    it('should mask phone numbers correctly', () => {
      expect(maskPhoneNumber('+1234567890')).toBe('+******7890');
      expect(maskPhoneNumber('1234567890')).toBe('******7890');
      expect(maskPhoneNumber('+44123456789')).toBe('+*******6789');
    });

    it('should handle short phone numbers', () => {
      expect(maskPhoneNumber('1234')).toBe('****');
      expect(maskPhoneNumber('123')).toBe('****');
      expect(maskPhoneNumber('12')).toBe('****');
    });

    it('should handle empty or undefined input', () => {
      expect(maskPhoneNumber('')).toBe('****');
    });

    it('should preserve last 4 digits for longer numbers', () => {
      const longNumber = '+123456789012345';
      const masked = maskPhoneNumber(longNumber);
      expect(masked.endsWith('2345')).toBe(true);
      expect(masked.startsWith('+')).toBe(true);
    });
  });
});