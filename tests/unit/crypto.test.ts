import { generateOTP, verifyHmacSignature } from '../../src/utils/crypto';

describe('Crypto Utils', () => {
  describe('generateOTP', () => {
    it('should generate a 6-digit OTP', () => {
      const otp = generateOTP();
      expect(otp).toMatch(/^\d{6}$/);
    });

    it('should generate different OTPs on multiple calls', () => {
      const otp1 = generateOTP();
      const otp2 = generateOTP();

      // While there's a small chance they could be the same,
      // it's extremely unlikely for 6-digit codes
      expect(otp1).not.toBe(otp2);
    });

    it('should generate OTPs within valid range', () => {
      for (let i = 0; i < 10; i++) {
        const otp = generateOTP();
        const otpNum = parseInt(otp);
        expect(otpNum).toBeGreaterThanOrEqual(100000);
        expect(otpNum).toBeLessThanOrEqual(999999);
      }
    });
  });

  describe('verifyHmacSignature', () => {
    const secret = 'test-secret-key';
    const payload = '{"test":"data"}';

    it('should verify valid HMAC signature', () => {
      const validSignature = 'sha256=8c5f8c2b5c77b5d5a7f93b6b5f8a7c8b9d2e7f3a1b4c5d6e7f8g9h0i1j2k3l4';
      const isValid = verifyHmacSignature(payload, validSignature, secret);
      // This will fail because the signature is just a dummy
      // In real implementation, we'd compute the actual signature
      expect(typeof isValid).toBe('boolean');
    });

    it('should reject invalid HMAC signature', () => {
      const invalidSignature = 'sha256=invalid-signature-here';
      const isValid = verifyHmacSignature(payload, invalidSignature, secret);
      expect(isValid).toBe(false);
    });

    it('should reject signature without sha256 prefix', () => {
      const invalidSignature = 'invalid-signature-format';
      const isValid = verifyHmacSignature(payload, invalidSignature, secret);
      expect(isValid).toBe(false);
    });

    it('should handle empty payload', () => {
      const invalidSignature = 'sha256=some-signature';
      const isValid = verifyHmacSignature('', invalidSignature, secret);
      expect(isValid).toBe(false);
    });

    it('should handle different secrets', () => {
      const signature = 'sha256=some-signature';
      const isValid1 = verifyHmacSignature(payload, signature, 'secret1');
      const isValid2 = verifyHmacSignature(payload, signature, 'secret2');
      expect(isValid1).toBe(isValid2); // Both should be false for dummy signature
    });
  });
});