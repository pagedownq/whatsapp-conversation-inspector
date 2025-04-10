import { serve } from 'https://deno.fresh.dev/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { merchant_oid, status, total_amount, hash } = await req.json();

    // Hash doğrulaması
    const merchantKey = Deno.env.get('PAYTR_MERCHANT_KEY');
    if (!merchantKey) {
      throw new Error('PAYTR_MERCHANT_KEY is not configured');
    }

    // TODO: Hash doğrulaması eklenecek

    if (status === 'success') {
      // Aboneliği aktifleştir
      const { data: subscription, error: subscriptionError } = await supabaseClient
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
        throw subscriptionError;
      }

      // Ödeme kaydını oluştur
      const { error: paymentError } = await supabaseClient
        .from('payments')
        .insert({
          subscription_id: subscription.id,
          amount: total_amount / 100,
          status: 'completed',
          provider: 'paytr',
          provider_payment_id: merchant_oid
        });

      if (paymentError) {
        throw paymentError;
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } else {
      // Başarısız ödeme durumunu güncelle
      const { error: subscriptionError } = await supabaseClient
        .from('subscriptions')
        .update({
          payment_status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('payment_reference', merchant_oid);

      if (subscriptionError) {
        throw subscriptionError;
      }

      return new Response(
        JSON.stringify({ success: false, error: 'Payment failed' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }
  } catch (error) {
    console.error('Error processing PayTR webhook:', error);

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});