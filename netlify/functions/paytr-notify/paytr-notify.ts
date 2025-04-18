
import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { handlePaymentCallback, CallbackParams } from '../../../src/integrations/paytr';

// Supabase istemcisini doğru şekilde oluştur
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Supabase configuration missing");
  throw new Error("Supabase configuration missing");
}

// Supabase client'ı oluştururken URL ve key'i doğrudan belirtiyoruz
const supabase = createClient(
  supabaseUrl,
  supabaseServiceRoleKey
);

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method not allowed'
    };
  }

  try {
    const params = new URLSearchParams(event.body || '');
    const notifyParams: Record<string, any> = {};
    params.forEach((value, key) => {
      notifyParams[key] = value;
    });
    
    console.log('Received PayTR notification:', notifyParams);

    let callbackData;
    try {
      callbackData = handlePaymentCallback(notifyParams);
    } catch (error) {
      console.error('PayTR callback validation error:', error);
      return {
        statusCode: 400,
        body: 'PAYTR notification validation failed'
      };
    }

    if (!callbackData) {
      return {
        statusCode: 400,
        body: 'PAYTR notification validation failed'
      };
    }

    // Ödeme kaydını güncelle
    const userId = callbackData.callback_id?.split('_')[0];
    if (!userId) {
      throw new Error('Invalid callback_id format');
    }

    const { error: paymentError } = await supabase
      .from('payments')
      .update({
        status: callbackData.status,
        total_amount: callbackData.total_amount,
        payment_type: callbackData.payment_type,
        updated_at: new Date().toISOString()
      })
      .eq('merchant_oid', callbackData.callback_id);

    if (paymentError) {
      console.error('Payment update error:', paymentError);
      return {
        statusCode: 500,
        body: 'Payment update failed'
      };
    }

    if (callbackData.status === 'success') {
      // Premium aboneliği aktifleştir
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30); // 30 günlük abonelik

      // Önce mevcut aktif aboneliği devre dışı bırak
      const { error: deactivateError } = await supabase
        .from('subscriptions')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('is_active', true);

      if (deactivateError) {
        console.error('Error deactivating existing subscription:', deactivateError);
      }

      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          started_at: startDate.toISOString(),
          expires_at: endDate.toISOString(),
          is_active: true,
          subscription_type: 'premium'
        });

      if (subscriptionError) {
        console.error('Subscription update error:', subscriptionError);
        return {
          statusCode: 500,
          body: 'Subscription update failed'
        };
      }
    }

    console.log('PayTR notification processed successfully');
    return {
      statusCode: 200,
      body: 'OK'
    };
  } catch (error) {
    console.error('PayTR notification error:', error);
    return {
      statusCode: 200, // PayTR için hata durumunda da 200 döndürelim ki tekrar denemesin
      body: 'OK'
    };
  }
};

export { handler };
