import { z } from 'zod';

export const PayTRConfig = {
  merchantId: process.env.PAYTR_MERCHANT_ID || '',
  merchantKey: process.env.PAYTR_MERCHANT_KEY || '',
  merchantSalt: process.env.PAYTR_MERCHANT_SALT || '',
  debug: process.env.NODE_ENV === 'development',
  baseUrl: 'https://www.paytr.com/odeme/api/link',
  endpoints: {
    create: '/create',
    delete: '/delete'
  }
};

export const PayTRCreateLinkSchema = z.object({
  name: z.string().min(4).max(200),
  price: z.number().int().positive(),
  currency: z.enum(['TL', 'EUR', 'USD', 'GBP', 'RUB']).default('TL'),
  max_installment: z.number().int().min(1).max(12),
  lang: z.enum(['tr', 'en']).default('tr'),
  link_type: z.enum(['product', 'collection']),
  min_count: z.number().int().positive().optional(),
  email: z.string().email().max(100).optional(),
  max_count: z.number().int().positive().optional(),
  pft: z.number().int().min(2).max(12).optional(),
  expiry_date: z.string().optional(),
  callback_link: z.string().url().optional(),
  callback_id: z.string().max(64).optional(),
});

export const PayTRCallbackSchema = z.object({
  hash: z.string(),
  merchant_oid: z.string(),
  status: z.literal('success'),
  total_amount: z.number(),
  payment_amount: z.number(),
  payment_type: z.string(),
  currency: z.enum(['TL', 'USD', 'EUR', 'GBP', 'RUB']),
  callback_id: z.string().optional(),
  merchant_id: z.string(),
  test_mode: z.boolean()
});