
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, CheckCircle, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const PremiumFeatures = () => {
  const [showDialog, setShowDialog] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/auth');
  };

  return (
    <>
      <div className="flex justify-center mt-4 mb-8">
        <motion.button
          onClick={() => setShowDialog(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-200/30 to-amber-500/30 text-purple-800 border border-amber-300/50 hover:bg-amber-200/40 transition-all shadow-soft hover:shadow-lg"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <Crown className="h-5 w-5 text-amber-500" />
          <span className="font-medium">Premium Özellikler</span>
          <div className="relative ml-1">
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
          </div>
        </motion.button>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-gradient-to-b from-white to-amber-50 border border-amber-200/50 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2 text-purple-800">
              <Crown className="h-6 w-6 text-amber-500" />
              Premium Analiz Özellikleri
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              WhatsApp sohbetlerinizi derinlemesine analiz etmek için gelişmiş özellikler
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="border rounded-lg p-4 border-amber-200/50 bg-white/80 backdrop-blur-sm hover:shadow-md transition-all">
              <h3 className="font-medium mb-3 text-purple-800 flex items-center gap-2">
                <Badge variant="premium">Premium</Badge>
                Duygu Analizi
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Sohbetinizdeki duygu değişimlerini görselleştirin ve duygusal eğilimleri tespit edin.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-xs">
                  <CheckCircle className="h-3.5 w-3.5 text-amber-500 mr-2 flex-shrink-0" />
                  <span>Pozitif/negatif duygu grafiği</span>
                </li>
                <li className="flex items-center text-xs">
                  <CheckCircle className="h-3.5 w-3.5 text-amber-500 mr-2 flex-shrink-0" />
                  <span>Zaman içindeki duygu değişimleri</span>
                </li>
              </ul>
            </div>
            
            <div className="border rounded-lg p-4 border-amber-200/50 bg-white/80 backdrop-blur-sm hover:shadow-md transition-all">
              <h3 className="font-medium mb-3 text-purple-800 flex items-center gap-2">
                <Badge variant="premium">Premium</Badge>
                Manipülasyon Tespiti
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Sohbetinizdeki olası manipülatif dil kullanımını ve davranış kalıplarını tespit edin.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-xs">
                  <CheckCircle className="h-3.5 w-3.5 text-amber-500 mr-2 flex-shrink-0" />
                  <span>Manipülatif dil kullanımı analizi</span>
                </li>
                <li className="flex items-center text-xs">
                  <CheckCircle className="h-3.5 w-3.5 text-amber-500 mr-2 flex-shrink-0" />
                  <span>Psikolojik baskı göstergeleri</span>
                </li>
              </ul>
            </div>
            
            <div className="border rounded-lg p-4 border-amber-200/50 bg-white/80 backdrop-blur-sm hover:shadow-md transition-all">
              <h3 className="font-medium mb-3 text-purple-800 flex items-center gap-2">
                <Badge variant="premium">Premium</Badge>
                İlişki Analizi
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Konuşmadaki ilişki dinamiklerini, konuşma dengesini ve iletişim kalıplarını analiz edin.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-xs">
                  <CheckCircle className="h-3.5 w-3.5 text-amber-500 mr-2 flex-shrink-0" />
                  <span>Konuşma dengesi ve dominantlık analizi</span>
                </li>
                <li className="flex items-center text-xs">
                  <CheckCircle className="h-3.5 w-3.5 text-amber-500 mr-2 flex-shrink-0" />
                  <span>Yanıt süreleri ve etkileşim kalıpları</span>
                </li>
              </ul>
            </div>
            
            <div className="border rounded-lg p-4 border-amber-200/50 bg-white/80 backdrop-blur-sm hover:shadow-md transition-all">
              <h3 className="font-medium mb-3 text-purple-800 flex items-center gap-2">
                <Badge variant="premium">Premium</Badge>
                Gelişmiş Raporlama
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Detaylı ve indirilebilir raporlar ile sohbet analizinizin derinlemesine incelemesine erişin.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-xs">
                  <CheckCircle className="h-3.5 w-3.5 text-amber-500 mr-2 flex-shrink-0" />
                  <span>PDF formatında kapsamlı rapor</span>
                </li>
                <li className="flex items-center text-xs">
                  <CheckCircle className="h-3.5 w-3.5 text-amber-500 mr-2 flex-shrink-0" />
                  <span>Grafik ve görseller ile zenginleştirilmiş veriler</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center my-2">
            <span className="text-2xl font-bold text-purple-800">₺49,99</span>
            <span className="text-muted-foreground">/ay</span>
            <p className="text-sm text-muted-foreground mt-1">
              İstediğiniz zaman iptal edebilirsiniz.
            </p>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setShowDialog(false)}
              className="border-amber-200/50 text-purple-800"
            >
              <X className="h-4 w-4 mr-2" />
              Kapat
            </Button>
            {!user ? (
              <Button 
                onClick={handleLoginClick}
                className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-purple-900 border border-amber-300"
              >
                <Crown className="h-4 w-4 mr-2" />
                Giriş Yap ve Premium Al
              </Button>
            ) : (
              <Button 
                onClick={() => navigate('/premium')}
                className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-purple-900 border border-amber-300"
              >
                <Crown className="h-4 w-4 mr-2" />
                Premium Üyelik Al
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PremiumFeatures;
