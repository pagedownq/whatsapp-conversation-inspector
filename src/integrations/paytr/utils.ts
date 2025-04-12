import { PayTRConfig } from './config';
import crypto from 'crypto';

export function createPaytrToken(params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {} as Record<string, any>);

  const paramsStr = Object.entries(sortedParams)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  const hashStr = `${PayTRConfig.merchantId}${paramsStr}${PayTRConfig.merchantSalt}${PayTRConfig.merchantKey}`;
  return crypto.createHash('sha256').update(hashStr).digest('base64');
}

export function validateCallbackHash(params: Record<string, any>, receivedHash: string): boolean {
  const { hash, ...restParams } = params;
  const calculatedHash = createPaytrToken(restParams);
  return calculatedHash === receivedHash;
}

export function convertPriceToPaytrFormat(price: number): number {
  return Math.round(price * 100);
}

export function convertPaytrPriceToNormal(paytrPrice: number): number {
  return paytrPrice / 100;
}

export async function makePaytrRequest<T>(endpoint: string, params: Record<string, any>): Promise<T> {
  try {
    const paytrToken = createPaytrToken(params);
    const requestParams = {
      ...params,
      merchant_id: PayTRConfig.merchantId,
      paytr_token: paytrToken,
      debug_on: PayTRConfig.debug ? '1' : '0'
    };

    const response = await fetch(`${PayTRConfig.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(requestParams).toString()
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PayTR API error: ${response.status} - ${errorText || response.statusText}`);
    }

    const data = await response.json();
    if (data.status === 'error' || data.status === 'failed') {
      throw new Error(
        data.reason ||
        data.failed_reason_msg ||
        data.error_message ||
        'PayTR API request failed'
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('PayTR API request failed: ' + String(error));
  }
}