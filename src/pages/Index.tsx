
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import Header from '@/components/Header';
import EmptyState from '@/components/EmptyState';
import UploadSection from '@/components/UploadSection';
import AnalysisDisplay from '@/components/AnalysisDisplay';
import PastAnalyses from '@/components/PastAnalyses';
import ConsentDialog from '@/components/ConsentDialog';
import AdSenseAd from '@/components/AdSenseAd';
import { parseChat, ChatMessage } from '@/utils/parseChat';
import { analyzeChat, ChatStats } from '@/utils/analyzeChat';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [uploadMode, setUploadMode] = useState<boolean>(true);
  const [uploadVisible, setUploadVisible] = useState<boolean>(false);
  const [parsedMessages, setParsedMessages] = useState<ChatMessage[]>([]);
  const [analysisStats, setAnalysisStats] = useState<ChatStats | null>(null);
  const [activeTab, setActiveTab] = useState('upload');
  const [viewMode, setViewMode] = useState<'analysis' | 'past'>('analysis');
  const [savingAnalysis, setSavingAnalysis] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [hasConsent, setHasConsent] = useState<boolean>(false);
  const [showConsentDialog, setShowConsentDialog] = useState<boolean>(true);
  
  useEffect(() => {
    const userConsent = localStorage.getItem('user-consent');
    if (userConsent === 'accepted') {
      setHasConsent(true);
      setShowConsentDialog(false);
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
      setViewMode('analysis');
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
    setViewMode('analysis');
    setActiveTab('upload');
  }, []);

  const handleSelectAnalysis = useCallback((data: ChatStats) => {
    setAnalysisStats(data);
    setUploadMode(false);
    setViewMode('analysis');
  }, []);

  const handleSaveAnalysis = useCallback(() => {
    if (!analysisStats) return;
    
    try {
      setSavingAnalysis(true);
      
      const newAnalysis = {
        id: uuidv4(),
        date: new Date().toISOString(),
        title: `WhatsApp Analizi (${analysisStats.participantStats ? Object.keys(analysisStats.participantStats).length : 0} kişi)`,
        participantCount: analysisStats.participantStats ? Object.keys(analysisStats.participantStats).length : 0,
        messageCount: analysisStats.totalMessages,
        duration: analysisStats.duration,
        startDate: analysisStats.startDate,
        endDate: analysisStats.endDate,
        mostManipulative: analysisStats.manipulation.mostManipulative,
        data: analysisStats
      };
      
      let existingAnalyses = [];
      const storedAnalyses = localStorage.getItem('whatsapp-analyses');
      if (storedAnalyses) {
        existingAnalyses = JSON.parse(storedAnalyses);
      }
      
      existingAnalyses.unshift(newAnalysis);
      
      localStorage.setItem('whatsapp-analyses', JSON.stringify(existingAnalyses));
      
      toast({
        title: 'Analiz Kaydedildi',
        description: 'Bu analiz geçmiş analizlere kaydedildi',
      });
      
      setSavingAnalysis(false);
    } catch (error) {
      console.error('Error saving analysis:', error);
      toast({
        title: 'Kaydetme Hatası',
        description: 'Analiz kaydedilirken bir hata oluştu',
        variant: 'destructive'
      });
      setSavingAnalysis(false);
    }
  }, [analysisStats, toast]);

  const renderContent = () => {
    if (uploadMode) {
      return (
        <>
          {!uploadVisible && (
            <>
              <Tabs defaultValue={activeTab} className="w-full max-w-4xl mx-auto" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">Yeni Analiz</TabsTrigger>
                  <TabsTrigger value="past">Geçmiş Analizler</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload">
                  <EmptyState onUploadClick={handleUploadClick} />
                </TabsContent>
                
                <TabsContent value="past">
                  <PastAnalyses onSelectAnalysis={handleSelectAnalysis} />
                </TabsContent>
              </Tabs>
              
              {/* Üst Banner Reklam */}
              <div className="mt-8 mb-4 w-full">
                <AdSenseAd adSlot="1234567890" className="mx-auto" />
              </div>
            </>
          )}
          
          {uploadVisible && (
            <UploadSection onFileProcessed={handleFileProcessed} />
          )}
        </>
      );
    }
    
    return (
      <>
        <div className="flex items-center justify-between mb-6">          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={handleSaveAnalysis}
              disabled={savingAnalysis}
            >
              {savingAnalysis ? 'Kaydediliyor...' : 'Analizi Kaydet'}
            </Button>
            <Button onClick={handleReset} variant="outline">
              Yeni Analiz
            </Button>
          </div>
        </div>
        
        {/* Analiz Öncesi Reklam */}
        <div className="mb-6 w-full">
          <AdSenseAd adSlot="2345678901" className="mx-auto" />
        </div>
        
        {analysisStats && (
          <AnalysisDisplay 
            chatData={parsedMessages}
            onReset={handleReset}
          />
        )}
        
        {/* Analiz Sonrası Reklam */}
        <div className="mt-8 w-full">
          <AdSenseAd adSlot="3456789012" className="mx-auto" />
        </div>
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
          className="min-h-screen bg-background px-4 md:px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Header />
          
          <main className="container mx-auto max-w-7xl pb-16">
            {renderContent()}
          </main>
          
          <motion.footer
            className="py-6 text-center text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <p>WhatsApp Analyzer &copy; {new Date().getFullYear()}</p>
          </motion.footer>
        </motion.div>
      )}
    </>
  );
};

export default Index;
