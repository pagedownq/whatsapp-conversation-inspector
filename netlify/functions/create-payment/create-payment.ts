
import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

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
    const { userId, merchantOid } = JSON.parse(event.body || '{}');
    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'User ID is required' })
      };
    }

    // Kullanıcı bilgilerini al
    const { data: user, error: userError } = await supabase
      .from('users_meta')
      .select('email')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'User not found' })
      };
    }

    // PayTR sabit linki
    const paytrLinkBase = "https://www.paytr.com/link/ANDPOpo";
    
    // Ödeme kaydını kontrol et ve güncelle
    if (merchantOid) {
      const { error: paymentError } = await supabase
        .from('payments')
        .update({ 
          status: 'processing',
          updated_at: new Date().toISOString()
        })
        .eq('merchant_oid', merchantOid);

      if (paymentError) {
        console.error('Payment record update error:', paymentError);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        payment_link: paytrLinkBase,
        merchant_oid: merchantOid || `${userId}_${Date.now()}`
      })
    };
  } catch (error) {
    console.error('Payment creation error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

export { handler };
