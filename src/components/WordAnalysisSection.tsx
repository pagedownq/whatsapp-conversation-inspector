
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { MessageCircle, ArrowRight, User, Clock, Check, X, Brain, MessageSquare, MessagesSquare, Smile, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ParticipantStats } from '@/utils/analyzeChat';

interface WordAnalysisProps {
  mostFrequentWords: Array<{ word: string; count: number }>;
  mostFrequentWordsByParticipant: Record<string, Array<{ word: string; count: number }>>;
  participantColors: Record<string, string>;
  mostInitiator: string;
  mostReplier: string;
  fastestResponder: string;
  mostDisagreements: string;
  mostAgreements: string;
  participantStats: Record<string, ParticipantStats>;
}

const ConversationPatternCard = ({ 
  title, 
  description, 
  person, 
  icon,
  value,
  color
}: { 
  title: string; 
  description: string; 
  person: string; 
  icon: React.ReactNode; 
  value?: string;
  color?: string;
}) => (
  <Card className="shadow-soft h-full bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 backdrop-blur-sm border border-primary/20 hover:shadow-xl hover:border-primary/30 transition-all duration-300">
    <CardHeader className="pb-2">
      <CardTitle className="text-lg font-medium bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">{title}</CardTitle>
      <CardDescription className="text-muted-foreground/90">{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-xl ${color ? `bg-gradient-to-br ${color} shadow-lg shadow-${color}/20` : 'bg-gradient-to-br from-primary/20 to-primary/10 shadow-lg shadow-primary/20'}`}>
          {icon}
        </div>
        <div>
          <div className="text-xl font-bold bg-gradient-to-r from-primary/90 to-primary/70 bg-clip-text text-transparent">{person}</div>
          {value && <div className="text-sm text-muted-foreground/80 mt-0.5">{value}</div>}
        </div>
      </div>
    </CardContent>
  </Card>
);

const WordAnalysisSection: React.FC<WordAnalysisProps> = ({
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
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(
    Object.keys(mostFrequentWordsByParticipant)[0] || null
  );
  const [activeTab, setActiveTab] = useState("words");

  const renderWordCloud = (words: Array<{ word: string; count: number }>) => {
    const maxCount = Math.max(...words.map(item => item.count));
    
    return (
      <div className="flex flex-wrap gap-2 justify-center">
        {words.slice(0, 40).map((item, index) => {
          const size = 14 + Math.floor((item.count / maxCount) * 24);
          const opacity = 0.5 + (item.count / maxCount) * 0.5;
          
          return (
            <motion.span
              key={index}
              className="px-2 py-1 rounded-md bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-colors"
              style={{ 
                fontSize: `${size}px`, 
                opacity, 
                fontWeight: size > 25 ? 'bold' : 'normal' 
              }}
              whileHover={{ scale: 1.1, transition: { duration: 0.2 } }}
            >
              {item.word}
            </motion.span>
          );
        })}
      </div>
    );
  };

  const getAverageResponseTime = (participant: string) => {
    const stats = participantStats[participant];
    if (stats && stats.responseTime && stats.responseTime.average !== null) {
      return `Ortalama yanıt süresi: ${Math.round(stats.responseTime.average)} dakika`;
    }
    return 'Yanıt süresi verisi yok';
  };

  const getConversationStyle = (participant: string) => {
    const stats = participantStats[participant];
    if (!stats) return null;
    
    const messageStyle = [];
    
    if (stats.averageMessageLength > 50) {
      messageStyle.push('Uzun ve detaylı mesajlar yazar');
    } else if (stats.averageMessageLength < 15) {
      messageStyle.push('Kısa ve öz mesajlar yazar');
    } else {
      messageStyle.push('Orta uzunlukta mesajlar yazar');
    }
    
    if (stats.wordCount / stats.messageCount > 8) {
      messageStyle.push('Zengin kelime dağarcığı kullanır');
    }
    
    if (stats.emojiCount / stats.messageCount > 0.5) {
      messageStyle.push('Sıkça emoji kullanır');
    }
    
    return messageStyle;
  };

  const getParticipantBehavior = (participant: string) => {
    const stats = participantStats[participant];
    if (!stats) return [];
    
    const behaviors = [];
    
    // Başlatıcı mı?
    if (participant === mostInitiator) {
      behaviors.push('Konuşmayı genellikle başlatır');
    }
    
    // Yanıtlayıcı mı?
    if (participant === mostReplier) {
      behaviors.push('Mesajları sıkça yanıtlar');
    }
    
    // Hızlı yanıt veren mi?
    if (participant === fastestResponder) {
      behaviors.push('Hızlı yanıt verir');
    }
    
    // Fikir ayrılığı var mı?
    if (participant === mostDisagreements) {
      behaviors.push('Sıkça farklı fikir belirtir');
    }
    
    // Onaylayıcı mı?
    if (participant === mostAgreements) {
      behaviors.push('Genellikle onaylayıcıdır');
    }
    
    // Media paylaşımı
    if (stats.mediaCount > 10) {
      behaviors.push('Sıkça medya paylaşır');
    }
    
    return behaviors;
  };

  const chartsData = Object.entries(mostFrequentWordsByParticipant).map(([name, words]) => ({
    name,
    uniqueWords: words.length,
    totalUsage: words.reduce((sum, item) => sum + item.count, 0)
  }));

  return (
    <div className="space-y-6">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="words">Kelime Analizi</TabsTrigger>
          <TabsTrigger value="patterns">İletişim Desenleri</TabsTrigger>
        </TabsList>

        <TabsContent value="words" className="mt-4 space-y-6">
          <Card className="shadow-soft bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm border border-border/50">
            <CardHeader>
              <CardTitle className="text-primary">Kelime Bulutu</CardTitle>
              <CardDescription>
                Sohbette en sık kullanılan kelimeler
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderWordCloud(mostFrequentWords)}
            </CardContent>
          </Card>
          
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Katılımcı Kelime Analizi</h3>
              <div className="flex flex-wrap gap-2">
                {Object.keys(mostFrequentWordsByParticipant).map((participant) => (
                  <Button
                    key={participant}
                    variant={selectedParticipant === participant ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedParticipant(participant)}
                    style={selectedParticipant !== participant ? {
                      borderLeft: `3px solid ${participantColors[participant]}`
                    } : {}}
                  >
                    {participant}
                  </Button>
                ))}
              </div>
            </div>

            {selectedParticipant && (
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: participantColors[selectedParticipant] }}
                    ></div>
                    {selectedParticipant} - Kelime Analizi
                  </CardTitle>
                  <CardDescription>
                    {selectedParticipant}'in en çok kullandığı kelimeler ve iletişim tarzı
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">İletişim Tarzı</h4>
                    <div className="flex flex-wrap gap-2">
                      {getConversationStyle(selectedParticipant)?.map((style, i) => (
                        <Badge key={i} variant="outline">{style}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Karakteristik Davranışlar</h4>
                    <div className="flex flex-wrap gap-2">
                      {getParticipantBehavior(selectedParticipant).map((behavior, i) => (
                        <Badge key={i} variant="secondary">{behavior}</Badge>
                      ))}
                      {getParticipantBehavior(selectedParticipant).length === 0 && (
                        <span className="text-muted-foreground text-sm">Belirgin bir davranış bulunamadı</span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">En Sık Kullanılan Kelimeler</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {mostFrequentWordsByParticipant[selectedParticipant]?.slice(0, 8).map((item, index) => (
                        <div 
                          key={index}
                          className="bg-secondary/60 rounded-md p-2 text-center"
                        >
                          <div className="font-medium">{item.word}</div>
                          <div className="text-xs text-muted-foreground">{item.count} kez</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="text-sm text-muted-foreground">
                  {getAverageResponseTime(selectedParticipant)}
                </CardFooter>
              </Card>
            )}

            <div className="mt-6">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Kelime Kullanım Karşılaştırması</CardTitle>
                  <CardDescription>Katılımcıların kelime çeşitliliği ve toplam kullanımı</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value: any) => [`${value}`, '']}
                          labelFormatter={(name: string) => `${name}`}
                        />
                        <Bar name="Benzersiz Kelimeler" dataKey="uniqueWords" fill="#8884d8" />
                        <Bar name="Toplam Kullanım" dataKey="totalUsage" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="mt-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ConversationPatternCard
              title="Konuşma Başlatıcı"
              description="En çok konuşma başlatan kişi"
              person={mostInitiator}
              icon={<MessageCircle size={20} className="text-blue-500" />}
              color="bg-blue-100"
            />
            
            <ConversationPatternCard
              title="En Sık Yanıtlayan"
              description="Mesajlara en sık yanıt veren kişi"
              person={mostReplier}
              icon={<ArrowRight size={20} className="text-green-500" />}
              color="bg-green-100"
            />
            
            <ConversationPatternCard
              title="En Hızlı Yanıt Veren"
              description="Mesajlara en hızlı yanıt veren kişi"
              person={fastestResponder}
              icon={<Clock size={20} className="text-amber-500" />}
              value={`Ortalama ${participantStats[fastestResponder]?.responseTime.average ? Math.round(participantStats[fastestResponder].responseTime.average) : '?'} dakika`}
              color="bg-amber-100"
            />
            
            <ConversationPatternCard
              title="En Çok Onaylayan"
              description="En fazla onaylama ifadesi kullanan kişi"
              person={mostAgreements}
              icon={<Check size={20} className="text-emerald-500" />}
              color="bg-emerald-100"
            />
          </div>
          
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>İletişim Tarzları</CardTitle>
              <CardDescription>Katılımcıların iletişim tarzı ve mesaj yapıları</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.keys(participantStats).map(participant => {
                  const stats = participantStats[participant];
                  return (
                    <div key={participant} className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: participantColors[participant] }}
                        ></div>
                        <h3 className="text-lg font-medium">{participant}</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-secondary/40 rounded-lg p-3">
                          <div className="text-sm text-muted-foreground mb-1">Ortalama Mesaj Uzunluğu</div>
                          <div className="text-xl font-medium">{Math.round(stats.averageMessageLength)} karakter</div>
                        </div>
                        
                        <div className="bg-secondary/40 rounded-lg p-3">
                          <div className="text-sm text-muted-foreground mb-1">Kelime/Mesaj Oranı</div>
                          <div className="text-xl font-medium">{(stats.wordCount / stats.messageCount).toFixed(1)}</div>
                        </div>
                        
                        <div className="bg-secondary/40 rounded-lg p-3">
                          <div className="text-sm text-muted-foreground mb-1">Emoji Kullanım Sıklığı</div>
                          <div className="text-xl font-medium">{((stats.emojiCount / stats.messageCount) * 100).toFixed(1)}%</div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-1">
                        {getConversationStyle(participant)?.map((style, i) => (
                          <Badge key={i} variant="outline">{style}</Badge>
                        ))}
                        {getParticipantBehavior(participant).map((behavior, i) => (
                          <Badge key={i} variant="secondary">{behavior}</Badge>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>İletişim Desenleri</CardTitle>
              <CardDescription>Sohbet içindeki iletişim desenleri ve dinamikler</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-secondary/40 rounded-lg p-4 flex flex-col items-center">
                  <MessagesSquare size={24} className="mb-2 text-primary" />
                  <div className="text-xl font-medium">
                    {Object.values(participantStats).reduce((sum, stats) => sum + stats.messageCount, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground text-center">Toplam Mesaj</div>
                </div>
                
                <div className="bg-secondary/40 rounded-lg p-4 flex flex-col items-center">
                  <Brain size={24} className="mb-2 text-violet-500" />
                  <div className="text-xl font-medium">
                    {Object.values(participantStats).reduce((sum, stats) => sum + stats.wordCount, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground text-center">Toplam Kelime</div>
                </div>
                
                <div className="bg-secondary/40 rounded-lg p-4 flex flex-col items-center">
                  <Smile size={24} className="mb-2 text-amber-500" />
                  <div className="text-xl font-medium">
                    {Object.values(participantStats).reduce((sum, stats) => sum + stats.emojiCount, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground text-center">Toplam Emoji</div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-2">Katılımcı Dağılımı</h4>
                <div className="flex items-center gap-2">
                  {Object.entries(participantStats).map(([name, stats], index) => (
                    <div 
                      key={name} 
                      className="flex-1 h-8 rounded-md relative overflow-hidden"
                      style={{ backgroundColor: participantColors[name] }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium">
                        {Math.round((stats.messageCount / Object.values(participantStats).reduce((sum, s) => sum + s.messageCount, 0)) * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                  {Object.keys(participantStats).map(name => (
                    <div key={name} className="flex items-center gap-1">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: participantColors[name] }}
                      ></div>
                      {name}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WordAnalysisSection;
