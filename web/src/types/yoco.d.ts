// Type definitions for Yoco SDK
export interface YocoSDK {
  new (options: { publicKey: string }): YocoSDKInstance;
}

export interface YocoSDKInstance {
  showPopup(options: {
    amountInCents: number;
    currency: string;
    name: string;
    description: string;
    callback: (result: YocoResult) => void;
  }): void;
}

export interface YocoResult {
  error?: {
    message?: string;
  };
  id?: string;
}

declare global {
  interface Window {
    YocoSDK?: YocoSDK;
    gtag?: (...args: unknown[]) => void;
  }
}
