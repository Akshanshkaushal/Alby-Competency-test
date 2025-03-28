import { WebLNProvider } from 'webln';

// OAuth configuration
const OAUTH_CONFIG = {
  clientId: import.meta.env.VITE_ALBY_CLIENT_ID || '',
  authorizeEndpoint: 'https://getalby.com/oauth',
  tokenEndpoint: 'https://api.getalby.com/oauth/token',
  apiEndpoint: 'https://api.getalby.com',
  redirectUri: window.location.origin + '/callback',
  scopes: ['account:read', 'balance:read', 'invoices:create', 'invoices:read', 'payments:send']
};

// Token storage keys
const TOKEN_STORAGE_KEY = 'alby_access_token';
const REFRESH_TOKEN_STORAGE_KEY = 'alby_refresh_token';
const CODE_VERIFIER_KEY = 'alby_code_verifier';

export class AlbyOAuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // Try to load tokens from storage
    this.accessToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    this.refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  }

  /**
   * Check if we have a valid access token
   */
  public isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  /**
   * Start the OAuth flow
   */
  public startOAuthFlow(): void {
    // Generate PKCE code verifier and challenge
    const codeVerifier = this.generateRandomString(64);
    localStorage.setItem(CODE_VERIFIER_KEY, codeVerifier);

    this.generateCodeChallenge(codeVerifier).then(codeChallenge => {
      // Build the authorization URL
      const params = new URLSearchParams({
        client_id: OAUTH_CONFIG.clientId,
        response_type: 'code',
        redirect_uri: OAUTH_CONFIG.redirectUri,
        scope: OAUTH_CONFIG.scopes.join(' '),
        code_challenge: codeChallenge,
        code_challenge_method: 'S256'
      });

      // Redirect to Alby's authorization page
      window.location.href = `${OAUTH_CONFIG.authorizeEndpoint}?${params.toString()}`;
    });
  }

  /**
   * Handle the OAuth callback
   */
  public async handleCallback(code: string): Promise<void> {
    const codeVerifier = localStorage.getItem(CODE_VERIFIER_KEY);
    if (!codeVerifier) {
      throw new Error('Code verifier not found');
    }

    // Exchange the code for tokens
    const response = await fetch(OAUTH_CONFIG.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: OAUTH_CONFIG.clientId,
        grant_type: 'authorization_code',
        code,
        redirect_uri: OAUTH_CONFIG.redirectUri,
        code_verifier: codeVerifier
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Token exchange failed: ${error.error_description || error.error || 'Unknown error'}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token;

    // Store tokens
    localStorage.setItem(TOKEN_STORAGE_KEY, this.accessToken);
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, this.refreshToken);
    localStorage.removeItem(CODE_VERIFIER_KEY);
  }

  /**
   * Refresh the access token
   */
  public async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(OAUTH_CONFIG.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: OAUTH_CONFIG.clientId,
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken
      })
    });

    if (!response.ok) {
      // If refresh fails, clear tokens and redirect to login
      this.logout();
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token;

    // Store new tokens
    localStorage.setItem(TOKEN_STORAGE_KEY, this.accessToken);
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, this.refreshToken);
  }

  /**
   * Make an authenticated API request
   */
  public async apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    };

    try {
      const response = await fetch(`${OAUTH_CONFIG.apiEndpoint}${endpoint}`, {
        ...options,
        headers
      });

      if (response.status === 401) {
        // Token expired, try to refresh
        await this.refreshAccessToken();
        // Retry the request with the new token
        return this.apiRequest(endpoint, options);
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'API request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * Logout - clear tokens
   */
  public logout(): void {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  }

  /**
   * Create a WebLN provider that uses Alby's API
   */
  public createWebLNProvider(): WebLNProvider {
    return {
      enable: async () => {
        if (!this.isAuthenticated()) {
          this.startOAuthFlow();
          throw new Error('Authentication required');
        }
      },
      getInfo: async () => {
        const user = await this.apiRequest('/user/me');
        return {
          alias: user.name || user.email || 'Alby User',
          pubkey: user.lightning_address || '',
          methods: ['makeInvoice', 'sendPayment'],
          version: '1.0.0'
        };
      },
      makeInvoice: async (args) => {
        const invoice = await this.apiRequest('/invoices', {
          method: 'POST',
          body: JSON.stringify({
            amount: args.amount,
            description: args.defaultMemo || 'Invoice from Lightning App',
            expiry: args.expiry || 3600
          })
        });
        return {
          paymentRequest: invoice.payment_request
        };
      },
      sendPayment: async (args) => {
        const payment = await this.apiRequest('/payments', {
          method: 'POST',
          body: JSON.stringify({
            invoice: args.paymentRequest
          })
        });
        return {
          preimage: payment.payment_preimage || '',
          paymentHash: payment.payment_hash || ''
        };
      },
      getBalance: async () => {
        const balance = await this.apiRequest('/balance');
        return {
          total: balance.balance || 0,
          confirmed: balance.balance || 0,
          unconfirmed: 0
        };
      },
      keysend: async (args) => {
        const payment = await this.apiRequest('/payments/keysend', {
          method: 'POST',
          body: JSON.stringify({
            destination: args.destination,
            amount: args.amount,
            custom_records: args.customRecords
          })
        });
        return {
          preimage: payment.payment_preimage || '',
          paymentHash: payment.payment_hash || ''
        };
      },
      signMessage: async () => {
        throw new Error('Sign message not supported in Alby OAuth integration');
      },
      verifyMessage: async () => {
        throw new Error('Verify message not supported in Alby OAuth integration');
      }
    };
  }

  // Helper methods for PKCE
  private generateRandomString(length: number): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array)
      .map(b => String.fromCharCode(b % 26 + 97))
      .join('');
  }

  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }
}

export const albyOAuthService = new AlbyOAuthService(); 