
import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { MessageCircle, Clock, MessageSquare, ThumbsUp, ThumbsDown, Type, CornerUpRight, AlignLeft, BarChart2, TrendingUp, Users, Repeat, UserPlus } from 'lucide-react';
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

const DetailStatCard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ReactNode;
  colorClass?: string;
}> = ({ title, value, icon, colorClass = "bg-primary/10 text-primary" }) => {
  return (
    <div className="bg-secondary/40 p-4 rounded-xl">
      <div className="flex justify-between mb-2">
        <span className="text-sm text-muted-foreground">{title}</span>
        <div className={`p-1.5 rounded-full ${colorClass}`}>
          {icon}
        </div>
      </div>
      <div className="text-xl font-medium">{value}</div>
    </div>
  );
};

const ConversationPatternSection: React.FC<{
  participantStats: Record<string, any>;
  participantColors: Record<string, string>;
}> = ({ participantStats, participantColors }) => {
  // Calculate conversation patterns
  const conversationInitiationsData = Object.entries(participantStats)
    .map(([name, data]) => ({
      name,
      value: data?.conversationPatterns?.conversationStarts || 0,
      color: participantColors[name]
    }))
    .sort((a, b) => b.value - a.value);

  const repliesData = Object.entries(participantStats)
    .map(([name, data]) => ({
      name,
      value: data?.conversationPatterns?.replies || 0,
      color: participantColors[name]
    }))
    .sort((a, b) => b.value - a.value);

  const responseTimesData = Object.entries(participantStats)
    .map(([name, data]) => ({
      name,
      value: Math.round(data?.responseTime?.average || 0),
      color: participantColors[name]
    }))
    .filter(item => item.value > 0)
    .sort((a, b) => a.value - b.value);

  return (
    <div className="bg-card rounded-2xl p-6 shadow-soft mb-6">
      <h3 className="text-lg font-medium mb-4 flex items-center">
        <TrendingUp className="h-5 w-5 mr-2 text-primary" />
        Konuşma Akış Analizi
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="text-md font-medium mb-3">Konuşma Başlatma Dağılımı</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                layout="vertical"
                data={conversationInitiationsData}
                margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
              >
                <XAxis type="number" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={80}
                />
                <Tooltip formatter={(value: any) => [`${value} başlatma`, '']} />
                <Bar 
                  dataKey="value" 
                  background={{ fill: '#f5f5f5' }}
                  animationBegin={0}
                  animationDuration={1500}
                >
                  {conversationInitiationsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div>
          <h4 className="text-md font-medium mb-3">Yanıt Dağılımı</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                layout="vertical"
                data={repliesData}
                margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
              >
                <XAxis type="number" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={80}
                />
                <Tooltip formatter={(value: any) => [`${value} yanıt`, '']} />
                <Bar 
                  dataKey="value" 
                  background={{ fill: '#f5f5f5' }}
                  animationBegin={0}
                  animationDuration={1500}
                >
                  {repliesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <h4 className="text-md font-medium mb-3">Ortalama Yanıt Süreleri (dakika)</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={responseTimesData}
              margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: any) => [`${value} dakika`, '']} />
              <Bar 
                dataKey="value" 
                background={{ fill: '#f5f5f5' }}
                animationBegin={0}
                animationDuration={1500}
              >
                {responseTimesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const AgreementDisagreementSection: React.FC<{
  participantStats: Record<string, any>;
  participantColors: Record<string, string>;
}> = ({ participantStats, participantColors }) => {
  // Prepare data for charts
  const agreementData = Object.entries(participantStats)
    .map(([name, data]) => ({
      name,
      value: data?.conversationPatterns?.agreementCount || 0,
      color: participantColors[name]
    }))
    .sort((a, b) => b.value - a.value);

  const disagreementData = Object.entries(participantStats)
    .map(([name, data]) => ({
      name,
      value: data?.conversationPatterns?.disagreementCount || 0,
      color: participantColors[name]
    }))
    .sort((a, b) => b.value - a.value);
    
  // Calculate agreement/disagreement ratio for each participant
  const agreementRatioData = Object.entries(participantStats)
    .map(([name, data]) => {
      const agreements = data?.conversationPatterns?.agreementCount || 0;
      const disagreements = data?.conversationPatterns?.disagreementCount || 0;
      const total = agreements + disagreements;
      
      return {
        name,
        agreements,
        disagreements,
        ratio: total > 0 ? Math.round((agreements / total) * 100) : 0,
        color: participantColors[name]
      };
    })
    .filter(item => (item.agreements + item.disagreements) > 0)
    .sort((a, b) => b.ratio - a.ratio);

  return (
    <div className="bg-card rounded-2xl p-6 shadow-soft mb-6">
      <h3 className="text-lg font-medium mb-4 flex items-center">
        <Users className="h-5 w-5 mr-2 text-primary" />
        Anlaşma ve Fikir Ayrılığı Analizi
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="text-md font-medium mb-3">Onaylama Dağılımı</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                layout="vertical"
                data={agreementData}
                margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
              >
                <XAxis type="number" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={80}
                />
                <Tooltip formatter={(value: any) => [`${value} onaylama`, '']} />
                <Bar 
                  dataKey="value" 
                  background={{ fill: '#f5f5f5' }}
                  animationBegin={0}
                  animationDuration={1500}
                >
                  {agreementData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div>
          <h4 className="text-md font-medium mb-3">İtiraz Dağılımı</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                layout="vertical"
                data={disagreementData}
                margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
              >
                <XAxis type="number" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={80}
                />
                <Tooltip formatter={(value: any) => [`${value} itiraz`, '']} />
                <Bar 
                  dataKey="value" 
                  background={{ fill: '#f5f5f5' }}
                  animationBegin={0}
                  animationDuration={1500}
                >
                  {disagreementData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <h4 className="text-md font-medium mb-3">Anlaşma Oranı (%)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
          {agreementRatioData.slice(0, 6).map((item, index) => (
            <div key={index} className="bg-secondary/30 p-3 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{item.name}</span>
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
              </div>
              <div className="bg-background rounded-full h-2.5 mb-2">
                <div 
                  className="h-2.5 rounded-full" 
                  style={{ 
                    width: `${item.ratio}%`,
                    backgroundColor: item.color 
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{item.agreements} onay</span>
                <span>%{item.ratio}</span>
                <span>{item.disagreements} itiraz</span>
              </div>
            </div>
          ))}
        </div>
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
  
  // Calculate statistics for message patterns 
  const totalConversationStarts = Object.values(participantStats).reduce(
    (sum, stat) => sum + (stat?.conversationPatterns?.conversationStarts || 0), 0
  );
  
  const totalReplies = Object.values(participantStats).reduce(
    (sum, stat) => sum + (stat?.conversationPatterns?.replies || 0), 0
  );
  
  const totalMessages = Object.values(participantStats).reduce(
    (sum, stat) => sum + (stat?.messageCount || 0), 0
  );
  
  // Conversation start percentage for the most initiator
  const initiatorPercentage = totalConversationStarts > 0 
    ? Math.round((participantStats[mostInitiator]?.conversationPatterns?.conversationStarts || 0) / totalConversationStarts * 100)
    : 0;
  
  // Reply percentage for the most replier
  const replierPercentage = totalReplies > 0
    ? Math.round((participantStats[mostReplier]?.conversationPatterns?.replies || 0) / totalReplies * 100)
    : 0;
  
  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl p-6 shadow-soft mb-6">
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <MessageCircle className="h-5 w-5 mr-2 text-primary" />
          Konuşma Davranış Analizi
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <DetailStatCard
            title="Toplam Konuşma Başlatma"
            value={totalConversationStarts}
            icon={<UserPlus className="h-4 w-4" />}
            colorClass="bg-blue-100 text-blue-600"
          />
          <DetailStatCard
            title="Toplam Yanıt"
            value={totalReplies}
            icon={<CornerUpRight className="h-4 w-4" />}
            colorClass="bg-green-100 text-green-600"
          />
          <DetailStatCard
            title="Yanıt Oranı"
            value={`%${totalMessages > 0 ? Math.round((totalReplies / totalMessages) * 100) : 0}`}
            icon={<Repeat className="h-4 w-4" />}
            colorClass="bg-purple-100 text-purple-600"
          />
        </div>
      
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ConversationBehaviorCard
            title="En Çok Sohbet Başlatan"
            value={mostInitiator}
            description={`Tüm konuşma başlatmaların %${initiatorPercentage}'ini bu kişi yapmış`}
            icon={<MessageCircle className="h-5 w-5 text-primary" />}
            stat={participantStats[mostInitiator]?.conversationPatterns?.conversationStarts}
            suffix=" kez"
          />
          <ConversationBehaviorCard
            title="En Çok Yanıtlayan"
            value={mostReplier}
            description={`Tüm yanıtların %${replierPercentage}'ini bu kişi vermiş`}
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
            description="Bu kişi tartışmalarda en çok itiraz eden kişidir"
            icon={<ThumbsDown className="h-5 w-5 text-primary" />}
            stat={participantStats[mostDisagreements]?.conversationPatterns?.disagreementCount}
            suffix=" itiraz"
          />
          <ConversationBehaviorCard
            title="En Çok Onaylayan"
            value={mostAgreements}
            description="Bu kişi tartışmalarda en çok onaylayan kişidir"
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
      </div>

      <ConversationPatternSection 
        participantStats={participantStats} 
        participantColors={participantColors} 
      />
      
      <AgreementDisagreementSection 
        participantStats={participantStats} 
        participantColors={participantColors} 
      />

      <div className="bg-card rounded-2xl p-6 shadow-soft">
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <BarChart2 className="h-5 w-5 mr-2 text-primary" />
          En Sık Kullanılan Kelimeler
        </h3>
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
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <Type className="h-5 w-5 mr-2 text-primary" />
          Kişilerin En Sık Kullandığı Kelimeler
        </h3>
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
