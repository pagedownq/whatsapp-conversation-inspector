
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, LineChart, Line, Legend, PieChart, Pie } from 'recharts';
import { Brain, MessageSquare, AlertTriangle, ThumbsUp, ThumbsDown, User, Smile, Frown, Meh, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getSentimentColor, getManipulationLevel, getManipulationTypeLabel } from '@/utils/sentimentAnalysis';

interface SentimentAnalysisSectionProps {
  sentiment: {
    positivePercentage: number;
    negativePercentage: number;
    neutralPercentage: number;
    averageScore: number;
  };
  manipulation: {
    averageScore: number;
    mostManipulative: string;
    messagesByType: Record<string, number>;
  };
  participantStats: Record<string, any>;
  participantColors: Record<string, string>;
}

const SentimentAnalysisSection: React.FC<SentimentAnalysisSectionProps> = ({
  sentiment,
  manipulation,
  participantStats,
  participantColors
}) => {
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(
    Object.keys(participantStats)[0] || null
  );
  const [activeTab, setActiveTab] = useState("duygular");

  const sentimentData = Object.entries(participantStats).map(([name, data]: [string, any]) => ({
    name,
    score: data.sentiment ? data.sentiment.averageScore : 0,
    positive: data.sentiment ? data.sentiment.positiveMsgCount : 0,
    negative: data.sentiment ? data.sentiment.negativeMsgCount : 0,
    neutral: data.sentiment ? data.sentiment.neutralMsgCount : 0,
  }));
  
  const manipulationData = Object.entries(participantStats).map(([name, data]: [string, any]) => ({
    name,
    score: data.manipulation ? data.manipulation.averageScore : 0,
    messages: data.manipulation ? data.manipulation.messageCount : 0
  })).sort((a, b) => b.score - a.score);
  
  const manipulationTypesData = Object.entries(manipulation.messagesByType).map(([type, count]) => ({
    name: getManipulationTypeLabel(type),
    value: count
  })).sort((a, b) => b.value - a.value);

  const getSentimentIcon = (score: number) => {
    if (score > 0.2) return <Smile className="h-5 w-5 text-green-500" />;
    if (score < -0.2) return <Frown className="h-5 w-5 text-red-500" />;
    return <Meh className="h-5 w-5 text-amber-500" />;
  };
  
  const getSentimentLabel = (score: number) => {
    if (score > 0.5) return "Çok Olumlu";
    if (score > 0.2) return "Olumlu";
    if (score > -0.2) return "Nötr";
    if (score > -0.5) return "Olumsuz";
    return "Çok Olumsuz";
  };
  
  const getManipulationExamples = (participant: string) => {
    const data = participantStats[participant];
    if (!data || !data.manipulation || !data.manipulation.examples) return [];
    return data.manipulation.examples;
  };

  const getSentimentTrend = (participant: string) => {
    const data = participantStats[participant];
    if (!data || !data.sentiment || !data.sentiment.trend) return [];
    return data.sentiment.trend.map((point: any, index: number) => ({
      name: `Bölüm ${index + 1}`,
      score: point
    }));
  };
  
  const getEmotionDistribution = (participant: string) => {
    const data = participantStats[participant];
    if (!data || !data.sentiment) return [];
    
    return [
      { name: 'Pozitif', value: data.sentiment.positiveMsgCount },
      { name: 'Nötr', value: data.sentiment.neutralMsgCount },
      { name: 'Negatif', value: data.sentiment.negativeMsgCount }
    ];
  };

  const SENTIMENT_COLORS = ['#22c55e', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="duygular">Duygu Analizi</TabsTrigger>
          <TabsTrigger value="manipulasyon">Manipülasyon Analizi</TabsTrigger>
        </TabsList>
        
        <TabsContent value="duygular" className="mt-4 space-y-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Genel Duygu Analizi</CardTitle>
              <CardDescription>
                Tüm sohbetin duygusal ton analizi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                <div className="bg-secondary/50 rounded-xl p-4 text-center flex flex-col items-center">
                  <ThumbsUp className="h-6 w-6 text-green-500 mb-2" />
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Pozitif Mesajlar</div>
                  <div className="text-2xl font-medium">{Math.round(sentiment.positivePercentage)}%</div>
                </div>
                <div className="bg-secondary/50 rounded-xl p-4 text-center flex flex-col items-center">
                  <Meh className="h-6 w-6 text-amber-500 mb-2" />
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Nötr Mesajlar</div>
                  <div className="text-2xl font-medium">{Math.round(sentiment.neutralPercentage)}%</div>
                </div>
                <div className="bg-secondary/50 rounded-xl p-4 text-center flex flex-col items-center">
                  <ThumbsDown className="h-6 w-6 text-red-500 mb-2" />
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Negatif Mesajlar</div>
                  <div className="text-2xl font-medium">{Math.round(sentiment.negativePercentage)}%</div>
                </div>
              </div>
              
              <div className="h-64 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={sentimentData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis dataKey="name" />
                    <YAxis domain={[-1, 1]} ticks={[-1, -0.5, 0, 0.5, 1]} />
                    <Tooltip 
                      formatter={(value: any) => [Number(value).toFixed(2), 'Duygu Skoru']}
                      labelFormatter={(label: any) => `${label}`}
                    />
                    <Legend />
                    <Bar 
                      name="Duygu Skoru" 
                      dataKey="score" 
                      animationBegin={0}
                      animationDuration={1500}
                      animationEasing="ease-out"
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={getSentimentColor(entry.score)} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Katılımcı Duygu Analizi</h3>
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(participantStats).map((participant) => (
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: participantColors[selectedParticipant] }}
                            ></div>
                            {selectedParticipant} - Duygu Profili
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-2">
                            {getSentimentIcon(participantStats[selectedParticipant]?.sentiment?.averageScore || 0)}
                            <div>
                              <div className="font-medium">
                                {getSentimentLabel(participantStats[selectedParticipant]?.sentiment?.averageScore || 0)}
                              </div>
                              <div className="text-xs text-muted-foreground">Genel Duygusal Ton</div>
                            </div>
                          </div>
                          <div className="text-2xl font-bold" style={{ 
                            color: getSentimentColor(participantStats[selectedParticipant]?.sentiment?.averageScore || 0) 
                          }}>
                            {(participantStats[selectedParticipant]?.sentiment?.averageScore || 0).toFixed(2)}
                          </div>
                        </div>
                        
                        <div className="h-[240px]">
                          <PieChart width={300} height={240}>
                            <Pie
                              data={getEmotionDistribution(selectedParticipant)}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              fill="#8884d8"
                              paddingAngle={2}
                              dataKey="value"
                              label
                            >
                              {getEmotionDistribution(selectedParticipant).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[index % SENTIMENT_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: any) => [`${value} mesaj`, entry => entry.name]} />
                            <Legend />
                          </PieChart>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Duygusal Değişim</CardTitle>
                        <CardDescription>Sohbet boyunca duygusal değişimler</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[240px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={getSentimentTrend(selectedParticipant)}
                              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                              <XAxis dataKey="name" />
                              <YAxis domain={[-1, 1]} ticks={[-1, -0.5, 0, 0.5, 1]} />
                              <Tooltip formatter={(value: any) => [Number(value).toFixed(2), 'Duygu Skoru']} />
                              <Line 
                                type="monotone" 
                                dataKey="score" 
                                stroke="#8884d8" 
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="manipulasyon" className="mt-4 space-y-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Manipülatif Dil Analizi</CardTitle>
              <CardDescription>
                Sohbette kullanılan manipülatif dil ve teknikler
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                  <div className="bg-secondary/50 rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">En Manipülatif Katılımcı</div>
                        <div className="font-medium text-lg">{manipulation.mostManipulative}</div>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-orange-500" />
                    </div>
                  </div>
                  
                  <div className="bg-secondary/50 rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Ortalama Manipülasyon Skoru</div>
                        <div className="font-medium text-lg">
                          {manipulation.averageScore.toFixed(2)}/1.0 
                          <span className="ml-2 text-sm font-normal text-muted-foreground">
                            ({getManipulationLevel(manipulation.averageScore)})
                          </span>
                        </div>
                      </div>
                      <Brain className="h-8 w-8 text-purple-500" />
                    </div>
                  </div>
                </div>
                
                <div className="h-64 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={manipulationData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                    >
                      <XAxis type="number" domain={[0, 1]} />
                      <YAxis type="category" dataKey="name" width={80} />
                      <Tooltip 
                        formatter={(value: any) => [`${Number(value).toFixed(2)} / 1.0`, 'Manipülasyon Skoru']}
                        labelFormatter={(label: any) => `${label}`}
                      />
                      <Bar 
                        dataKey="score" 
                        fill="#9333ea"
                        animationBegin={0}
                        animationDuration={1500}
                        animationEasing="ease-out"
                      >
                        {manipulationData.map((entry, index) => (
                          <Cell key={index} fill={participantColors[entry.name] || "#9333ea"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Manipülasyon Türleri</CardTitle>
                    <CardDescription>Sohbette tespit edilen manipülasyon teknikleri</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {manipulationTypesData.slice(0, 6).map((technique, index) => (
                        <div 
                          key={index} 
                          className="flex justify-between items-center p-3 rounded-lg bg-secondary/40"
                        >
                          <span>{technique.name}</span>
                          <Badge variant="outline">{technique.value} kez</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Manipülasyon Tespit Diagramı</CardTitle>
                    <CardDescription>Teknik bazlı dağılım</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[240px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={manipulationTypesData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {manipulationTypesData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={`hsl(${280 + index * 30}, 70%, 60%)`} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: any) => [`${value} örnek`, '']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Manipülatif Dil Örnekleri</h3>
                
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(participantStats).map((participant) => (
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
                  <div className="space-y-4">
                    {getManipulationExamples(selectedParticipant).length > 0 ? (
                      getManipulationExamples(selectedParticipant).slice(0, 4).map((example: any, index: number) => (
                        <div key={index} className="bg-secondary/30 rounded-xl p-4">
                          <div className="flex items-center mb-2">
                            <User className="h-4 w-4 mr-2" />
                            <span className="text-xs text-muted-foreground">{selectedParticipant}</span>
                          </div>
                          <p className="text-sm">{example.content}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {example.instances && example.instances.map((instance: any, idx: number) => (
                              <Badge key={idx} variant="outline" className="bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300">
                                {getManipulationTypeLabel(instance.type)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        Bu katılımcı için manipülatif dil örneği bulunamadı.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SentimentAnalysisSection;
