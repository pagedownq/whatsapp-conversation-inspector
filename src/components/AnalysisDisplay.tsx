import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Line, LineChart } from 'recharts';
import { useCountAnimation, useProgressAnimation } from '@/hooks/useAnimation';
import { ChatMessage } from '@/utils/parseChat';
import { analyzeChat, ChatStats, ParticipantStats } from '@/utils/analyzeChat';
import { Clock, MessageSquare, Type, Smile, User, Calendar, Activity, BarChart2, Image, Video, FileText, Link, StickerIcon, Film, Mic, AlignJustify, HeartIcon, BrainIcon, ThumbsDownIcon, Brain, Heart, ChevronsRight, MessageCircle, MessagesSquare } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { getSentimentColor, getManipulationLevel, getManipulationTypeLabel } from '@/utils/sentimentAnalysis';
import WordAnalysisSection from './WordAnalysisSection';
import SentimentAnalysisSection from './SentimentAnalysisSection';
import RelationshipAnalysisSection from './RelationshipAnalysisSection';
import { Button } from '@/components/ui/button';

interface AnalysisDisplayProps {
  chatData: ChatMessage[];
  onReset: () => void;
}

interface StatsCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  suffix?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon, title, value, suffix = '' }) => {
  const animatedValue = useCountAnimation(value);
  
  return (
    <motion.div 
      className="bg-card/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-border/50"
      whileHover={{ y: -3, scale: 1.02, transition: { duration: 0.2 } }}
    >
      <div className="flex items-center mb-3">
        <div className="bg-gradient-to-br from-primary/20 to-primary/10 p-2.5 rounded-xl mr-3">
          {React.cloneElement(icon as React.ReactElement, { className: 'h-6 w-6 text-primary' })}
        </div>
        <h3 className="text-base font-medium text-foreground">{title}</h3>
      </div>
      <p className="text-3xl font-display font-bold tracking-tight text-primary">
        {new Intl.NumberFormat('tr-TR').format(animatedValue)}{suffix}
      </p>
    </motion.div>
  );
};

const MediaStatsCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  value: number;
  color: string;
}> = ({ title, icon, value, color }) => {
  return (
    <motion.div 
      className="bg-card/90 backdrop-blur-sm rounded-2xl p-6 flex flex-col items-center shadow-lg hover:shadow-xl transition-all duration-300 border border-border/50"
      whileHover={{ y: -3, scale: 1.02 }}
    >
      <div className="rounded-xl p-3 mb-3" style={{ backgroundColor: `${color}15` }}>
        {React.cloneElement(icon as React.ReactElement, { className: 'h-7 w-7', style: { color } })}
      </div>
      <div className="text-2xl font-bold mb-1" style={{ color }}>{value}</div>
      <div className="text-sm font-medium text-gray-600">{title}</div>
    </motion.div>
  );
};

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ chatData, onReset }) => {
  const [stats, setStats] = useState<ChatStats | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'participants' | 'timeline' | 'media' | 'conversation' | 'sentiment' | 'relationship'>('overview');
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);
  const [participantColors, setParticipantColors] = useState<Record<string, string>>({});
  const isMobile = useIsMobile();
  
  const chartProgress = useProgressAnimation({ duration: 1000, delay: 300 });
  
  useEffect(() => {
    if (chatData.length > 0) {
      try {
        const analyzedStats = analyzeChat(chatData);
        setStats(analyzedStats);
        
        const participants = Object.keys(analyzedStats.participantStats);
        const colors: Record<string, string> = {};
        
        participants.forEach((participant, index) => {
          colors[participant] = COLORS[index % COLORS.length];
        });
        
        setParticipantColors(colors);
        
        if (participants.length > 0 && !selectedParticipant) {
          setSelectedParticipant(participants[0]);
        }
      } catch (error) {
        console.error('Error analyzing chat:', error);
      }
    }
  }, [chatData, selectedParticipant]);
  
  const COLORS = ['#6366F1', '#22C55E', '#F59E0B', '#EC4899', '#8B5CF6', '#10B981', '#F43F5E', '#3B82F6'];
  
  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  const messageCountData = Object.entries(stats.participantStats).map(([name, data]) => ({
    name,
    value: data.messageCount
  }));
  
  const wordCountData = Object.entries(stats.participantStats).map(([name, data]) => ({
    name,
    value: data.wordCount
  }));
  
  const emojiCountData = Object.entries(stats.participantStats).map(([name, data]) => ({
    name,
    value: data.emojiCount
  }));
  
  const timelineData = Object.entries(stats.messagesByDate).map(([date, count]) => ({
    date,
    count
  })).sort((a, b) => {
    const dateA = new Date(a.date.split('.').reverse().join('-'));
    const dateB = new Date(b.date.split('.').reverse().join('-'));
    return dateA.getTime() - dateB.getTime();
  });
  
  const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
    hour: `${hour}:00`,
    count: stats.messagesByHour[hour] || 0
  }));
  
  const mediaData = [
    { name: 'Fotoğraflar', value: stats.mediaStats.images, icon: <Image className="h-5 w-5" />, color: '#4CAF50' },
    { name: 'Videolar', value: stats.mediaStats.videos, icon: <Video className="h-5 w-5" />, color: '#FFC107' },
    { name: 'Belgeler', value: stats.mediaStats.documents, icon: <FileText className="h-5 w-5" />, color: '#2196F3' },
    { name: 'Linkler', value: stats.mediaStats.links, icon: <Link className="h-5 w-5" />, color: '#9C27B0' },
    { name: 'Çıkartmalar', value: stats.mediaStats.stickers, icon: <StickerIcon className="h-5 w-5" />, color: '#FF5722' },
    { name: 'GIFler', value: stats.mediaStats.gifs, icon: <Film className="h-5 w-5" />, color: '#795548' },
    { name: 'Sesler', value: stats.mediaStats.audio, icon: <Mic className="h-5 w-5" />, color: '#607D8B' }
  ];
  
  const getParticipantMediaData = (participant: string) => [
    { name: 'Fotoğraflar', value: stats.participantStats[participant].mediaStats.images },
    { name: 'Videolar', value: stats.participantStats[participant].mediaStats.videos },
    { name: 'Belgeler', value: stats.participantStats[participant].mediaStats.documents },
    { name: 'Linkler', value: stats.participantStats[participant].mediaStats.links },
    { name: 'Çıkartmalar', value: stats.participantStats[participant].mediaStats.stickers },
    { name: 'GIFler', value: stats.participantStats[participant].mediaStats.gifs },
    { name: 'Sesler', value: stats.participantStats[participant].mediaStats.audio }
  ];

  const sentimentData = Object.entries(stats.participantStats).map(([name, data]) => ({
    name,
    score: data.sentiment.averageScore,
    positive: data.sentiment.positiveMsgCount,
    negative: data.sentiment.negativeMsgCount,
    neutral: data.sentiment.neutralMsgCount,
  }));
  
  const manipulationData = Object.entries(stats.participantStats).map(([name, data]) => ({
    name,
    score: data.manipulation.averageScore,
    messages: data.manipulation.messageCount
  }));
  
  const manipulationTypesData = Object.entries(stats.manipulation.messagesByType).map(([type, count]) => ({
    name: getManipulationTypeLabel(type),
    value: count
  }));

  const apologyData = Object.entries(stats.participantStats).map(([name, data]) => ({
    name,
    count: data.apologies.count
  })).sort((a, b) => b.count - a.count);
  
  const loveExpressionData = Object.entries(stats.participantStats).map(([name, data]) => ({
    name,
    count: data.loveExpressions.count,
    iLoveYouCount: data.loveExpressions.iLoveYouCount
  })).sort((a, b) => b.count - a.count);

  return (
    <motion.div 
      className="w-full max-w-6xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {isMobile && (
        <div className="flex items-center justify-center gap-2 mb-4 p-2 bg-secondary/50 rounded-lg text-sm">
          <ChevronsRight className="h-4 w-4 animate-pulse" />
          <span>Analiz sekmelerini görmek için sağa kaydırın</span>
        </div>
      )}
      
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: 'overview', icon: <BarChart2 className="h-4 w-4" />, label: 'Genel' },
          { id: 'participants', icon: <User className="h-4 w-4" />, label: 'Kişiler' },
          { id: 'timeline', icon: <Activity className="h-4 w-4" />, label: 'Zaman' },
          { id: 'media', icon: <Image className="h-4 w-4" />, label: 'Medya' },
          { id: 'conversation', icon: <MessagesSquare className="h-4 w-4" />, label: 'Konuşma' },
          { id: 'sentiment', icon: <Brain className="h-4 w-4" />, label: 'Duygu' },
          { id: 'relationship', icon: <Heart className="h-4 w-4" />, label: 'İlişki' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all text-sm ${
              selectedTab === tab.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-secondary/50 hover:bg-secondary/70'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {selectedTab === 'overview' && (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                <StatsCard 
                  icon={<MessageSquare className="h-5 w-5" />}
                  title="Toplam Mesaj"
                  value={stats.totalMessages}
                />
                <StatsCard 
                  icon={<Type className="h-5 w-5" />}
                  title="Toplam Kelime"
                  value={stats.totalWords}
                />
                <StatsCard 
                  icon={<Smile className="h-5 w-5" />}
                  title="Toplam Emoji"
                  value={stats.totalEmojis}
                />
                <StatsCard 
                  icon={<Calendar className="h-5 w-5" />}
                  title="Sohbet Süresi"
                  value={stats.duration}
                  suffix=" gün"
                />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-card rounded-2xl p-6 shadow-soft">
                  <h3 className="text-lg font-medium mb-4">Mesaj Dağılımı</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={messageCountData}
                          cx="50%"
                          cy="50%"
                          innerRadius={isMobile ? 40 : 60}
                          outerRadius={isMobile ? 80 : 100}
                          paddingAngle={2}
                          dataKey="value"
                          animationBegin={0}
                          animationDuration={1000}
                          animationEasing="ease-out"
                          startAngle={90}
                          endAngle={chartProgress * 360 + 90}
                        >
                          {messageCountData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={participantColors[entry.name]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: any) => [`${value} mesaj`, '']} 
                          labelFormatter={(label: any) => `${label}`}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-3 justify-center mt-2">
                    {Object.entries(participantColors).map(([name, color]) => (
                      <div key={name} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                        <span>{name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-card rounded-2xl p-6 shadow-soft">
                  <h3 className="text-lg font-medium mb-4">Kelime Dağılımı</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={wordCountData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                      >
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" width={80} />
                        <Tooltip formatter={(value: any) => [`${value} kelime`, '']} />
                        <Bar 
                          dataKey="value" 
                          animationBegin={0}
                          animationDuration={1500}
                          animationEasing="ease-out"
                        >
                          {wordCountData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={participantColors[entry.name]} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              
              <div className="bg-card rounded-2xl p-6 shadow-soft mb-8">
                <h3 className="text-lg font-medium mb-4">Emoji Kullanımı</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={emojiCountData}
                      margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
                    >
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => [`${value} emoji`, '']} />
                      <Bar 
                        dataKey="value" 
                        animationBegin={0}
                        animationDuration={1500}
                        animationEasing="ease-out"
                      >
                        {emojiCountData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={participantColors[entry.name]} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
          
          {selectedTab === 'participants' && (
            <div>
              <div className="mb-6 flex flex-wrap gap-2">
                {Object.keys(stats.participantStats).map(participant => (
                  <button
                    key={participant}
                    onClick={() => setSelectedParticipant(participant)}
                    className={`px-4 py-2 rounded-full btn-transition ${
                      selectedParticipant === participant
                        ? 'bg-primary text-primary-foreground shadow-soft'
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                    style={selectedParticipant === participant ? {} : {
                      borderLeft: `3px solid ${participantColors[participant]}`
                    }}
                  >
                    {participant}
                  </button>
                ))}
              </div>
              
              {selectedParticipant && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard 
                      icon={<MessageSquare className="h-5 w-5" />}
                      title="Mesaj Sayısı"
                      value={stats.participantStats[selectedParticipant].messageCount}
                    />
                    <StatsCard 
                      icon={<Type className="h-5 w-5" />}
                      title="Kelime Sayısı"
                      value={stats.participantStats[selectedParticipant].wordCount}
                    />
                    <StatsCard 
                      icon={<Smile className="h-5 w-5" />}
                      title="Emoji Sayısı"
                      value={stats.participantStats[selectedParticipant].emojiCount}
                    />
                    <StatsCard 
                      icon={<Activity className="h-5 w-5" />}
                      title="Ort. Mesaj Uzunluğu"
                      value={Math.round(stats.participantStats[selectedParticipant].averageMessageLength)}
                      suffix=" karakter"
                    />
                  </div>
                  
                  <div className="bg-card rounded-2xl p-6 shadow-soft">
                    <h3 className="text-lg font-medium mb-4">En Çok Kullanılan Emojiler</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {stats.participantStats[selectedParticipant].topEmojis.length > 0 ? (
                        stats.participantStats[selectedParticipant].topEmojis.map((emoji, index) => (
                          <div 
                            key={index} 
                            className="bg-secondary/50 rounded-xl p-4 flex flex-col items-center"
                          >
                            <div className="text-4xl mb-2">{emoji.emoji}</div>
                            <div className="text-sm text-muted-foreground">{emoji.count} kez</div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full text-center text-muted-foreground py-4">
                          Bu katılımcı hiç emoji kullanmamış.
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-card rounded-2xl p-6 shadow-soft">
                    <h3 className="text-lg font-medium mb-4">En Uzun Mesaj</h3>
                    <div className="bg-secondary/30 rounded-xl p-4 break-words">
                      <div className="flex items-center mb-2">
                        <AlignJustify className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {stats.participantStats[selectedParticipant].longestMessage.length} karakter
                        </span>
                      </div>
                      <p className="text-sm">
                        {stats.participantStats[selectedParticipant].longestMessage.content || 'Mesaj bulunamadı'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-card rounded-2xl p-6 shadow-soft">
                    <h3 className="text-lg font-medium mb-4">Medya Paylaşımları</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {getParticipantMediaData(selectedParticipant).map((item, index) => (
                        <div 
                          key={index}
                          className="bg-secondary/50 rounded-xl p-4 text-center"
                        >
                          <div className="text-xl font-medium">{item.value}</div>
                          <div className="text-xs text-muted-foreground">{item.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-card rounded-2xl p-6 shadow-soft">
                    <h3 className="text-lg font-medium mb-4">Yanıt Süresi</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-secondary/50 rounded-xl p-4">
                        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Ortalama</div>
                        <div className="text-2xl font-medium">
                          {stats.participantStats[selectedParticipant].responseTime.average !== null
                            ? `${Math.round(stats.participantStats[selectedParticipant].responseTime.average)} dk` 
                            : 'Veri yok'}
                        </div>
                      </div>
                      
                      <div className="bg-secondary/50 rounded-xl p-4">
                        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">En Hızlı</div>
                        <div className="text-2xl font-medium">
                          {stats.participantStats[selectedParticipant].responseTime.fastest !== null
                            ? `${Math.round(stats.participantStats[selectedParticipant].responseTime.fastest)} dk` 
                            : 'Veri yok'}
                        </div>
                      </div>
                      
                      <div className="bg-secondary/50 rounded-xl p-4">
                        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">En Yavaş</div>
                        <div className="text-2xl font-medium">
                          {stats.participantStats[selectedParticipant].responseTime.slowest !== null
                            ? `${Math.round(stats.participantStats[selectedParticipant].responseTime.slowest)} dk` 
                            : 'Veri yok'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {selectedTab === 'timeline' && (
            <div className="space-y-6">
              <div className="bg-card rounded-2xl p-6 shadow-soft">
                <h3 className="text-lg font-medium mb-4">Mesaj Etkinliği</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={timelineData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }} 
                        interval={isMobile ? 3 : 1}
                      />
                      <YAxis />
                      <Tooltip formatter={(value: any) => [`${value} mesaj`, '']} />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#0088FE" 
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                        animationBegin={0}
                        animationDuration={1500}
                        animationEasing="ease-out"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-card rounded-2xl p-6 shadow-soft">
                <h3 className="text-lg font-medium mb-4">Günün Saatlerine Göre Etkinlik</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={hourlyData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis 
                        dataKey="hour" 
                        tick={{ fontSize: 12 }} 
                        interval={isMobile ? 2 : 1}
                      />
                      <YAxis />
                      <Tooltip formatter={(value: any) => [`${value} mesaj`, '']} />
                      <Bar 
                        dataKey="count" 
                        fill="#00C49F"
                        animationBegin={0}
                        animationDuration={1500}
                        animationEasing="ease-out"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-card rounded-2xl p-6 shadow-soft">
                  <h3 className="text-lg font-medium mb-4">En Aktif Zaman</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 mr-4">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">En Aktif Gün</div>
                        <div className="font-medium">{stats.mostActiveDate}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 mr-4">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">En Aktif Saat</div>
                        <div className="font-medium">{stats.mostActiveHour}:00</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card rounded-2xl p-6 shadow-soft">
                  <h3 className="text-lg font-medium mb-4">Sohbet Süresi</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 mr-4">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Başlangıç Tarihi</div>
                        <div className="font-medium">{stats.startDate}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 mr-4">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Bitiş Tarihi</div>
                        <div className="font-medium">{stats.endDate}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center mt-4">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 mr-4">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Toplam Süre</div>
                        <div className="font-medium">{stats.duration} gün</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {selectedTab === 'media' && (
            <div className="space-y-6">
              <div className="bg-card rounded-2xl p-6 shadow-soft">
                <h3 className="text-lg font-medium mb-4">Medya Genel Bakış</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-6">
                  <MediaStatsCard 
                    title="Fotoğraflar" 
                    icon={<Image className="h-5 w-5" />} 
                    value={stats.mediaStats.images} 
                    color="#4CAF50"
                  />
                  <MediaStatsCard 
                    title="Videolar" 
                    icon={<Video className="h-5 w-5" />} 
                    value={stats.mediaStats.videos} 
                    color="#FFC107"
                  />
                  <MediaStatsCard 
                    title="Belgeler" 
                    icon={<FileText className="h-5 w-5" />} 
                    value={stats.mediaStats.documents}
                    color="#2196F3" 
                  />
                  <MediaStatsCard 
                    title="Linkler" 
                    icon={<Link className="h-5 w-5" />} 
                    value={stats.mediaStats.links} 
                    color="#9C27B0"
                  />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                  <MediaStatsCard 
                    title="Çıkartmalar" 
                    icon={<StickerIcon className="h-5 w-5" />} 
                    value={stats.mediaStats.stickers} 
                    color="#FF5722"
                  />
                  <MediaStatsCard 
                    title="GIFler" 
                    icon={<Film className="h-5 w-5" />} 
                    value={stats.mediaStats.gifs} 
                    color="#795548"
                  />
                  <MediaStatsCard 
                    title="Sesler" 
                    icon={<Mic className="h-5 w-5" />} 
                    value={stats.mediaStats.audio} 
                    color="#607D8B"
                  />
                </div>
              </div>
              
              <div className="bg-card rounded-2xl p-6 shadow-soft">
                <h3 className="text-lg font-medium mb-4">Medya Karşılaştırma</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={mediaData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => [`${value} adet`, '']} />
                      <Bar 
                        dataKey="value" 
                        animationBegin={0}
                        animationDuration={1500}
                        animationEasing="ease-out"
                      >
                        {mediaData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-card rounded-2xl p-6 shadow-soft">
                <h3 className="text-lg font-medium mb-4">Katılımcı Bazında Medya Dağılımı</h3>
                
                <div className="grid gap-6">
                  {Object.entries(stats.participantStats).map(([name, participantStats]) => (
                    <div key={name} className="border border-border/30 rounded-xl p-4">
                      <div className="flex items-center mb-4">
                        <div 
                          className="w-4 h-4 rounded-full mr-2" 
                          style={{ backgroundColor: participantColors[name] }}
                        ></div>
                        <h4 className="font-medium">{name}</h4>
                        <div className="ml-auto text-sm text-muted-foreground">
                          Toplam: {participantStats.mediaCount} medya
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="flex justify-between bg-secondary/30 p-2 rounded-lg">
                          <span>Fotoğraflar:</span>
                          <span className="font-medium">{participantStats.mediaStats.images}</span>
                        </div>
                        <div className="flex justify-between bg-secondary/30 p-2 rounded-lg">
                          <span>Videolar:</span>
                          <span className="font-medium">{participantStats.mediaStats.videos}</span>
                        </div>
                        <div className="flex justify-between bg-secondary/30 p-2 rounded-lg">
                          <span>Belgeler:</span>
                          <span className="font-medium">{participantStats.mediaStats.documents}</span>
                        </div>
                        <div className="flex justify-between bg-secondary/30 p-2 rounded-lg">
                          <span>Linkler:</span>
                          <span className="font-medium">{participantStats.mediaStats.links}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {selectedTab === 'conversation' && (
            <WordAnalysisSection
              mostFrequentWords={stats.wordAnalysis.mostFrequentWords}
              mostFrequentWordsByParticipant={stats.wordAnalysis.mostFrequentWordsByParticipant}
              participantColors={participantColors}
              mostInitiator={stats.conversationAnalysis.mostInitiator}
              mostReplier={stats.conversationAnalysis.mostReplier}
              fastestResponder={stats.conversationAnalysis.fastestResponder}
              mostDisagreements={stats.conversationAnalysis.mostDisagreements}
              mostAgreements={stats.conversationAnalysis.mostAgreements}
              participantStats={stats.participantStats}
            />
          )}
          
          {selectedTab === 'sentiment' && (
            <SentimentAnalysisSection
              sentiment={{
                positivePercentage: stats.sentiment.positivePercentage,
                negativePercentage: stats.sentiment.negativePercentage,
                neutralPercentage: stats.sentiment.neutralPercentage,
                averageScore: stats.sentiment.overallScore
              }}
              manipulation={{
                mostManipulative: stats.manipulation.mostManipulative,
                totalManipulativeMessages: Object.values(stats.participantStats).reduce(
                  (total, participant) => total + participant.manipulation.messageCount, 
                  0
                ),
                manipulationScores: Object.entries(stats.participantStats).reduce((acc, [name, data]) => {
                  acc[name] = data.manipulation.messageCount;
                  return acc;
                }, {} as Record<string, number>),
                messagesByType: stats.manipulation.messagesByType
              }}
              participantStats={stats.participantStats}
              participantColors={participantColors}
            />
          )}
          
          {selectedTab === 'relationship' && (
            <RelationshipAnalysisSection
              loveExpressions={stats.loveExpressions}
              apologies={stats.apologies}
              participantStats={stats.participantStats}
              participantColors={participantColors}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default AnalysisDisplay;
