
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Lock, CheckCircle, AlertTriangle, Loader2, Crown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type SubscriptionCheckProps = {
  children: React.ReactNode;
};

const SubscriptionCheck: React.FC<SubscriptionCheckProps> = ({ children }) => {
  const { user, subscription, refreshSubscription } = useAuth();
  const [isActivating, setIsActivating] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // For demo purposes, this would actually connect to a payment processor
  const activateSubscription = async () => {
    if (!user) {
      toast({
        title: 'Giriş gerekli',
        description: 'Premium özellikleri kullanmak için giriş yapmalısınız',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    try {
      setIsActivating(true);
      
      // In a real application, this would integrate with a payment processor
      // For demo purposes, we'll just create a subscription record
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          is_active: true,
          subscription_type: 'premium',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        });

      if (error) throw error;

      await refreshSubscription();
      
      toast({
        title: 'Abonelik Aktifleştirildi',
        description: 'Premium özelliklere erişim kazandınız',
      });
      
      setShowDialog(false);
    } catch (error: any) {
      toast({
        title: 'İşlem başarısız',
        description: error.message || 'Abonelik aktifleştirilemedi',
        variant: 'destructive',
      });
    } finally {
      setIsActivating(false);
    }
  };

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-[300px] p-6 text-center"
      >
        <Lock className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Premium Özellik</h2>
        <p className="text-muted-foreground mb-6">
          Bu özelliği kullanmak için giriş yapmanız gerekmektedir.
        </p>
        <Button onClick={() => navigate('/auth')}>Giriş Yap / Kayıt Ol</Button>
      </motion.div>
    );
  }

  if (!subscription?.isActive) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center min-h-[300px] p-6 text-center"
        >
          <div className="relative mb-4">
            <div className="absolute inset-0 gold-shimmer rounded-full"></div>
            <Crown className="h-14 w-14 text-purple-800 relative z-10" />
          </div>
          <h2 className="text-xl font-semibold mb-2 text-purple-800">Premium Abonelik Gerekli</h2>
          <p className="text-muted-foreground mb-6">
            Bu özelliği kullanmak için premium aboneliğe sahip olmanız gerekmektedir.
          </p>
          <Button 
            onClick={() => setShowDialog(true)}
            className="premium-button"
          >
            <Crown className="h-4 w-4 mr-2 text-amber-500" />
            Abonelik Al
          </Button>
        </motion.div>
        
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="bg-gradient-to-b from-white to-amber-50 border border-amber-200/50">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-center gap-2 text-purple-800">
                <Crown className="h-5 w-5 text-amber-500" />
                Premium Abonelik
              </DialogTitle>
              <DialogDescription>
                WhatsApp analizin duygu, manipülasyon ve ilişki analizi özelliğine erişim kazanın.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="border rounded-lg p-4 mb-4 border-amber-200/50 bg-white/80 backdrop-blur-sm">
                <h3 className="font-medium mb-2 text-purple-800">Premium Özellikleri:</h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
                    <span>Detaylı duygu analizi</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
                    <span>Manipülasyon tespiti</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
                    <span>İlişki dinamikleri analizi</span>
                  </li>
                </ul>
              </div>
              
              <div className="text-center mb-2">
                <span className="text-2xl font-bold text-purple-800">₺49,99</span>
                <span className="text-muted-foreground">/ay</span>
              </div>
              <p className="text-center text-sm text-muted-foreground mb-4">
                İstediğiniz zaman iptal edebilirsiniz.
              </p>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowDialog(false)}
                disabled={isActivating}
                className="border-amber-200/50 text-purple-800"
              >
                İptal
              </Button>
              <Button 
                onClick={activateSubscription}
                disabled={isActivating}
                className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-purple-900 border border-amber-300"
              >
                {isActivating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    İşleniyor...
                  </>
                ) : (
                  <>
                    <Crown className="mr-2 h-4 w-4" />
                    Şimdi Abone Ol
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // If the user is logged in and has an active subscription, render the content
  return <>{children}</>;
};

export default SubscriptionCheck;
