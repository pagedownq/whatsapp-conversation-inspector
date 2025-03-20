import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Line, LineChart } from 'recharts';
import { useCountAnimation, useProgressAnimation } from '@/hooks/useAnimation';
import { ChatMessage } from '@/utils/parseChat';
import { analyzeChat, ChatStats, ParticipantStats } from '@/utils/analyzeChat';
import { Clock, MessageSquare, Type, Smile, User, Calendar, Activity, BarChart2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

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
      className="bg-card rounded-2xl p-5 shadow-soft"
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
    >
      <div className="flex items-center mb-1">
        <div className="bg-primary/10 p-1.5 rounded-full mr-2">
          {icon}
        </div>
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      </div>
      <p className="text-2xl font-display font-semibold tracking-tight">
        {new Intl.NumberFormat('tr-TR').format(animatedValue)}{suffix}
      </p>
    </motion.div>
  );
};

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ chatData, onReset }) => {
  const [stats, setStats] = useState<ChatStats | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'participants' | 'timeline'>('overview');
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);
  const [participantColors, setParticipantColors] = useState<Record<string, string>>({});
  const isMobile = useIsMobile();
  
  // Animation progress
  const chartProgress = useProgressAnimation({ duration: 1000, delay: 300 });
  
  useEffect(() => {
    if (chatData.length > 0) {
      try {
        const analyzedStats = analyzeChat(chatData);
        setStats(analyzedStats);
        
        // Assign colors to participants
        const participants = Object.keys(analyzedStats.participantStats);
        const colors: Record<string, string> = {};
        
        participants.forEach((participant, index) => {
          colors[participant] = COLORS[index % COLORS.length];
        });
        
        setParticipantColors(colors);
        
        // Select first participant by default
        if (participants.length > 0 && !selectedParticipant) {
          setSelectedParticipant(participants[0]);
        }
      } catch (error) {
        console.error('Error analyzing chat:', error);
      }
    }
  }, [chatData, selectedParticipant]);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A259FF'];
  
  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // Prepare data for charts
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
  
  // Prepare timeline data
  const timelineData = Object.entries(stats.messagesByDate).map(([date, count]) => ({
    date,
    count
  })).sort((a, b) => {
    const dateA = new Date(a.date.split('.').reverse().join('-'));
    const dateB = new Date(b.date.split('.').reverse().join('-'));
    return dateA.getTime() - dateB.getTime();
  });
  
  // Format time of day data
  const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
    hour: `${hour}:00`,
    count: stats.messagesByHour[hour] || 0
  }));

  return (
    <motion.div 
      className="w-full max-w-6xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Tab navigation */}
      <div className="flex overflow-x-auto mb-8 p-1 -mx-1 gap-2">
        <button
          onClick={() => setSelectedTab('overview')}
          className={`px-4 py-2 rounded-full whitespace-nowrap ${
            selectedTab === 'overview' 
              ? 'bg-primary text-primary-foreground shadow-soft' 
              : 'bg-secondary hover:bg-secondary/80'
          } btn-transition`}
        >
          Genel Bakış
        </button>
        <button
          onClick={() => setSelectedTab('participants')}
          className={`px-4 py-2 rounded-full whitespace-nowrap ${
            selectedTab === 'participants' 
              ? 'bg-primary text-primary-foreground shadow-soft' 
              : 'bg-secondary hover:bg-secondary/80'
          } btn-transition`}
        >
          Katılımcı Analizi
        </button>
        <button
          onClick={() => setSelectedTab('timeline')}
          className={`px-4 py-2 rounded-full whitespace-nowrap ${
            selectedTab === 'timeline' 
              ? 'bg-primary text-primary-foreground shadow-soft' 
              : 'bg-secondary hover:bg-secondary/80'
          } btn-transition`}
        >
          Zaman Çizelgesi
        </button>
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
              {/* Stats cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
              
              {/* Message distribution */}
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
              
              {/* Emoji usage */}
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
              {/* Participant selector */}
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
                  {/* Participant stats grid */}
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
                  
                  {/* Top emojis */}
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
                  
                  {/* Response time */}
                  <div className="bg-card rounded-2xl p-6 shadow-soft">
                    <h3 className="text-lg font-medium mb-4">Yanıt Süresi</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-secondary/50 rounded-xl p-4">
                        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Ortalama</div>
                        <div className="text-2xl font-medium">
                          {stats.participantStats[selectedParticipant].responseTime.average 
                            ? `${Math.round(stats.participantStats[selectedParticipant].responseTime.average)} dk` 
                            : 'Veri yok'}
                        </div>
                      </div>
                      
                      <div className="bg-secondary/50 rounded-xl p-4">
                        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">En Hızlı</div>
                        <div className="text-2xl font-medium">
                          {stats.participantStats[selectedParticipant].responseTime.fastest 
                            ? `${Math.round(stats.participantStats[selectedParticipant].responseTime.fastest)} dk` 
                            : 'Veri yok'}
                        </div>
                      </div>
                      
                      <div className="bg-secondary/50 rounded-xl p-4">
                        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">En Yavaş</div>
                        <div className="text-2xl font-medium">
                          {stats.participantStats[selectedParticipant].responseTime.slowest 
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
              {/* Message activity over time */}
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
              
              {/* Messages by hour */}
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
              
              {/* Activity insights */}
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
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      
      {/* Reset button */}
      <div className="mt-10 text-center">
        <button
          onClick={onReset}
          className="bg-secondary hover:bg-secondary/80 rounded-full px-5 py-2.5 text-foreground btn-transition inline-flex items-center gap-2"
        >
          <span>Yeni Analiz</span>
        </button>
      </div>
    </motion.div>
  );
};

export default AnalysisDisplay;
