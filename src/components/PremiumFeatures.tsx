import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
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
      <div className="flex justify-center mt-4 mb-6 px-4">
        <motion.button
          onClick={() => setShowDialog(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-amber-200/30 to-amber-500/30 text-purple-800 border border-amber-300/50 hover:bg-amber-200/40 transition-all shadow-soft hover:shadow-lg"
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
        <DialogContent className="bg-gradient-to-b from-white to-amber-50 border border-amber-200/50 max-w-[95vw] sm:max-w-2xl w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2 text-purple-800 text-lg sm:text-xl">
              <Crown className="h-6 w-6 text-amber-500" />
              Premium Analiz Özellikleri
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground text-sm sm:text-base">
              WhatsApp sohbetlerinizi derinlemesine analiz etmek için gelişmiş özellikler
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 py-4">
            {[
              {
                title: "Duygu Analizi",
                desc: "Sohbetinizdeki duygu değişimlerini görselleştirin ve duygusal eğilimleri tespit edin.",
              },
              {
                title: "Manipülasyon Tespiti",
                desc: "Sohbetinizdeki olası manipülatif dil kullanımını ve davranış kalıplarını tespit edin.",
              },
              {
                title: "İlişki Analizi",
                desc: "Konuşmadaki ilişki dinamiklerini, konuşma dengesini ve iletişim kalıplarını analiz edin.",
              },
              {
                title: "Gelişmiş Raporlama",
                desc: "Detaylı ve indirilebilir raporlar ile sohbet analizinizin derinlemesine incelemesine erişin.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 border-amber-200/50 bg-white/80 backdrop-blur-sm hover:shadow-md transition-all"
              >
                <h3 className="font-medium mb-2 text-purple-800 flex items-center gap-2 text-base">
                  <Badge className="bg-amber-200 text-purple-800">Premium</Badge>
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center my-3">
            <span className="text-xl font-bold text-purple-800">₺49,99</span>
            <span className="text-muted-foreground text-sm"> /ay</span>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              İstediğiniz zaman iptal edebilirsiniz.
            </p>
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between mt-2">
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              className="border-amber-200/50 text-purple-800 w-full sm:w-auto"
            >
              <X className="h-4 w-4 mr-2" />
              Kapat
            </Button>
            {!user ? (
              <Button
                onClick={handleLoginClick}
                className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-purple-900 border border-amber-300 w-full sm:w-auto"
              >
                <Crown className="h-4 w-4 mr-2" />
                Giriş Yap ve Premium Al
              </Button>
            ) : (
              <Button
                onClick={() => navigate('/premium')}
                className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-purple-900 border border-amber-300 w-full sm:w-auto"
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
