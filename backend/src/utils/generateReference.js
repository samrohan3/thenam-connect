/**
 * Generates a unique reference number for transactions.
 * Format: REF-{YYYYMMDD}-{6-digit-random}
 */
const generateReference = () => {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.floor(100000 + Math.random() * 900000);
  return `REF-${datePart}-${randomPart}`;
};

/**
 * Generates a unique transaction ID.
 * Format: TX-{timestamp}-{4-digit-random}
 */
const generateTransactionId = () => {
  const timestamp = Date.now();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `TX-${timestamp}-${random}`;
};

/**
 * Generates a transfer reference pair (same reference used for both sides).
 * Format: TRF-{YYYYMMDD}-{6-digit-random}
 */
const generateTransferRef = () => {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.floor(100000 + Math.random() * 900000);
  return `TRF-${datePart}-${randomPart}`;
};

module.exports = { generateReference, generateTransactionId, generateTransferRef };
