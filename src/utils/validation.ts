/**
 * Validates an amount input
 */
export function validateAmount(amount: string): string | null {
  if (!amount) {
    return 'Amount is required';
  }
  
  const numAmount = Number(amount);
  
  if (isNaN(numAmount)) {
    return 'Amount must be a number';
  }
  
  if (numAmount <= 0) {
    return 'Amount must be greater than 0';
  }
  
  if (!Number.isInteger(numAmount)) {
    return 'Amount must be a whole number';
  }
  
  return null;
}

/**
 * Validates a memo input
 */
export function validateMemo(memo: string): string | null {
  if (memo.length > 280) {
    return 'Memo must be less than 280 characters';
  }
  
  return null;
}

/**
 * Validates a Lightning address input
 */
export function validateLightningAddress(address: string): string | null {
  if (!address) {
    return 'Lightning address is required';
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
    return 'Invalid Lightning address format';
  }
  
  return null;
}

/**
 * Validates a node pubkey input
 */
export function validateNodePubkey(pubkey: string): string | null {
  if (!pubkey) {
    return 'Node public key is required';
  }
  
  if (!/^[0-9a-f]{66}$/i.test(pubkey)) {
    return 'Invalid node public key format';
  }
  
  return null;
} 