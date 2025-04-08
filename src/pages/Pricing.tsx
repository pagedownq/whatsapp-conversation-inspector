import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Check, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    'Duygu Analizi ve Görselleştirme',
    'Manipülasyon Tespiti',
    'İlişki Dinamikleri Analizi',
    'Detaylı Raporlama',
    'Gelişmiş İstatistikler',
    'Sınırsız Sohbet Analizi',
    'Öncelikli Destek'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-amber-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          className="mb-8"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri Dön
        </Button>

        <div className="text-center mb-12">
          <motion.h1 
            className="text-3xl font-bold text-purple-800 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
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
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-amber-200/50 shadow-xl">
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
                <p className="text-sm text-muted-foreground mt-1">
                  İstediğiniz zaman iptal edebilirsiniz
                </p>
              </div>

              <div className="space-y-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              {!user ? (
                <Button
                  onClick={() => navigate('/auth')}
                  className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-purple-900 border border-amber-300"
                >
                  <Crown className="h-5 w-5 mr-2" />
                  Giriş Yap ve Premium Al
                </Button>
              ) : (
                <Button
                  className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-purple-900 border border-amber-300"
                >
                  <Crown className="h-5 w-5 mr-2" />
                  Premium Üyelik Al
                </Button>
              )}
              <p className="text-xs text-center text-muted-foreground">
                7 gün içinde iade garantisi. Sorularınız için destek ekibimizle iletişime geçebilirsiniz.
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Pricing;