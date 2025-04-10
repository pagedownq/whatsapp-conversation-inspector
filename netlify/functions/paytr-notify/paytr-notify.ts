import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { PayTRService } from '../../../src/integrations/paytr/service';
import { PayTRNotifyRequest } from '../../../src/integrations/paytr/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
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
    const notifyParams: PayTRNotifyRequest = {
      merchant_oid: params.get('merchant_oid') || '',
      status: params.get('status') || '',
      total_amount: params.get('total_amount') || '',
      hash: params.get('hash') || '',
      test_mode: params.get('test_mode') || ''
    };

    const paytrService = new PayTRService();
    const isValid = paytrService.validateNotification(notifyParams);

    if (!isValid) {
      return {
        statusCode: 400,
        body: 'PAYTR notification validation failed'
      };
    }

    // Ödeme kaydını güncelle
    const userId = notifyParams.merchant_oid.split('_')[0];
    const { error: paymentError } = await supabase
      .from('payments')
      .update({ status: notifyParams.status })
      .eq('merchant_oid', notifyParams.merchant_oid);

    if (paymentError) {
      console.error('Payment update error:', paymentError);
      return {
        statusCode: 500,
        body: 'Payment update failed'
      };
    }

    if (notifyParams.status === 'success') {
      // Premium aboneliği aktifleştir
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30); // 30 günlük abonelik

      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          started_at: startDate.toISOString(),
          expires_at: endDate.toISOString(),
          is_active: true,
          payment_id: notifyParams.merchant_oid
        });

      if (subscriptionError) {
        console.error('Subscription update error:', subscriptionError);
        return {
          statusCode: 500,
          body: 'Subscription update failed'
        };
      }
    }

    return {
      statusCode: 200,
      body: 'OK'
    };
  } catch (error) {
    console.error('PayTR notification error:', error);
    return {
      statusCode: 500,
      body: 'Internal server error'
    };
  }
};

export { handler };