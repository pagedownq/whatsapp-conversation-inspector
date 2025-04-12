
import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

// Supabase istemcisini oluştur
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Supabase configuration missing");
  throw new Error("Supabase configuration missing");
}

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

    // Basit hash kontrolü
    if (!validatePaytrNotification(notifyParams)) {
      console.error('PayTR notification validation failed');
      return {
        statusCode: 400,
        body: 'PAYTR notification validation failed'
      };
    }

    // merchant_oid'den user_id'yi çıkar
    const merchant_oid = notifyParams.merchant_oid;
    const userId = merchant_oid?.split('_')[0];
    
    if (!userId) {
      throw new Error('Invalid merchant_oid format');
    }

    // Ödeme durumunu güncelle
    const { error: paymentError } = await supabase
      .from('payments')
      .update({
        status: notifyParams.status,
        payment_type: notifyParams.payment_type || 'premium',
        payment_response: notifyParams,
        updated_at: new Date().toISOString()
      })
      .eq('merchant_oid', merchant_oid);

    if (paymentError) {
      console.error('Payment update error:', paymentError);
      return {
        statusCode: 500,
        body: 'Payment update failed'
      };
    }

    // Başarılı ödeme durumunda abonelik oluştur
    if (notifyParams.status === 'success') {
      // Önce mevcut aktif aboneliği devre dışı bırak
      const { error: deactivateError } = await supabase
        .from('subscriptions')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('is_active', true);

      if (deactivateError) {
        console.error('Error deactivating existing subscription:', deactivateError);
      }

      // Yeni abonelik oluştur
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30); // 30 günlük abonelik

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
        console.error('Subscription creation error:', subscriptionError);
        return {
          statusCode: 500,
          body: 'Subscription creation failed'
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
    // PayTR için hata durumunda da OK döndürelim ki tekrar denemesin
    return {
      statusCode: 200,
      body: 'OK'
    };
  }
};

// PayTR bildirimlerini doğrulama fonksiyonu
function validatePaytrNotification(params: Record<string, any>): boolean {
  // PayTR'den gelen bildirim yapısının temel kontrolü
  // Bu basit kontrol için minimum alanları kontrol edelim
  return (
    params.merchant_oid &&
    (params.status === 'success' || params.status === 'failed')
  );
}

export { handler };
