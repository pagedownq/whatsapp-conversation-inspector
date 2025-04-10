import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { PayTRService } from '../../../src/integrations/paytr/service';

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

    const paytrService = new PayTRService();
    const merchantOid = `${userId}_${Date.now()}`; // Benzersiz sipariş ID'si
    const paymentAmount = 9900; // 99.00 TL

    const paymentParams = {
      merchant_id: process.env.PAYTR_MERCHANT_ID || '',
      user_ip: event.headers['client-ip'] || '',
      merchant_oid: merchantOid,
      email: user.email,
      payment_amount: paymentAmount,
      user_basket: JSON.stringify([["Premium Abonelik", paymentAmount, 1]]),
      no_installment: 0,
      max_installment: 0,
      currency: 'TL',
      test_mode: process.env.NODE_ENV === 'development' ? '1' : '0',
      merchant_ok_url: `${process.env.URL || ''}/pricing?status=success`,
      merchant_fail_url: `${process.env.URL || ''}/pricing?status=failed`,
      user_name: user.email,
      user_address: 'N/A',
      user_phone: 'N/A',
      timeout_limit: '30',
      debug_on: '0',
      lang: 'tr'
    };

    const response = await paytrService.createPayment(paymentParams);

    if (response.status === 'success' && response.iframe_url) {
      // Ödeme kaydını oluştur
      await supabase.from('payments').insert({
        user_id: userId,
        merchant_oid: merchantOid,
        amount: paymentAmount,
        status: 'pending'
      });

      return {
        statusCode: 200,
        body: JSON.stringify({ iframe_url: response.iframe_url })
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: response.reason || 'Payment creation failed' })
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