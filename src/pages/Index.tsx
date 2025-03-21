
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import EmptyState from '@/components/EmptyState';
import UploadSection from '@/components/UploadSection';
import AnalysisDisplay from '@/components/AnalysisDisplay';
import { parseChat, ChatMessage } from '@/utils/parseChat';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

const Index = () => {
  const [uploadMode, setUploadMode] = useState<boolean>(true);
  const [uploadVisible, setUploadVisible] = useState<boolean>(false);
  const [parsedMessages, setParsedMessages] = useState<ChatMessage[]>([]);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

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

  const handleViewChatClick = () => {
    navigate('/chat', { state: { messages: parsedMessages } });
  };

  return (
    <motion.div 
      className="min-h-screen bg-background px-2 md:px-6"
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
          <>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-2">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Chat Analysis</h2>
              <div className="flex gap-2">
                <Button 
                  onClick={handleViewChatClick}
                  className="flex-1 sm:flex-none flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  View Chat
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleReset}
                  className="flex-1 sm:flex-none"
                >
                  Upload New Chat
                </Button>
              </div>
            </div>
            <AnalysisDisplay 
              chatData={parsedMessages}
              onReset={handleReset}
            />
          </>
        )}
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
