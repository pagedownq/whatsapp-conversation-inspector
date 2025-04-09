import { supabase } from '@/integrations/supabase/client';

async function updateSubscriptionDates() {
  try {
    // Aktif abonelikleri al
    const { data: activeSubscriptions, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('is_active', true);

    if (fetchError) throw fetchError;

    // Her aktif abonelik için bitiş tarihini güncelle
    for (const subscription of activeSubscriptions) {
      const startDate = new Date(subscription.started_at);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 30);

      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({ expires_at: endDate.toISOString() })
        .eq('id', subscription.id);

      if (updateError) throw updateError;
    }

    console.log('Premium abonelik tarihleri başarıyla güncellendi');
  } catch (error) {
    console.error('Premium abonelik tarihleri güncellenirken hata oluştu:', error);
  }
}

updateSubscriptionDates(); 