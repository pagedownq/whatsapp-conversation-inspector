
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, CreditCard, Shield, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const Payment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending');

  useEffect(() => {
    // Kullanıcı giriş yapmamışsa auth sayfasına yönlendirelim
    if (!user) {
      navigate('/auth');
      return;
    }

    // URL'den durum parametresini kontrol edelim
    const status = searchParams.get('status');
    if (status === 'success') {
      setPaymentStatus('success');
      toast({
        title: 'Ödeme Başarılı',
        description: 'Premium aboneliğiniz başarıyla aktifleştirildi.',
        variant: 'default'
      });
      
      // 3 saniye sonra anasayfaya yönlendirelim
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 3000);
      return;
    } else if (status === 'failed') {
      setPaymentStatus('failed');
      toast({
        title: 'Ödeme Başarısız',
        description: 'Ödeme işlemi sırasında bir hata oluştu.',
        variant: 'destructive'
      });
      return;
    }

    // Ödeme URL'sini oluşturalım
    const createPayment = async () => {
      try {
        setLoading(true);
        
        // Ödeme kaydı oluşturalım
        const merchantOid = `${user.id}_${Date.now()}`;
        const { error } = await supabase.from('payments').insert({
          user_id: user.id,
          merchant_oid: merchantOid,
          amount: 4999, // 49.99 TL
          status: 'pending'
        });
        
        if (error) throw error;
        
        // Netlify fonksiyonunu çağırarak ödeme bağlantısı oluşturalım
        const response = await fetch('/.netlify/functions/create-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            userId: user.id,
            merchantOid: merchantOid
          }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Ödeme bağlantısı oluşturulamadı');
        }
        
        setPaymentUrl(data.payment_link);
        setPaymentStatus('processing');
      } catch (error) {
        console.error('Ödeme başlatma hatası:', error);
        toast({
          title: 'Hata',
          description: 'Ödeme işlemi başlatılırken bir hata oluştu.',
          variant: 'destructive'
        });
        setPaymentStatus('failed');
      } finally {
        setLoading(false);
      }
    };
    
    createPayment();
  }, [user, navigate, toast, searchParams]);

  const handlePaymentStart = () => {
    if (paymentUrl) {
      // Başarılı ve başarısız durumlar için geri dönüş URL'leri ekleyerek PayTR'ye yönlendirelim
      const currentUrl = window.location.origin;
      const returnUrl = `${currentUrl}/payment?status=success`;
      const failUrl = `${currentUrl}/payment?status=failed`;
      
      const fullPaymentUrl = `${paymentUrl}?return_url=${encodeURIComponent(returnUrl)}&fail_url=${encodeURIComponent(failUrl)}`;
      window.location.href = fullPaymentUrl;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-amber-50 py-12 px-4 will-change-transform">
      <div className="max-w-xl mx-auto transform-gpu">
        <Button
          variant="ghost"
          className="mb-8 hover:scale-105 transition-transform"
          onClick={() => navigate('/pricing')}
          disabled={loading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Fiyatlandırmaya Dön
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-purple-800 mb-2">Premium Abonelik</h1>
          <p className="text-muted-foreground">Gelişmiş özelliklere erişim için ödeme yapın</p>
        </motion.div>

        <Card className="bg-white/80 backdrop-blur-[8px] border-amber-200/50 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-center">
              {paymentStatus === 'pending' && 'Ödeme Hazırlanıyor...'}
              {paymentStatus === 'processing' && 'Güvenli Ödeme'}
              {paymentStatus === 'success' && 'Ödeme Başarılı'}
              {paymentStatus === 'failed' && 'Ödeme Başarısız'}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-6 min-h-[200px]">
            {paymentStatus === 'pending' && (
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-amber-500" />
                <p>Ödeme bağlantısı oluşturuluyor, lütfen bekleyin...</p>
              </div>
            )}

            {paymentStatus === 'processing' && (
              <div className="space-y-6">
                <div className="flex items-center justify-center bg-amber-100 rounded-full p-4">
                  <CreditCard className="h-10 w-10 text-amber-600" />
                </div>
                
                <div className="text-center">
                  <p className="text-lg font-medium mb-1">₺49,99 / Aylık</p>
                  <p className="text-sm text-muted-foreground mb-4">Dilediğiniz zaman iptal edebilirsiniz</p>
                </div>

                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>PayTR güvenli ödeme altyapısı</span>
                </div>
              </div>
            )}

            {paymentStatus === 'success' && (
              <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center justify-center bg-green-100 rounded-full p-4">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium mb-1">Ödemeniz Tamamlandı!</p>
                  <p className="text-sm text-muted-foreground">Premium özelliklere erişiminiz aktifleştirildi.</p>
                  <p className="text-sm text-muted-foreground mt-2">Ana sayfaya yönlendiriliyorsunuz...</p>
                </div>
              </div>
            )}

            {paymentStatus === 'failed' && (
              <div className="text-center space-y-4">
                <p className="text-lg font-medium text-red-600">Ödeme işlemi başarısız oldu.</p>
                <p className="text-sm text-muted-foreground">Lütfen tekrar deneyin veya farklı bir ödeme yöntemi kullanın.</p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Yeniden Dene
                </Button>
              </div>
            )}
          </CardContent>
          
          {paymentStatus === 'processing' && (
            <CardFooter className="flex justify-center">
              <Button 
                onClick={handlePaymentStart}
                className="w-full relative bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-purple-900 border border-amber-300"
              >
                Ödeme Yap
              </Button>
            </CardFooter>
          )}
        </Card>

      </div>
    </div>
  );
};

export default Payment;
