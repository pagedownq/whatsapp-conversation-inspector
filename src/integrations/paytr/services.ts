import { PayTRConfig, PayTRCreateLinkSchema, PayTRCallbackSchema } from './config';
import { makePaytrRequest, convertPriceToPaytrFormat, validateCallbackHash } from './utils';
import type { z } from 'zod';

export type CreateLinkParams = z.infer<typeof PayTRCreateLinkSchema>;
export type CallbackParams = z.infer<typeof PayTRCallbackSchema>;

export interface PayTRLinkResponse {
  status: string;
  id: string;
  link: string;
}

export async function createPaymentLink(params: CreateLinkParams): Promise<PayTRLinkResponse> {
  const validatedParams = PayTRCreateLinkSchema.parse(params);
  
  const requestParams = {
    ...validatedParams,
    price: convertPriceToPaytrFormat(validatedParams.price)
  };

  return await makePaytrRequest(PayTRConfig.endpoints.create, requestParams);
}

export async function deletePaymentLink(id: string): Promise<{ status: string }> {
  const requestParams = { id };
  return await makePaytrRequest(PayTRConfig.endpoints.delete, requestParams);
}

export function handlePaymentCallback(params: Record<string, any>): CallbackParams {
  const validatedParams = PayTRCallbackSchema.parse(params);
  
  if (!validateCallbackHash(params, validatedParams.hash)) {
    throw new Error('Invalid callback hash');
  }

  if (validatedParams.status !== 'success') {
    throw new Error('Payment was not successful');
  }

  return validatedParams;
}