
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Link } from 'react-router-dom';

interface CookieConsentProps {
  onAcceptAll: () => void;
  onAcceptEssential: () => void;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ 
  onAcceptAll, 
  onAcceptEssential 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Check if cookie consent is already given
    const hasConsent = localStorage.getItem('cookie-consent');
    
    if (!hasConsent) {
      // Show cookie banner after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  const handleAcceptAll = () => {
    localStorage.setItem('cookie-consent', 'all');
    setIsVisible(false);
    onAcceptAll();
  };
  
  const handleAcceptEssential = () => {
    localStorage.setItem('cookie-consent', 'essential');
    setIsVisible(false);
    onAcceptEssential();
  };
  
  if (!isVisible) return null;
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 40 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-background border-t shadow-lg"
        >
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">Çerez Kullanımı</h3>
                <p className="text-sm text-muted-foreground">
                  Bu site, deneyiminizi geliştirmek için çerezleri kullanır. Google AdSense reklamlarının düzgün çalışması için çerezlere izin vermeniz gerekmektedir. 
                  Detaylı bilgi için <Link to="/privacy-policy" className="text-primary hover:underline">Gizlilik Politikamızı</Link> inceleyebilirsiniz.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={handleAcceptEssential}>
                        Sadece Gerekli Olanlar
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Sadece sitenin çalışması için gerekli çerezleri kabul eder. Reklamlar kişiselleştirilmez.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <Button size="sm" onClick={handleAcceptAll}>
                  Tümünü Kabul Et
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
