import CryptoJS from 'crypto-js';

const secretKey = process.env.FIELD_ENCRYPTION_KEY;

if (!secretKey) {
  // In a real app, you'd want to throw an error here, 
  // but for build processes we will log a warning.
  console.warn('Warning: FIELD_ENCRYPTION_KEY is not set. Encryption will be disabled.');
}

// Encrypt function
export function encrypt(text: string): string {
  if (!secretKey || !text) {
    return text;
  }
  return CryptoJS.AES.encrypt(text, secretKey).toString();
}

// Decrypt function
export function decrypt(ciphertext: string): string {
  if (!secretKey || !ciphertext) {
    return ciphertext;
  }
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    // If decryption results in an empty string, it might mean the key is wrong
    // or the data is not encrypted. Return original data to avoid breaking UI.
    if (!originalText) {
      return ciphertext;
    }
    return originalText;
  } catch (e) {
    // If an error occurs, it's likely not encrypted data, so return it as is.
    return ciphertext;
  }
}
