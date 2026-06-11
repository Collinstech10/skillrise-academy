'use client';
import { useCallback } from 'react';

interface PaystackOptions {
  email: string;
  amount: number; // in kobo (multiply NGN by 100)
  reference: string;
  metadata?: Record<string, unknown>;
  onSuccess: (reference: string) => void;
  onClose: () => void;
}

declare global {
  interface Window {
    PaystackPop: {
      setup: (options: {
        key: string;
        email: string;
        amount: number;
        ref: string;
        metadata?: Record<string, unknown>;
        callback: (response: { reference: string }) => void;
        onClose: () => void;
      }) => { openIframe: () => void };
    };
  }
}

export function usePaystack() {
  const initializePayment = useCallback((options: PaystackOptions) => {
    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_your_key_here';

    if (typeof window !== 'undefined' && window.PaystackPop) {
      const handler = window.PaystackPop.setup({
        key: publicKey,
        email: options.email,
        amount: options.amount * 100, // convert to kobo
        ref: options.reference,
        metadata: options.metadata,
        callback: (response) => options.onSuccess(response.reference),
        onClose: options.onClose,
      });
      handler.openIframe();
    } else {
      console.error('Paystack not loaded. Add script to layout.');
    }
  }, []);

  return { initializePayment };
}

export function generateReference(prefix = 'SKR'): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}_${timestamp}_${random}`;
}
