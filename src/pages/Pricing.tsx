
import React, { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Check, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const FeatureItem = React.memo(({ feature, index }: { feature: string; index: number }) => (
  <motion.div
    key={index}
    className="flex items-center gap-3"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.2, delay: index * 0.05 }}
  >
    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
      <Check className="h-4 w-4 text-green-600" />
    </div>
    <span className="text-gray-700">{feature}</span>
  </motion.div>
));

const Pricing = () => {
  const navigate = useNavigate();
  const { user, refreshSubscription } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);

  // Ödeme işlemi sonrası durum kontrolü
  useEffect(() => {
    const checkPaymentStatus = async () => {
      const status = searchParams.get('status');
      if (!status || !user) return;
      
      if (status === 'success') {
        setLoading(true);
        // Kullanıcının abonelik durumunu güncelleyelim
        await refreshSubscription();
        setLoading(false);
        
        toast({
          title: 'Ödeme Başarılı',
          description: 'Premium aboneliğiniz başarıyla aktifleştirildi.',
          variant: 'default'
        });
        
        // URL'den status parametresini temizleyelim
        navigate('/pricing', { replace: true });
      } else if (status === 'failed') {
        toast({
          title: 'Ödeme Başarısız',
          description: 'Ödeme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.',
          variant: 'destructive'
        });
        
        // URL'den status parametresini temizleyelim
        navigate('/pricing', { replace: true });
      }
    };
    
    checkPaymentStatus();
  }, [searchParams, toast, navigate, user, refreshSubscription]);

  const handlePayment = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      // Ödeme kaydı oluşturma
      const merchantOid = `${user.id}_${Date.now()}`;
      
      const { error } = await supabase.from('payments').insert({
        user_id: user.id,
        merchant_oid: merchantOid,
        amount: 4999, // 49.99 TL
        status: 'pending'
      });
      
      if (error) {
        throw error;
      }
      
      // PayTR link sayfasına yönlendirme (başarılı ve başarısız durumlar için geri dönüş URL'leri ile)
      const currentUrl = window.location.origin;
      // PayTR'ye gidecek URL'in sonuna dönüş parametreleri ekleniyor
      window.location.href = `https://www.paytr.com/link/ANDPOpo?return_url=${encodeURIComponent(currentUrl + '/pricing?status=success')}&fail_url=${encodeURIComponent(currentUrl + '/pricing?status=failed')}`;
      return;
    } catch (error) {
      console.error('Ödeme hatası:', error);
      toast({
        title: 'Hata',
        description: 'Ödeme işlemi başlatılırken bir hata oluştu. Lütfen tekrar deneyin.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const features = useMemo(() => [
    'Duygu Analizi ve Görselleştirme',
    'Manipülasyon Tespiti',
    'İlişki Dinamikleri Analizi',
    'Detaylı Raporlama',
    'Gelişmiş İstatistikler',
    'Sınırsız Sohbet Analizi',
    'Öncelikli Destek'
  ], []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-amber-50 py-12 px-4 will-change-transform">
      <div className="max-w-4xl mx-auto transform-gpu">
        <Button
          variant="ghost"
          className="mb-8 hover:scale-105 transition-transform"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri Dön
        </Button>

        <div className="text-center mb-12 transform-gpu">
          <motion.h1 
            className="text-3xl font-bold text-purple-800 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            Premium Analiz Özellikleri
          </motion.h1>
          <p className="text-muted-foreground text-lg">
            WhatsApp sohbetlerinizi derinlemesine analiz etmek için gelişmiş özellikler
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="transform-gpu"
        >
          <Card className="bg-white/80 backdrop-blur-[8px] border-amber-200/50 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-amber-100">
                  <Crown className="h-8 w-8 text-amber-500" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-purple-800">Premium Paket</CardTitle>
              <CardDescription>Tüm gelişmiş özelliklere erişim</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <span className="text-4xl font-bold text-purple-800">₺49,99</span>
                <span className="text-muted-foreground"> /ay</span>
                
              </div>

              <div className="space-y-4">
                {features.map((feature, index) => (
                  <FeatureItem key={index} feature={feature} index={index} />
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                onClick={handlePayment}
                disabled={loading}
                className="w-full relative bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-purple-900 border border-amber-300"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Crown className="h-5 w-5 mr-2" />
                    Premium Üyelik Al
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Pricing;
