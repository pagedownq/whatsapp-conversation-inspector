
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, MessageSquare } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '@/utils/parseChat';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChatBubbleProps {
  message: ChatMessage;
  isCurrentUser: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isCurrentUser }) => {
  // Format date for display (HH:MM)
  const time = message.time;
  
  return (
    <div className={`flex mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
          isCurrentUser 
            ? 'bg-green-500 text-white rounded-tr-none' 
            : 'bg-gray-200 dark:bg-gray-700 text-foreground rounded-tl-none'
        }`}
      >
        {!isCurrentUser && (
          <div className="text-xs font-bold mb-1 text-primary">{message.sender}</div>
        )}
        <div className="text-sm whitespace-pre-wrap break-words">
          {message.content}
        </div>
        <div className="text-xs mt-1 text-right opacity-70">
          {time}
        </div>
      </div>
    </div>
  );
};

const ChatView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<ChatMessage[]>([]);
  const isMobile = useIsMobile();

  // Get messages from location state
  useEffect(() => {
    if (location.state && location.state.messages) {
      setMessages(location.state.messages);
      setFilteredMessages(location.state.messages);
    }
  }, [location.state]);

  // Handle search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredMessages(messages);
    } else {
      const filtered = messages.filter(message => 
        message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.sender.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMessages(filtered);
    }
  }, [searchTerm, messages]);

  // Group messages by date
  const groupedMessages: Record<string, ChatMessage[]> = {};
  filteredMessages.forEach(message => {
    if (!groupedMessages[message.date]) {
      groupedMessages[message.date] = [];
    }
    groupedMessages[message.date].push(message);
  });

  const dates = Object.keys(groupedMessages).sort((a, b) => {
    // Convert dates to comparable format
    const partsA = a.split(/[./]/);
    const partsB = b.split(/[./]/);
    
    // Assume DD/MM/YYYY or DD.MM.YYYY format
    const dateA = new Date(`${partsA[1]}/${partsA[0]}/${partsA[2].length === 2 ? '20' + partsA[2] : partsA[2]}`);
    const dateB = new Date(`${partsB[1]}/${partsB[0]}/${partsB[2].length === 2 ? '20' + partsB[2] : partsB[2]}`);
    
    return dateA.getTime() - dateB.getTime();
  });

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <motion.div 
      className="flex flex-col h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 flex items-center sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={handleGoBack} className="mr-2 text-white">
          <ArrowLeft />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">WhatsApp Chat</h1>
          <p className="text-xs opacity-80">{messages.length} messages</p>
        </div>
      </div>
      
      {/* Search */}
      <div className="p-4 bg-background border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      {/* Messages */}
      {filteredMessages.length > 0 ? (
        <ScrollArea className="flex-1 p-4">
          {dates.map(date => (
            <div key={date}>
              <div className="flex justify-center my-4">
                <div className="bg-muted px-3 py-1 rounded-full text-xs">
                  {date}
                </div>
              </div>
              
              {groupedMessages[date].map((message, index) => {
                // Get the participant names
                const participants = Array.from(new Set(messages.map(m => m.sender)));
                // For the demo, we'll consider the first participant as "you"
                const isCurrentUser = message.sender === participants[0];
                
                return (
                  <ChatBubble 
                    key={`${date}-${index}`} 
                    message={message} 
                    isCurrentUser={isCurrentUser}
                  />
                );
              })}
            </div>
          ))}
        </ScrollArea>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No messages found</h3>
          <p className="text-muted-foreground">
            {messages.length > 0 
              ? "Try a different search term" 
              : "Please upload a chat file first"}
          </p>
          {messages.length === 0 && (
            <Button 
              className="mt-4" 
              onClick={handleGoBack}
            >
              Go to Upload
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default ChatView;
