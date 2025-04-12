import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

// Supabase istemcisini oluştur
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// PayTR merchant bilgileri
const merchantKey = process.env.PAYTR_MERCHANT_KEY!;
const merchantSalt = process.env.PAYTR_MERCHANT_SALT!;

const handler: Handler = async (event) => {
  // POST isteği değilse hata döndür
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }

  try {
    const data = JSON.parse(event.body!);

    // Gerekli alanların kontrolü
    const requiredFields = ['merchant_oid', 'status', 'total_amount', 'hash'];
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Hash doğrulaması
    const hashStr = data.merchant_oid + merchantSalt + data.status + data.total_amount + merchantKey;
    const calculatedHash = require('crypto')
      .createHash('sha256')
      .update(hashStr)
      .digest('base64');

    if (calculatedHash !== data.hash) {
      throw new Error('Invalid hash');
    }

    // Başarılı ödeme kontrolü
    if (data.status !== 'success') {
      throw new Error('Payment not successful');
    }

    // Tekrarlayan ödeme kontrolü
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('merchant_oid', data.merchant_oid)
      .single();

    if (existingPayment) {
      // Tekrarlayan ödeme bildirimi - sadece OK yanıtı dön
      return {
        statusCode: 200,
        body: 'OK'
      };
    }

    // Yeni ödeme kaydı oluştur
    const { error: insertError } = await supabase
      .from('payments')
      .insert([
        {
          merchant_oid: data.merchant_oid,
          total_amount: parseInt(data.total_amount) / 100, // Kuruş'tan TL'ye çevir
          payment_type: data.payment_type,
          currency: data.currency,
          status: data.status,
          test_mode: data.test_mode === '1'
        }
      ]);

    if (insertError) {
      throw insertError;
    }

    // Başarılı yanıt
    return {
      statusCode: 200,
      body: 'OK'
    };

  } catch (error) {
    console.error('PayTR callback error:', error);
    
    // Hata durumunda da OK yanıtı dön (PayTR'nin tekrar denemesi için)
    return {
      statusCode: 200,
      body: 'OK'
    };
  }
};

export { handler };