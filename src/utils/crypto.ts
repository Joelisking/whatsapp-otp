import { createHmac, randomInt } from 'crypto';

export function generateOTP(): string {
  return randomInt(100000, 999999).toString();
}

export function verifyHmacSignature(payload: string, signature: string, secret: string): boolean {
  try {
    const computedSignature = createHmac('sha256', secret).update(payload, 'utf8').digest('hex');

    const expectedSignature = `sha256=${computedSignature}`;

    return timingSafeEquals(expectedSignature, signature);
  } catch {
    return false;
  }
}

function timingSafeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}
