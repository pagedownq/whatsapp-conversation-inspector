import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, LineChart, Line, Legend, PieChart, Pie } from 'recharts';
import { Brain, Heart, ArrowRight, Scissors, MessageSquare, ThumbsDown, AlertTriangle, AlertCircle, ThumbsUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ParticipantStats } from '@/utils/analyzeChat';
import { getSentimentColor, getManipulationLevel, getManipulationTypeLabel } from '@/utils/sentimentAnalysis';

interface SentimentAnalysisSectionProps {
  sentiment: {
    positivePercentage: number;
    negativePercentage: number;
    neutralPercentage: number;
    averageScore: number;
  };
  manipulation: {
    mostManipulative: string;
    totalManipulativeMessages: number;
    manipulationScores: Record<string, number>;
    messagesByType: Record<string, number>;
  };
  participantStats: Record<string, ParticipantStats>;
  participantColors: Record<string, string>;
}

const SENTIMENT_COLORS = ['#66BB6A', '#BDBDBD', '#EF5350'];

const SentimentAnalysisSection: React.FC<SentimentAnalysisSectionProps> = ({
  sentiment,
  manipulation,
  participantStats,
  participantColors
}) => {
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(
    Object.keys(participantStats)[0] || null
  );
  const [activeTab, setActiveTab] = useState("sentiment");

  const getEmotionIcon = (score: number) => {
    if (score > 0.6) return <ThumbsUp className="text-green-500" />;
    if (score < -0.3) return <ThumbsDown className="text-red-500" />;
    return <MessageSquare className="text-amber-500" />;
  };

  const getManipulationIcon = (score: number) => {
    if (score > 0.6) return <AlertCircle className="text-red-500" />;
    if (score > 0.3) return <AlertTriangle className="text-amber-500" />;
    return <Brain className="text-blue-500" />;
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sentiment">Duygu Analizi</TabsTrigger>
          <TabsTrigger value="manipulation">Manipülasyon Analizi</TabsTrigger>
        </TabsList>

        <TabsContent value="sentiment" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Genel Duygu Analizi</CardTitle>
              <CardDescription>
                Konuşmanın genel duygu durumu ve dağılımı
              </CardDescription>
            </CardHeader>
            <CardContent>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-secondary/50 rounded-lg p-4 flex flex-col items-center">
                  <div className="text-2xl font-semibold text-green-500">%{sentiment.positivePercentage}</div>
                  <div className="text-sm text-muted-foreground">Pozitif</div>
                </div>
                
                <div className="bg-secondary/50 rounded-lg p-4 flex flex-col items-center">
                  <div className="text-2xl font-semibold">%{sentiment.neutralPercentage}</div>
                  <div className="text-sm text-muted-foreground">Nötr</div>
                </div>
                
                <div className="bg-secondary/50 rounded-lg p-4 flex flex-col items-center">
                  <div className="text-2xl font-semibold text-red-500">%{sentiment.negativePercentage}</div>
                  <div className="text-sm text-muted-foreground">Negatif</div>
                </div>
              </div>

              
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Katılımcı Duygu Analizi</CardTitle>
                <CardDescription>Katılımcıların duygu durumları ve karşılaştırmaları</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {Object.keys(participantStats).map((name) => (
                      <Button
                        key={name}
                        variant={selectedParticipant === name ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedParticipant(name)}
                        style={
                          selectedParticipant !== name
                            ? { borderLeft: `3px solid ${participantColors[name]}` }
                            : {}
                        }
                      >
                        {name}
                      </Button>
                    ))}
                  </div>

                  {selectedParticipant && (
                    <div className="bg-secondary/30 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: participantColors[selectedParticipant] }}
                          ></div>
                          <h3 className="font-medium">{selectedParticipant}</h3>
                        </div>
                        <Badge
                          style={{
                            backgroundColor: getSentimentColor(
                              participantStats[selectedParticipant].sentiment.averageScore
                            ),
                          }}
                        >
                          {participantStats[selectedParticipant].sentiment.averageScore > 0.2
                            ? "Pozitif"
                            : participantStats[selectedParticipant].sentiment.averageScore < -0.2
                            ? "Negatif"
                            : "Nötr"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="text-center p-2 rounded-md bg-green-100">
                          <div className="text-lg font-semibold">
                            {participantStats[selectedParticipant].sentiment.positiveMsgCount}
                          </div>
                          <div className="text-xs text-muted-foreground">Pozitif Mesaj</div>
                        </div>

                        <div className="text-center p-2 rounded-md bg-gray-100">
                          <div className="text-lg font-semibold">
                            {participantStats[selectedParticipant].sentiment.neutralMsgCount}
                          </div>
                          <div className="text-xs text-muted-foreground">Nötr Mesaj</div>
                        </div>

                        <div className="text-center p-2 rounded-md bg-red-100">
                          <div className="text-lg font-semibold">
                            {participantStats[selectedParticipant].sentiment.negativeMsgCount}
                          </div>
                          <div className="text-xs text-muted-foreground">Negatif Mesaj</div>
                        </div>
                      </div>

                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                {
                                  name: "Pozitif",
                                  value: participantStats[selectedParticipant].sentiment.positiveMsgCount,
                                },
                                {
                                  name: "Nötr",
                                  value: participantStats[selectedParticipant].sentiment.neutralMsgCount,
                                },
                                {
                                  name: "Negatif",
                                  value: participantStats[selectedParticipant].sentiment.negativeMsgCount,
                                },
                              ]}
                              cx="50%"
                              cy="50%"
                              outerRadius={60}
                              fill="#8884d8"
                              dataKey="value"
                              label
                            >
                              {SENTIMENT_COLORS.map((color, index) => (
                                <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[index % SENTIMENT_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value} mesaj`, '']} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            
          </div>
        </TabsContent>

        <TabsContent value="manipulation" className="space-y-6 mt-6">
          
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="text-amber-500 h-5 w-5" />
                Manipülasyon Analizi
              </CardTitle>
              <CardDescription>
                Konuşmadaki manipülatif davranışların analizi ve tespiti
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">En Manipülatif Katılımcı</h3>
                  <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-lg flex items-center gap-3">
                    <Scissors className="text-red-500 h-10 w-10" />
                    <div>
                      <div className="font-medium text-xl">{manipulation.mostManipulative}</div>
                      <div className="text-xs text-muted-foreground">
                        {manipulation.manipulationScores[manipulation.mostManipulative]} manipülatif mesaj
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Toplam Manipülatif Mesaj</h3>
                  <div className="bg-secondary/50 p-4 rounded-lg flex items-center gap-3">
                    <div className="text-3xl font-semibold">{manipulation.totalManipulativeMessages}</div>
                    <div className="text-xs text-muted-foreground">
                      Tespit edilen manipülatif mesaj
                      <br />
                      ({Math.round((manipulation.totalManipulativeMessages / Object.values(participantStats).reduce((sum, p) => sum + p.messageCount, 0)) * 100)}% oranında)
                    </div>
                  </div>
                </div>
              </div>
              
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Manipülasyon Türleri</h3>
              <div className="h-[300px] mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(manipulation.messagesByType).map(([type, count]) => ({
                        name: getManipulationTypeLabel(type),
                        value: count
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={40}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                      label
                    >
                      {Object.keys(manipulation.messagesByType).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${280 + index * 30}, 70%, 60%)`} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} örnek`, '']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SentimentAnalysisSection;
