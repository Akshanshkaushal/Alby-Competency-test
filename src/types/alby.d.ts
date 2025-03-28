declare module '@getalby/sdk' {
  export class AlbyProvider {
    constructor(options?: any);
    // Add method signatures as needed
    enable(): Promise<void>;
    getInfo(): Promise<any>;
    makeInvoice(args: any): Promise<any>;
    sendPayment(args: any): Promise<any>;
    getBalance(): Promise<any>;
    keysend(args: any): Promise<any>;
    signMessage(args: any): Promise<any>;
    verifyMessage(args: any): Promise<any>;
  }
} 