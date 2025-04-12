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

    // Doğrudan PayTR sabit linki kullanma konfigürasyonu
    const useStaticPaytrLink = true;
    const staticPaytrLinkBase = "https://www.paytr.com/link/ANDPOpo";
    
    // Return URL ve fail URL'i oluşturma
    const origin = event.headers.origin || event.headers.host ? `https://${event.headers.host}` : 'https://analizore.netlify.app';
    const returnUrl = `${origin}/pricing?status=success`;
    const failUrl = `${origin}/pricing?status=failed`;
    
    // URL parametrelerini ekleyerek tam PayTR linkini oluştur
    const staticPaytrLink = `${staticPaytrLinkBase}?return_url=${encodeURIComponent(returnUrl)}&fail_url=${encodeURIComponent(failUrl)}`;

    // Eğer statik link kullanıyorsak, hızlıca döndür
    if (useStaticPaytrLink) {
      // Ödeme kaydını oluştur
      const { error: paymentError } = await supabase.from('payments').insert({
        user_id: userId,
        merchant_oid: merchantOid,
        amount: paymentAmount * 100, // Kuruş cinsinden
        status: 'pending',
        created_at: new Date().toISOString()
      });

      if (paymentError) {
        console.error('Payment record creation error:', paymentError);
      }

      return {
        statusCode: 200,
        body: JSON.stringify({
          payment_link: staticPaytrLink,
          merchant_oid: merchantOid
        })
      };
    }

    // Dinamik PayTR API çağrısı kodu (kullanılmıyor, ama korundu)
    // ... keep existing code (Dynamic PayTR API call implementation)

  } catch (error) {
    console.error('Payment creation error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

export { handler };
