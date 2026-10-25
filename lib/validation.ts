export const MIN_PASSWORD_LENGTH = 8;
export const BARCODE_MAX_LENGTH = 120;

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function normalizeBarcode(value: string) {
  const normalized = value.trim();
  if (
    !normalized ||
    normalized.length > BARCODE_MAX_LENGTH ||
    !/^[A-Za-z0-9._:-]+$/.test(normalized)
  ) {
    return null;
  }
  return normalized.toUpperCase();
}
