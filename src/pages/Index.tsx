
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import EmptyState from '@/components/EmptyState';
import UploadSection from '@/components/UploadSection';
import AnalysisDisplay from '@/components/AnalysisDisplay';
import { parseChat, ChatMessage } from '@/utils/parseChat';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const [uploadMode, setUploadMode] = useState<boolean>(true);
  const [uploadVisible, setUploadVisible] = useState<boolean>(false);
  const [parsedMessages, setParsedMessages] = useState<ChatMessage[]>([]);
  const isMobile = useIsMobile();

  const handleFileProcessed = (content: string) => {
    const messages = parseChat(content);
    setParsedMessages(messages);
    setUploadMode(false);
  };

  const handleUploadClick = () => {
    setUploadVisible(true);
  };

  const handleReset = () => {
    setParsedMessages([]);
    setUploadMode(true);
    setUploadVisible(false);
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
        {uploadMode ? (
          <>
            {!uploadVisible && (
              <EmptyState onUploadClick={handleUploadClick} />
            )}
            
            {uploadVisible && (
              <UploadSection onFileProcessed={handleFileProcessed} />
            )}
          </>
        ) : (
          <AnalysisDisplay 
            chatData={parsedMessages}
            onReset={handleReset}
          />
        )}
      </main>
      
      <motion.footer
        className="py-6 text-center text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <p>WhatsApp Analizer &copy; {new Date().getFullYear()}</p>
      </motion.footer>
    </motion.div>
  );
};

export default Index;
