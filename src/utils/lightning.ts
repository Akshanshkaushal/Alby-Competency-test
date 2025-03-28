/**
 * Validates a Lightning Network invoice (BOLT11)
 */
export function isValidLightningInvoice(invoice: string): boolean {
  // Basic validation for Lightning invoices
  return /^(lnbc|lntb|lnbcrt)[0-9]+[a-zA-Z0-9]+$/.test(invoice);
}

/**
 * Validates a Lightning Network address (user@domain.com)
 */
export function isValidLightningAddress(address: string): boolean {
  // Basic email format validation
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address);
}

/**
 * Validates a Lightning Network node public key
 */
export function isValidNodePubkey(pubkey: string): boolean {
  // Basic validation for node pubkeys (hex string of 66 chars)
  return /^[0-9a-f]{66}$/i.test(pubkey);
}

/**
 * Formats a satoshi amount with commas
 */
export function formatSats(sats: number): string {
  return sats.toLocaleString();
}

/**
 * Extracts the amount from a BOLT11 invoice
 * Note: This is a simplified version and doesn't handle all edge cases
 */
export function extractAmountFromInvoice(invoice: string): number | null {
  try {
    // Extract the amount part from the invoice
    const match = invoice.match(/^(lnbc|lntb|lnbcrt)([0-9]+)([munp])/i);
    
    if (!match) return null;
    
    const amount = parseInt(match[2]);
    const unit = match[3].toLowerCase();
    
    // Convert based on unit
    switch (unit) {
      case 'm': return amount * 100000; // milli
      case 'u': return amount * 100;    // micro
      case 'n': return amount * 0.1;    // nano
      case 'p': return amount * 0.0001; // pico
      default: return amount;
    }
  } catch (err) {
    console.error('Failed to extract amount from invoice:', err);
    return null;
  }
}

/**
 * Truncates a string in the middle
 */
export function truncateMiddle(str: string, startChars = 6, endChars = 6): string {
  if (str.length <= startChars + endChars) {
    return str;
  }
  
  return `${str.substring(0, startChars)}...${str.substring(str.length - endChars)}`;
} 