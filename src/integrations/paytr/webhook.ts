import { supabase } from '@/integrations/supabase/client';

const MERCHANT_ID = import.meta.env.VITE_PAYTR_MERCHANT_ID;
const MERCHANT_KEY = import.meta.env.VITE_PAYTR_MERCHANT_KEY;
const MERCHANT_SALT = import.meta.env.VITE_PAYTR_MERCHANT_SALT;

type PayTRWebhookData = {
  merchant_oid: string;
  status: string;
  total_amount: number;
  hash: string;
  failed_reason_code?: string;
  failed_reason_msg?: string;
  test_mode?: string;
};

export const handlePayTRWebhook = async (data: PayTRWebhookData) => {
  try {
    const { merchant_oid, status, total_amount, hash } = data;

    // Hash doğrulama
    const hashStr = merchant_oid + MERCHANT_SALT + status + total_amount + MERCHANT_KEY;
    const calculatedHash = Buffer.from(hashStr).toString('base64');

    if (hash !== calculatedHash) {
      throw new Error('Invalid hash');
    }

    // Ödeme durumunu kontrol et
    if (status === 'success') {
      // Başarılı ödeme durumunda aboneliği aktifleştir
      const { data: subscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .update({
          is_active: true,
          payment_status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('payment_reference', merchant_oid)
        .select()
        .single();

      if (subscriptionError) {
        throw new Error(`Subscription update failed: ${subscriptionError.message}`);
      }

      // Ödeme kaydını güncelle
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          subscription_id: subscription.id,
          amount: total_amount / 100, // PayTR kuruş cinsinden gönderir
          status: 'completed',
          provider: 'paytr',
          provider_payment_id: merchant_oid
        });

      if (paymentError) {
        throw new Error(`Payment record creation failed: ${paymentError.message}`);
      }

      return { success: true };
    } else {
      // Başarısız ödeme durumunda aboneliği güncelle
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .update({
          payment_status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('payment_reference', merchant_oid);

      if (subscriptionError) {
        throw new Error(`Subscription update failed: ${subscriptionError.message}`);
      }

      return { success: false, error: data.failed_reason_msg };
    }
  } catch (error) {
    console.error('PayTR webhook handling error:', error);
    throw error;
  }
};