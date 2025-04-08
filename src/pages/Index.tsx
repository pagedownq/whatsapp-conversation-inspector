import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import EmptyState from '@/components/EmptyState';
import UploadSection from '@/components/UploadSection';
import AnalysisDisplay from '@/components/AnalysisDisplay';
import ConsentDialog from '@/components/ConsentDialog';
import CookieConsent from '@/components/CookieConsent';
import Footer from '@/components/Footer';
import { parseChat, ChatMessage } from '@/utils/parseChat';
import { analyzeChat, ChatStats } from '@/utils/analyzeChat';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, ArrowLeft, Upload } from 'lucide-react';
import PremiumFeatures from '@/components/PremiumFeatures';

const Index = () => {
  const [uploadMode, setUploadMode] = useState<boolean>(true);
  const [uploadVisible, setUploadVisible] = useState<boolean>(false);
  const [parsedMessages, setParsedMessages] = useState<ChatMessage[]>([]);
  const [analysisStats, setAnalysisStats] = useState<ChatStats | null>(null);
  const [savingAnalysis, setSavingAnalysis] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, signOut, subscription } = useAuth();
  
  const [hasConsent, setHasConsent] = useState<boolean>(false);
  const [showConsentDialog, setShowConsentDialog] = useState<boolean>(true);
  const [cookieConsent, setCookieConsent] = useState<'all' | 'essential' | null>(null);
  
  useEffect(() => {
    const userConsent = localStorage.getItem('user-consent');
    if (userConsent === 'accepted') {
      setHasConsent(true);
      setShowConsentDialog(false);
    }
    
    const cookiePreference = localStorage.getItem('cookie-consent');
    if (cookiePreference === 'all' || cookiePreference === 'essential') {
      setCookieConsent(cookiePreference);
    }
  }, []);
  
  const handleAcceptConsent = useCallback(() => {
    localStorage.setItem('user-consent', 'accepted');
    setHasConsent(true);
    setShowConsentDialog(false);
    
    toast({
      title: 'Kabul Edildi',
      description: 'Çerez ve veri kullanım koşullarını kabul ettiniz. Uygulamayı kullanabilirsiniz.',
    });
  }, [toast]);

  const handleAcceptAllCookies = useCallback(() => {
    setCookieConsent('all');
    localStorage.setItem('cookie-consent', 'all');
    // Enable all cookies including advertising
    toast({
      title: 'Çerezler Kabul Edildi',
      description: 'Tüm çerezler kabul edildi, size daha iyi bir deneyim sunabileceğiz.',
    });
  }, [toast]);
  
  const handleAcceptEssentialCookies = useCallback(() => {
    setCookieConsent('essential');
    localStorage.setItem('cookie-consent', 'essential');
    // Only enable essential cookies
    toast({
      title: 'Temel Çerezler Kabul Edildi',
      description: 'Sadece gerekli çerezler kabul edildi, bazı özellikler sınırlı olabilir.',
    });
  }, [toast]);

  const analyzeMessages = useCallback((messages: ChatMessage[]) => {
    try {
      const stats = analyzeChat(messages);
      setAnalysisStats(stats);
    } catch (error) {
      console.error('Error analyzing chat:', error);
      toast({
        title: 'Analiz Hatası',
        description: 'Sohbet analiz edilirken bir hata oluştu',
        variant: 'destructive'
      });
    }
  }, [toast]);

  useEffect(() => {
    if (parsedMessages.length > 0 && !uploadMode) {
      analyzeMessages(parsedMessages);
    }
  }, [parsedMessages, uploadMode, analyzeMessages]);

  const handleFileProcessed = useCallback((content: string) => {
    try {
      const messages = parseChat(content);
      
      if (messages.length === 0) {
        toast({
          title: 'Dosya Hatası',
          description: 'Dosya içerisinde mesaj bulunamadı veya dosya formatı uygun değil',
          variant: 'destructive'
        });
        return;
      }
      
      setParsedMessages(messages);
      setUploadMode(false);
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: 'Dosya Hatası',
        description: 'Dosya işlenirken bir hata oluştu',
        variant: 'destructive'
      });
    }
  }, [toast]);

  const handleUploadClick = useCallback(() => {
    setUploadVisible(true);
  }, []);

  const handleReset = useCallback(() => {
    setParsedMessages([]);
    setAnalysisStats(null);
    setUploadMode(true);
    setUploadVisible(false);
  }, []);

  const renderContent = () => {
    if (uploadMode) {
      return (
        <>
          {!uploadVisible ? (
            <div className="w-full max-w-4xl mx-auto px-1 sm:px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-card border rounded-xl sm:rounded-2xl p-3 sm:p-8 shadow-md"
              >
                <EmptyState onUploadClick={handleUploadClick} />
              </motion.div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-2xl mx-auto px-1 sm:px-4"
            >
              <div className="mb-3 sm:mb-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setUploadVisible(false)}
                  className="flex items-center gap-1 w-full sm:w-auto text-xs sm:text-sm"
                >
                  <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                  Geri Dön
                </Button>
              </div>
              <UploadSection onFileProcessed={handleFileProcessed} />
            </motion.div>
          )}
        </>
      );
    }
    
    return (
      <>
        <div className="flex flex-col sm:flex-row items-center justify-between mb-3 sm:mb-6 gap-2 sm:gap-3 px-1 sm:px-4">          
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 w-full sm:w-auto">
            <Button 
              onClick={handleReset} 
              variant="outline" 
              className="whitespace-nowrap flex items-center gap-1 w-full sm:w-auto text-xs sm:text-sm"
            >
              <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
              Yeni Dosya Yükle
            </Button>
          </div>
        </div>
        
        {analysisStats && (
          <div className="px-1 sm:px-4">
            <AnalysisDisplay 
              chatData={parsedMessages}
              onReset={handleReset}
            />
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <ConsentDialog 
        isOpen={showConsentDialog} 
        onAccept={handleAcceptConsent} 
      />
      
      {hasConsent && (
        <motion.div 
          className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/95 px-1 sm:px-4 md:px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Header />
          
          {/* Premium Features Component */}
          <PremiumFeatures />
          
          {/* Only show user info if logged in */}
          {user && (
            <div className="flex justify-center items-center mb-3 sm:mb-6">
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-card rounded-lg shadow-sm border w-full sm:w-auto max-w-sm mx-2 sm:mx-0">
                <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                  {user.email}
                </div>
                <Button variant="outline" size="sm" onClick={() => signOut()} className="w-full sm:w-auto text-xs sm:text-sm">
                  <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Çıkış Yap
                </Button>
              </div>
            </div>
          )}
          
          <main className="container mx-auto max-w-7xl flex-1 pb-6 sm:pb-16 overflow-hidden">
            {renderContent()}
          </main>
          
          <Footer />
          
          <CookieConsent 
            onAcceptAll={handleAcceptAllCookies}
            onAcceptEssential={handleAcceptEssentialCookies}
          />
        </motion.div>
      )}
    </>
  );
};

export default Index;
