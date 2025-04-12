-- Ödemeleri depolamak için tablo oluşturma
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  merchant_oid TEXT NOT NULL UNIQUE,
  amount INTEGER NOT NULL,
  payment_type TEXT NOT NULL DEFAULT 'premium',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  payment_response JSONB
);

-- Satır seviyesi güvenlik
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Kullanıcıların kendi ödemelerini görmelerine izin ver
CREATE POLICY "Users can view their own payments" 
  ON public.payments 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Kullanıcıların ödeme yapmasına izin ver
CREATE POLICY "Users can create payments" 
  ON public.payments 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Servis hesabının tüm ödemeleri güncellemesine izin ver
CREATE POLICY "Service role can update all payments" 
  ON public.payments 
  FOR UPDATE 
  USING (true);

-- Başarılı ödemelerde subscription tablosunu güncellemek için trigger
CREATE OR REPLACE FUNCTION update_subscription_after_payment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'success' AND OLD.status != 'success' THEN
    -- Mevcut aktif aboneliği devre dışı bırak
    UPDATE public.subscriptions
    SET is_active = false
    WHERE user_id = NEW.user_id AND is_active = true;
    
    -- Yeni abonelik oluştur
    INSERT INTO public.subscriptions (
      user_id,
      is_active,
      subscription_type,
      started_at,
      expires_at
    ) VALUES (
      NEW.user_id,
      true,
      NEW.payment_type,
      NOW(),
      NOW() + INTERVAL '30 days'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscription_after_payment_trigger
  AFTER UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_after_payment();