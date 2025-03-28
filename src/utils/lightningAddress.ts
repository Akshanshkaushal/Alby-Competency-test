interface LNURLPayResponse {
  callback: string;
  maxSendable: number;
  minSendable: number;
  metadata: string;
  tag: string;
  status?: string;
  reason?: string;
}

interface LNURLInvoiceResponse {
  pr: string;
  successAction?: {
    tag: string;
    message?: string;
    url?: string;
  };
  status?: string;
  reason?: string;
}

export async function resolveLightningAddress(address: string): Promise<LNURLPayResponse> {
  if (!address.includes('@')) {
    throw new Error('Invalid Lightning address format. Should be user@domain.com');
  }
  
  const [username, domain] = address.split('@');
  const url = `https://${domain}/.well-known/lnurlp/${username}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to resolve Lightning address');
    }
    
    const data = await response.json();
    
    if (data.status === 'ERROR') {
      throw new Error(data.reason || 'Error from Lightning address provider');
    }
    
    return data;
  } catch (error) {
    console.error('Error resolving Lightning address:', error);
    throw error;
  }
}

export async function getInvoiceFromLNURL(
  lnurlData: LNURLPayResponse, 
  amountSats: number, 
  comment?: string
): Promise<string> {
  if (!lnurlData.callback) {
    throw new Error('Invalid LNURL data: missing callback URL');
  }
  
  // Convert sats to millisats for LNURL
  const amountMsats = amountSats * 1000;
  
  // Check amount limits
  if (amountMsats < lnurlData.minSendable) {
    throw new Error(`Amount too small. Minimum is ${lnurlData.minSendable / 1000} sats`);
  }
  
  if (amountMsats > lnurlData.maxSendable) {
    throw new Error(`Amount too large. Maximum is ${lnurlData.maxSendable / 1000} sats`);
  }
  
  // Build callback URL with parameters
  const callbackUrl = new URL(lnurlData.callback);
  callbackUrl.searchParams.append('amount', amountMsats.toString());
  
  if (comment) {
    callbackUrl.searchParams.append('comment', comment);
  }
  
  try {
    const response = await fetch(callbackUrl.toString());
    if (!response.ok) {
      throw new Error('Failed to get invoice from Lightning address');
    }
    
    const data: LNURLInvoiceResponse = await response.json();
    
    if (data.status === 'ERROR') {
      throw new Error(data.reason || 'Error getting invoice');
    }
    
    if (!data.pr) {
      throw new Error('No invoice received from Lightning address');
    }
    
    return data.pr;
  } catch (error) {
    console.error('Error getting invoice from LNURL:', error);
    throw error;
  }
} 