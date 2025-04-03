
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { ChatMessage } from '@/utils/parseChat';
import { MessageSquare, Paperclip, Smile, Mic, ChevronLeft, MoreVertical, Phone, Video, Search } from 'lucide-react';
import { getSentimentColor } from '@/utils/sentimentAnalysis';
import { analyzeSentiment, detectManipulation } from '@/utils/sentimentAnalysis';
import { useIsMobile } from '@/hooks/use-mobile';

interface WhatsAppViewProps {
  messages: ChatMessage[];
  onBack: () => void;
}

const WhatsAppView: React.FC<WhatsAppViewProps> = ({ messages, onBack }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => {
      const dateA = new Date(formatDateTimeForParsing(a.date, a.time));
      const dateB = new Date(formatDateTimeForParsing(b.date, b.time));
      return dateA.getTime() - dateB.getTime();
    });
  }, [messages]);
  
  const participants = useMemo(() => {
    return Array.from(new Set(messages.map(msg => msg.sender)));
  }, [messages]);

  const messagesByDate = useMemo(() => {
    const result: Record<string, ChatMessage[]> = {};
    sortedMessages.forEach(message => {
      if (!result[message.date]) {
        result[message.date] = [];
      }
      result[message.date].push(message);
    });
    return result;
  }, [sortedMessages]);

  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    
    return () => clearTimeout(timer);
  }, [messages]);

  function formatDateTimeForParsing(date: string, time: string): string {
    const normalized = date.replace(/[/\-]/g, '.');
    const parts = normalized.split('.');
    
    if (parts.length === 3) {
      if (parts[2].length === 2) {
        const year = parseInt(parts[2]);
        parts[2] = (year < 50 ? '20' : '19') + parts[2];
      }
      
      return `${parts[1]}/${parts[0]}/${parts[2]} ${time}`;
    }
    
    return `${date} ${time}`;
  }
  
  const formatDisplayDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('.');
    const date = new Date(`${year}-${month}-${day}`);
    
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return 'Bugün';
    }
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Dün';
    }
    
    return format(date, 'd MMMM yyyy', { locale: tr });
  };
  
  const getShortName = (name: string) => {
    return name.split(' ')[0];
  };
  
  const isSameSender = (currentIndex: number, date: string) => {
    const messages = messagesByDate[date];
    if (currentIndex === 0) return false;
    return messages[currentIndex].sender === messages[currentIndex - 1].sender;
  };
  
  const getMessageStyle = (sender: string, isMedia: boolean, content: string) => {
    let bgColor = participants.indexOf(sender) === 0 ? 'bg-green-100' : 'bg-blue-100';
    let textColor = 'text-gray-800';
    
    if (isMedia) {
      bgColor = 'bg-gray-200';
    }
    
    if (!isMedia && content) {
      const sentimentResult = analyzeSentiment(content);
      const manipulationResult = detectManipulation(content);
      
      if (manipulationResult.score > 0.3) {
        bgColor = 'bg-purple-100';
      } else {
        if (sentimentResult.score > 0.3) {
          bgColor = 'bg-green-100';
        } else if (sentimentResult.score < -0.3) {
          bgColor = 'bg-red-100';
        }
      }
    }
    
    return { bgColor, textColor };
  };
  
  const processMessageContent = (content: string) => {
    if (content.includes('<Media omitted>') || content.includes('<Media excluded>')) {
      return (
        <div className="flex items-center text-gray-600">
          <Paperclip className="h-4 w-4 mr-1" />
          <span>Medya</span>
        </div>
      );
    }
    
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlRegex);
    
    return (
      <span>
        {parts.map((part, i) => {
          if (part.match(urlRegex)) {
            return (
              <a 
                key={i} 
                href={part} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 underline break-all"
              >
                {part}
              </a>
            );
          }
          return part;
        })}
      </span>
    );
  };

  return (
    <motion.div 
      className="flex flex-col h-[calc(100vh-120px)] md:h-[600px] max-w-lg mx-auto border border-gray-300 rounded-md overflow-hidden bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-emerald-600 text-white p-2 flex items-center">
        <button 
          onClick={onBack}
          className="p-1 rounded-full hover:bg-emerald-500 transition-colors mr-1"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        
        <div className="flex-1 flex items-center">
          {participants.length > 0 && (
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3 text-emerald-700 font-bold">
              {participants[0].charAt(0)}
            </div>
          )}
          
          <div>
            <h2 className="font-semibold truncate max-w-[150px] sm:max-w-[200px]">
              {participants.length === 2 
                ? participants.filter(p => p !== participants[0])[0] 
                : 'Grup Sohbeti'}
            </h2>
            <p className="text-xs text-white/80">
              {participants.length} katılımcı
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2 md:space-x-3">
          {!isMobile && (
            <>
              <button className="p-1 rounded-full hover:bg-emerald-500 transition-colors">
                <Video className="h-5 w-5" />
              </button>
              <button className="p-1 rounded-full hover:bg-emerald-500 transition-colors">
                <Phone className="h-5 w-5" />
              </button>
            </>
          )}
          <button className="p-1 rounded-full hover:bg-emerald-500 transition-colors">
            <Search className="h-5 w-5" />
          </button>
          <button className="p-1 rounded-full hover:bg-emerald-500 transition-colors">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div 
        className="flex-1 overflow-y-auto p-3 space-y-2"
        style={{ backgroundImage: "url('data:image/png;base64,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')" }}
      >
        {Object.entries(messagesByDate).map(([date, msgs]) => (
          <div key={date} className="mb-4">
            <div className="flex justify-center mb-3">
              <div className="bg-white px-3 py-1 rounded-full text-xs text-gray-500 shadow-sm">
                {formatDisplayDate(date)}
              </div>
            </div>
            
            {msgs.map((message, idx) => {
              const { bgColor, textColor } = getMessageStyle(message.sender, message.isMedia, message.content);
              const showSender = !isSameSender(idx, date);
              
              return (
                <div 
                  key={idx} 
                  className={`flex ${message.sender === participants[0] ? 'justify-end' : 'justify-start'} mb-1`}
                >
                  <div className={`max-w-[85%] ${showSender ? 'mt-1' : 'mt-0'}`}>
                    {showSender && message.sender !== participants[0] && (
                      <div className="text-xs font-medium ml-1 text-gray-600">
                        {getShortName(message.sender)}
                      </div>
                    )}
                    
                    <div className={`${bgColor} ${textColor} rounded-lg px-3 py-2 shadow-sm relative break-words`}>
                      {processMessageContent(message.content)}
                      <div className="text-right text-xs text-gray-500 mt-1">
                        {message.time}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="bg-white p-3 border-t border-gray-200 flex items-center">
        <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
          <Smile className="h-6 w-6" />
        </button>
        <input 
          type="text" 
          className="flex-1 rounded-full bg-gray-100 p-2 px-4 mx-2 focus:outline-none"
          placeholder="Mesaj yazın"
          disabled
        />
        <button className="p-2 rounded-full bg-emerald-500 text-white">
          <Mic className="h-6 w-6" />
        </button>
      </div>
    </motion.div>
  );
};

export default WhatsAppView;
