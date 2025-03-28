import { WebLNProvider as OriginalWebLNProvider } from 'webln';

// Extend the original WebLNProvider with additional methods
declare module 'webln' {
  interface WebLNProvider extends OriginalWebLNProvider {
    enable(): Promise<void>;
    getInfo(): Promise<any>;
    makeInvoice(args: any): Promise<any>;
    sendPayment(args: any): Promise<any>;
    getBalance(): Promise<any>;
    keysend(args: any): Promise<any>;
  }
} 