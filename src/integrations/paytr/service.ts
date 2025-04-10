import { PayTRRequestParams, PayTRResponse, PayTRNotifyRequest } from './types';
import crypto from 'crypto';

export class PayTRService {
  private merchantId: string;
  private merchantKey: string;
  private merchantSalt: string;

  constructor() {
    this.merchantId = process.env.PAYTR_MERCHANT_ID || '';
    this.merchantKey = process.env.PAYTR_MERCHANT_KEY || '';
    this.merchantSalt = process.env.PAYTR_MERCHANT_SALT || '';
  }

  generatePaymentToken(params: Omit<PayTRRequestParams, 'paytr_token'>): string {
    const merchantParams = [
      params.merchant_id,
      params.user_ip,
      params.merchant_oid,
      params.email,
      params.payment_amount.toString(),
      params.user_basket,
      params.no_installment.toString(),
      params.max_installment.toString(),
      params.currency,
      params.test_mode,
      params.merchant_ok_url,
      params.merchant_fail_url
    ];

    const hashStr = merchantParams.join('') + this.merchantSalt;
    const paytrToken = crypto.createHmac('sha256', this.merchantKey)
      .update(hashStr)
      .digest('base64');

    return paytrToken;
  }

  validateNotification(params: PayTRNotifyRequest): boolean {
    const { merchant_oid, status, total_amount, hash } = params;
    const hashStr = this.merchantId + merchant_oid + status + total_amount + this.merchantSalt;
    const calculatedHash = crypto.createHmac('sha256', this.merchantKey)
      .update(hashStr)
      .digest('base64');

    return calculatedHash === hash;
  }

  async createPayment(params: Omit<PayTRRequestParams, 'paytr_token'>): Promise<PayTRResponse> {
    const paytrToken = this.generatePaymentToken(params);
    const requestParams: PayTRRequestParams = {
      ...params,
      paytr_token: paytrToken
    };

    const response = await fetch('https://www.paytr.com/odeme/api/get-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(requestParams as any).toString()
    });

    if (!response.ok) {
      throw new Error('PayTR API error');
    }

    return response.json();
  }
}