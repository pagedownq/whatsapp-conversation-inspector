
import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MessageCircle, Clock, MessageSquare, ThumbsUp, ThumbsDown, Type, CornerUpRight, AlignLeft } from 'lucide-react';
import { WordFrequency } from '@/utils/analyzeChat';
import { useIsMobile } from '@/hooks/use-mobile';

interface WordAnalysisSectionProps {
  mostFrequentWords: WordFrequency[];
  mostFrequentWordsByParticipant: Record<string, WordFrequency[]>;
  participantColors: Record<string, string>;
  mostInitiator: string;
  mostReplier: string;
  fastestResponder: string;
  mostDisagreements: string;
  mostAgreements: string;
  participantStats: Record<string, any>;
}

const WordBadge: React.FC<{ word: string; count: number; color?: string }> = ({ word, count, color = '#0088FE' }) => {
  return (
    <div className="bg-secondary/50 rounded-lg p-2 flex items-center justify-between">
      <span className="font-medium" style={{ color }}>{word}</span>
      <span className="text-xs text-muted-foreground ml-2">{count}x</span>
    </div>
  );
};

const ConversationBehaviorCard: React.FC<{
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  stat?: number;
  suffix?: string;
}> = ({ title, value, description, icon, stat, suffix = '' }) => {
  return (
    <div className="bg-card rounded-xl p-4 shadow-soft">
      <div className="flex items-center mb-2">
        <div className="bg-primary/10 p-1.5 rounded-full mr-2">
          {icon}
        </div>
        <h3 className="text-sm font-medium">{title}</h3>
      </div>
      <div className="text-xl font-semibold mb-1">{value}</div>
      {stat !== undefined && (
        <div className="text-sm text-muted-foreground mb-2">
          {stat}{suffix}
        </div>
      )}
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
};

const ParticipantWordUsage: React.FC<{
  participant: string;
  words: WordFrequency[];
  color: string;
}> = ({ participant, words, color }) => {
  return (
    <div className="border border-border/30 rounded-xl p-4">
      <div className="flex items-center mb-3">
        <div
          className="w-4 h-4 rounded-full mr-2"
          style={{ backgroundColor: color }}
        ></div>
        <h4 className="font-medium">{participant}</h4>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
        {words.slice(0, 8).map((item, index) => (
          <WordBadge key={index} word={item.word} count={item.count} color={color} />
        ))}
      </div>
    </div>
  );
};

const WordAnalysisSection: React.FC<WordAnalysisSectionProps> = ({
  mostFrequentWords,
  mostFrequentWordsByParticipant,
  participantColors,
  mostInitiator,
  mostReplier,
  fastestResponder,
  mostDisagreements,
  mostAgreements,
  participantStats
}) => {
  const isMobile = useIsMobile();
  const chartData = mostFrequentWords.slice(0, 15);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ConversationBehaviorCard
          title="En Çok Sohbet Başlatan"
          value={mostInitiator}
          description="Bu kişi en çok konuşma başlatan kişidir"
          icon={<MessageCircle className="h-5 w-5 text-primary" />}
          stat={participantStats[mostInitiator]?.conversationPatterns?.conversationStarts}
          suffix=" kez"
        />
        <ConversationBehaviorCard
          title="En Çok Yanıtlayan"
          value={mostReplier}
          description="Bu kişi en çok yanıt veren kişidir"
          icon={<CornerUpRight className="h-5 w-5 text-primary" />}
          stat={participantStats[mostReplier]?.conversationPatterns?.replies}
          suffix=" yanıt"
        />
        <ConversationBehaviorCard
          title="En Hızlı Yanıt Veren"
          value={fastestResponder}
          description="Bu kişi en hızlı yanıt veren kişidir"
          icon={<Clock className="h-5 w-5 text-primary" />}
          stat={Math.round(participantStats[fastestResponder]?.responseTime?.average || 0)}
          suffix=" dk"
        />
        <ConversationBehaviorCard
          title="En Çok İtiraz Eden"
          value={mostDisagreements}
          description="Bu kişi en çok itiraz eden kişidir"
          icon={<ThumbsDown className="h-5 w-5 text-primary" />}
          stat={participantStats[mostDisagreements]?.conversationPatterns?.disagreementCount}
          suffix=" itiraz"
        />
        <ConversationBehaviorCard
          title="En Çok Onaylayan"
          value={mostAgreements}
          description="Bu kişi en çok onaylayan kişidir"
          icon={<ThumbsUp className="h-5 w-5 text-primary" />}
          stat={participantStats[mostAgreements]?.conversationPatterns?.agreementCount}
          suffix=" onay"
        />
        <ConversationBehaviorCard
          title="En Uzun Mesajlar"
          value={
            Object.entries(participantStats)
              .sort((a, b) => {
                const valA = a[1]?.averageMessageLength || 0;
                const valB = b[1]?.averageMessageLength || 0;
                return valB - valA;
              })[0]?.[0] || ""
          }
          description="Bu kişi en uzun mesajları yazıyor"
          icon={<AlignLeft className="h-5 w-5 text-primary" />}
          stat={
            Math.round(
              Object.values(participantStats)
                .map((stat: any) => stat?.averageMessageLength || 0)
                .sort((a, b) => b - a)[0] || 0
            )
          }
          suffix=" karakter"
        />
      </div>

      <div className="bg-card rounded-2xl p-6 shadow-soft">
        <h3 className="text-lg font-medium mb-4">En Sık Kullanılan Kelimeler</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
              layout={isMobile ? "vertical" : "horizontal"}
            >
              {isMobile ? (
                <>
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="word" 
                    type="category" 
                    tick={{ fontSize: 12 }}
                    width={80}
                  />
                </>
              ) : (
                <>
                  <XAxis 
                    dataKey="word" 
                    tick={{ 
                      fontSize: 12, 
                      textAnchor: 'start',
                      dy: 12,
                      transform: "rotate(45)" 
                    }}
                    height={70}
                  />
                  <YAxis />
                </>
              )}
              <Tooltip formatter={(value: any) => [`${value} kez`, '']} />
              <Bar 
                dataKey="count" 
                fill="#0088FE"
                animationBegin={0}
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-6 shadow-soft">
        <h3 className="text-lg font-medium mb-4">Kişilerin En Sık Kullandığı Kelimeler</h3>
        <div className="grid gap-4">
          {Object.entries(mostFrequentWordsByParticipant).map(([participant, words]) => (
            <ParticipantWordUsage 
              key={participant} 
              participant={participant} 
              words={words} 
              color={participantColors[participant]} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WordAnalysisSection;
