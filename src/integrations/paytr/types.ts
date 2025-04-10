export interface PayTRRequestParams {
  merchant_id: string;
  user_ip: string;
  merchant_oid: string;
  email: string;
  payment_amount: number;
  user_basket: string;
  no_installment: number;
  max_installment: number;
  currency: string;
  test_mode: string;
  merchant_ok_url: string;
  merchant_fail_url: string;
  user_name: string;
  user_address: string;
  user_phone: string;
  timeout_limit: string;
  debug_on: string;
  lang: string;
  paytr_token: string;
}

export interface PayTRResponse {
  status: string;
  token: string;
  iframe_url?: string;
  reason?: string;
}

export interface PayTRNotifyRequest {
  merchant_oid: string;
  status: string;
  total_amount: string;
  hash: string;
  failed_reason_code?: string;
  failed_reason_msg?: string;
  test_mode: string;
}

export interface SubscriptionData {
  user_id: string;
  started_at: string;
  expires_at: string;
  is_active: boolean;
  payment_id: string;
}