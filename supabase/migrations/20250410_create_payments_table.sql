
-- Ödemeleri depolamak için tablo oluşturma
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  merchant_oid TEXT NOT NULL UNIQUE,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
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
