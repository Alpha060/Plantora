import crypto from "crypto";

// Generate a 6-digit numeric OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Hash OTP for storage (using SHA-256)
export function hashOTP(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

// Verify OTP against hash
export function verifyOTP(otp: string, hash: string): boolean {
  return hashOTP(otp) === hash;
}
