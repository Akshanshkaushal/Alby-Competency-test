import { AlbyProvider } from '@getalby/sdk';

// Constants for storage keys
const TOKEN_STORAGE_KEY = 'alby_access_token';
const REFRESH_TOKEN_STORAGE_KEY = 'alby_refresh_token';

// Define environment variables with fallbacks
const ALBY_CLIENT_ID = import.meta.env?.VITE_ALBY_CLIENT_ID || '';
const ALBY_REDIRECT_URI = import.meta.env?.VITE_ALBY_REDIRECT_URI || 'http://localhost:3000/callback';

class AlbyOAuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private provider: AlbyProvider | null = null;

  constructor() {
    // Load tokens from localStorage if available
    this.accessToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    this.refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  }

  // Check if we have valid tokens
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // Start the OAuth flow
  startOAuthFlow(): void {
    const authUrl = `https://getalby.com/oauth?client_id=${ALBY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(ALBY_REDIRECT_URI)}&scope=account:read%20invoices:create%20invoices:read%20payments:send%20balance:read`;
    window.location.href = authUrl;
  }

  // Handle the OAuth callback
  async handleCallback(code: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.getalby.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          code,
          client_id: ALBY_CLIENT_ID,
          redirect_uri: ALBY_REDIRECT_URI,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.refreshToken = data.refresh_token;

      // Store tokens in localStorage
      if (this.accessToken) {
        localStorage.setItem(TOKEN_STORAGE_KEY, this.accessToken);
      }
      if (this.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, this.refreshToken);
      }

      return true;
    } catch (error) {
      console.error('OAuth token exchange error:', error);
      return false;
    }
  }

  // Refresh the access token
  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false;
    }

    try {
      const response = await fetch('https://api.getalby.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken,
          client_id: ALBY_CLIENT_ID,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.refreshToken = data.refresh_token;

      // Store tokens in localStorage
      if (this.accessToken) {
        localStorage.setItem(TOKEN_STORAGE_KEY, this.accessToken);
      }
      if (this.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, this.refreshToken);
      }

      return true;
    } catch (error) {
      console.error('OAuth token refresh error:', error);
      this.logout();
      return false;
    }
  }

  // Logout and clear tokens
  logout(): void {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  }

  // Create a WebLN provider using Alby
  createWebLNProvider(): any {
    if (!this.accessToken) {
      throw new Error('Not authenticated with Alby');
    }

    // Create a WebLN-compatible provider that uses Alby's API
    return {
      enable: async () => {
        // Nothing to do, we're already authenticated
        return;
      },
      
      getInfo: async () => {
        try {
          const response = await fetch('https://api.getalby.com/user/me', {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`
            }
          });
          
          if (!response.ok) {
            if (response.status === 401) {
              // Try to refresh the token
              const refreshed = await this.refreshAccessToken();
              if (refreshed) {
                return this.createWebLNProvider().getInfo();
              }
            }
            throw new Error('Failed to get user info');
          }
          
          const data = await response.json();
          return {
            alias: data.name,
            pubkey: data.lightning_address,
            methods: ['makeInvoice', 'sendPayment', 'getBalance'],
            version: 'Alby OAuth'
          };
        } catch (error) {
          console.error('Error getting user info:', error);
          throw error;
        }
      },
      
      makeInvoice: async (args: any) => {
        try {
          const response = await fetch('https://api.getalby.com/invoices', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              amount: args.amount,
              description: args.defaultMemo || 'Invoice from Lightning App',
              expiry: args.expiry || 3600
            })
          });
          
          if (!response.ok) {
            throw new Error('Failed to create invoice');
          }
          
          const data = await response.json();
          return { paymentRequest: data.payment_request };
        } catch (error) {
          console.error('Error creating invoice:', error);
          throw error;
        }
      },
      
      sendPayment: async (args: any) => {
        try {
          const response = await fetch('https://api.getalby.com/payments', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              invoice: typeof args === 'string' ? args : args.paymentRequest
            })
          });
          
          if (!response.ok) {
            throw new Error('Failed to send payment');
          }
          
          const data = await response.json();
          return { 
            preimage: data.payment_preimage,
            paymentHash: data.payment_hash
          };
        } catch (error) {
          console.error('Error sending payment:', error);
          throw error;
        }
      },
      
      getBalance: async () => {
        try {
          const response = await fetch('https://api.getalby.com/balance', {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`
            }
          });
          
          if (!response.ok) {
            throw new Error('Failed to get balance');
          }
          
          const data = await response.json();
          return {
            total: data.balance,
            confirmed: data.balance,
            unconfirmed: 0
          };
        } catch (error) {
          console.error('Error getting balance:', error);
          throw error;
        }
      },
      
      keysend: async (args: any) => {
        try {
          const response = await fetch('https://api.getalby.com/keysend', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              destination: args.destination,
              amount: args.amount,
              custom_records: args.customRecords
            })
          });
          
          if (!response.ok) {
            throw new Error('Failed to send keysend payment');
          }
          
          const data = await response.json();
          return { 
            preimage: data.payment_preimage,
            paymentHash: data.payment_hash
          };
        } catch (error) {
          console.error('Error sending keysend payment:', error);
          throw error;
        }
      },
      
      signMessage: async () => {
        throw new Error('Message signing not supported via Alby OAuth');
      },
      
      verifyMessage: async () => {
        throw new Error('Message verification not supported via Alby OAuth');
      }
    };
  }
}

// Create a singleton instance
export const albyOAuthService = new AlbyOAuthService(); 