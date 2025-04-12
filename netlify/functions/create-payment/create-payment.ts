import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { createPaymentLink, CreateLinkParams, PayTRLinkResponse } from '../../../src/integrations/paytr';
import { ZodError } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { userId } = JSON.parse(event.body || '{}');
    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'User ID is required' })
      };
    }

    // Kullanıcı bilgilerini al
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'User not found' })
      };
    }

        const merchantOid = `${userId}_${Date.now()}`;
    const paymentAmount = 99.00; // 99.00 TL

    const paymentParams: CreateLinkParams = {
      name: 'Premium Abonelik',
      price: paymentAmount,
      currency: 'TL',
      max_installment: 12,
      lang: 'tr',
      link_type: 'product',
      email: user.email,
      callback_link: `${process.env.URL}/.netlify/functions/paytr-notify`,
      callback_id: merchantOid,
      expiry_date: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 dakika geçerli
    };

    try {
      // PayTR ödeme bağlantısı oluştur
      const response: PayTRLinkResponse = await createPaymentLink(paymentParams);

      if (!response?.status || !response?.link) {
        throw new Error('Geçersiz ödeme servisi yanıtı');
      }

      if (response.status !== 'success') {
        throw new Error('Ödeme bağlantısı oluşturulamadı');
      }

      // Ödeme kaydını oluştur
      const { error: paymentError } = await supabase.from('payments').insert({
        user_id: userId,
        merchant_oid: merchantOid,
        amount: paymentAmount,
        status: 'pending',
        created_at: new Date().toISOString()
      });

      if (paymentError) {
        console.error('Payment record creation error:', paymentError);
        throw new Error('Ödeme kaydı oluşturulamadı');
      }

      return {
        statusCode: 200,
        body: JSON.stringify({
          payment_link: response.link,
          merchant_oid: merchantOid
        })
      };
    } catch (error) {
      console.error('Ödeme oluşturma hatası:', error);
      let statusCode = 400;
      let errorMessage = 'Ödeme işlemi başlatılamadı';
      let errorCode = 'PAYMENT_ERROR';

      if (error instanceof ZodError) {
        statusCode = 400;
        errorMessage = 'Geçersiz ödeme parametreleri';
        errorCode = 'VALIDATION_ERROR';
      } else if (error instanceof Error) {
        errorMessage = error.message;
        if ('statusCode' in error) {
          statusCode = (error as any).statusCode || 400;
        }
        if ('code' in error) {
          errorCode = (error as any).code || 'PAYMENT_ERROR';
        }
      }
      
      return {
        statusCode,
        body: JSON.stringify({ 
          error: errorMessage,
          code: errorCode
        })
      };
    }
  } catch (error) {
    console.error('Payment creation error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

export { handler };