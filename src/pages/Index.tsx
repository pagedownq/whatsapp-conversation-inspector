
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import Header from '@/components/Header';
import EmptyState from '@/components/EmptyState';
import UploadSection from '@/components/UploadSection';
import AnalysisDisplay from '@/components/AnalysisDisplay';
import WhatsAppView from '@/components/WhatsAppView';
import PastAnalyses from '@/components/PastAnalyses';
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
  const [activeTab, setActiveTab] = useState('analyze');
  const [viewMode, setViewMode] = useState<'analysis' | 'whatsapp' | 'past'>('analysis');
  const [savingAnalysis, setSavingAnalysis] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if there's an active analysis to display
    if (parsedMessages.length > 0 && !uploadMode) {
      try {
        const stats = analyzeChat(parsedMessages);
        setAnalysisStats(stats);
      } catch (error) {
        console.error('Error analyzing chat:', error);
        toast({
          title: 'Analiz Hatası',
          description: 'Sohbet analiz edilirken bir hata oluştu',
          variant: 'destructive'
        });
      }
    }
  }, [parsedMessages, uploadMode]);

  const handleFileProcessed = (content: string) => {
    const messages = parseChat(content);
    setParsedMessages(messages);
    setUploadMode(false);
    setViewMode('analysis');
  };

  const handleUploadClick = () => {
    setUploadVisible(true);
  };

  const handleReset = () => {
    setParsedMessages([]);
    setAnalysisStats(null);
    setUploadMode(true);
    setUploadVisible(false);
    setViewMode('analysis');
  };

  const handleSaveAnalysis = () => {
    if (!analysisStats) return;
    
    try {
      setSavingAnalysis(true);
      
      // Create analysis object
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
      
      // Get existing analyses
      let existingAnalyses = [];
      const storedAnalyses = localStorage.getItem('whatsapp-analyses');
      if (storedAnalyses) {
        existingAnalyses = JSON.parse(storedAnalyses);
      }
      
      // Add new analysis
      existingAnalyses.unshift(newAnalysis);
      
      // Save back to localStorage
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
  };

  const handleSelectAnalysis = (data: ChatStats) => {
    setAnalysisStats(data);
    setUploadMode(false);
    setViewMode('analysis');
  };

  const renderContent = () => {
    if (uploadMode) {
      return (
        <>
          {!uploadVisible && (
            <Tabs defaultValue="upload" className="w-full max-w-4xl mx-auto">
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
          )}
          
          {uploadVisible && (
            <UploadSection onFileProcessed={handleFileProcessed} />
          )}
        </>
      );
    }
    
    if (viewMode === 'whatsapp' && parsedMessages.length > 0) {
      return (
        <WhatsAppView 
          messages={parsedMessages} 
          onBack={() => setViewMode('analysis')}
        />
      );
    }
    
    return (
      <>
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-2">
            <Button 
              variant={viewMode === 'analysis' ? 'default' : 'outline'}
              onClick={() => setViewMode('analysis')}
            >
              Analiz
            </Button>
            <Button 
              variant={viewMode === 'whatsapp' ? 'default' : 'outline'}
              onClick={() => setViewMode('whatsapp')}
            >
              WhatsApp Görünümü
            </Button>
          </div>
          
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
        
        {analysisStats && (
          <AnalysisDisplay 
            chatData={parsedMessages}
            onReset={handleReset}
          />
        )}
      </>
    );
  };

  return (
    <motion.div 
      className="min-h-screen bg-background px-4 md:px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Header />
      
      <main className="container mx-auto max-w-7xl pb-16">
        {renderContent()}
      </main>
      
      <motion.footer
        className="py-6 text-center text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <p>WhatsApp Analyzer &copy; {new Date().getFullYear()}</p>
      </motion.footer>
    </motion.div>
  );
};

export default Index;
