import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Shield, AlertTriangle, MessageCircle, Clock, ThumbsUp, ThumbsDown, Flame, TrendingUp, TrendingDown, User, RefreshCw, ArrowRight, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useIsMobile } from '@/hooks/use-mobile';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';
import SubscriptionCheck from './SubscriptionCheck';

interface RelationshipAnalysisSectionProps {
  loveExpressions: {
    total: number;
    mostRomantic: string;
    mostCommonExpressions: Array<{ text: string; count: number }>;
  };
  apologies: {
    total: number;
    mostApologetic: string;
    apologyExamples: Array<{ 
      sender: string; 
      content: string; 
      text: string; 
      sincerity?: number;
      context?: string;
    }>;
  };
  participantStats: Record<string, any>;
  participantColors: Record<string, string>;
}

const RelationshipInsightCard = ({ 
  title, 
  description, 
  icon, 
  color,
  children
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode; 
  color: string;
  children: React.ReactNode;
}) => (
  <div className="bg-card rounded-lg border shadow-sm">
    <div className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  </div>
);

const RelationshipAnalysisSection: React.FC<RelationshipAnalysisSectionProps> = ({
  loveExpressions,
  apologies,
  participantStats,
  participantColors
}) => {
  const isMobile = useIsMobile();

  const getAllLoveExpressions = () => {
    let examples: any[] = [];
    Object.entries(participantStats).forEach(([name, data]: [string, any]) => {
      if (data.loveExpressions && data.loveExpressions.examples) {
        examples = [...examples, ...data.loveExpressions.examples.map((ex: any) => ({
          ...ex,
          sender: name,
          intensity: ex.isILoveYou ? 'Yüksek' : 'Normal'
        }))];
      }
    });
    return examples.slice(0, 5);
  };

  const apologyData = Object.entries(participantStats).map(([name, data]: [string, any]) => ({
    name,
    count: data.apologies ? data.apologies.count : 0
  })).sort((a, b) => b.count - a.count);
  
  const loveExpressionData = Object.entries(participantStats).map(([name, data]: [string, any]) => ({
    name,
    count: data.loveExpressions ? data.loveExpressions.count : 0,
    iLoveYouCount: data.loveExpressions ? data.loveExpressions.iLoveYouCount : 0
  })).sort((a, b) => b.count - a.count);

  const relationshipDynamics = () => {
    const participants = Object.keys(participantStats);
    if (participants.length < 2) return null;
    
    const insights = [];
    
    // Baş başa mı?
    const messageDistribution = Object.entries(participantStats).map(([name, data]: [string, any]) => ({
      name,
      percentage: data.messageCount / Object.values(participantStats).reduce((sum: number, d: any) => sum + d.messageCount, 0) * 100
    }));
    
    const messageBalance = Math.abs(messageDistribution[0].percentage - messageDistribution[1].percentage);
    if (messageBalance < 15) {
      insights.push({
        text: "İletişim dengeli, her iki taraf da benzer miktarda mesaj gönderiyor",
        icon: <RefreshCw size={16} className="text-green-500" />,
        type: "positive"
      });
    } else {
      const dominant = messageDistribution.sort((a, b) => b.percentage - a.percentage)[0].name;
      insights.push({
        text: `${dominant} sohbette daha baskın, daha fazla mesaj gönderiyor`,
        icon: <TrendingUp size={16} className="text-amber-500" />,
        type: "neutral"  
      });
    }

    // Duygusal derinlik analizi
    const emotionalDepthScores = Object.entries(participantStats).map(([name, data]: [string, any]) => ({
      name,
      score: data.intimacy?.emotionalDepth || 0
    }));

    const avgEmotionalDepth = emotionalDepthScores.reduce((sum, item) => sum + item.score, 0) / emotionalDepthScores.length;
    if (avgEmotionalDepth > 0.7) {
      insights.push({
        text: "İlişkide yüksek duygusal derinlik ve açıklık var",
        icon: <Heart size={16} className="text-green-500" />,
        type: "positive"
      });
    } else if (avgEmotionalDepth < 0.3) {
      insights.push({
        text: "İlişkide daha fazla duygusal paylaşım faydalı olabilir",
        icon: <Heart size={16} className="text-amber-500" />,
        type: "warning"
      });
    }
    
    // Romantik ifadeler dengeli mi?
    if (loveExpressionData.length >= 2 && loveExpressionData[0].count > 0 && loveExpressionData[1].count > 0) {
      const loveRatio = loveExpressionData[0].count / loveExpressionData[1].count;
      if (loveRatio > 3) {
        insights.push({
          text: `${loveExpressionData[0].name} sevgi ifadelerini diğer taraftan çok daha fazla kullanıyor`,
          icon: <Heart size={16} className="text-red-500" />,
          type: "warning"
        });
      } else if (loveRatio < 2) {
        insights.push({
          text: "Sevgi ifadeleri her iki tarafta da benzer oranda kullanılıyor",
          icon: <Heart size={16} className="text-green-500" />,
          type: "positive"
        });
      }
    }
    
    // Özür bulguları
    if (apologyData.length >= 2) {
      const apologyRatio = (apologyData[0].count > 0 && apologyData[1].count > 0) ? 
        apologyData[0].count / apologyData[1].count : 
        (apologyData[0].count > 0 ? Infinity : 0);
        
      if (apologyRatio > 3) {
        insights.push({
          text: `${apologyData[0].name} diğer taraftan çok daha fazla özür diliyor`,
          icon: <Shield size={16} className="text-amber-500" />,
          type: "warning"
        });
      }
    }
    
    // Yanıt süreleri  
    const avgResponseTimes: [string, number][] = Object.entries(participantStats)
      .map(([name, data]: [string, any]) => [name, data.responseTime && data.responseTime.average ? data.responseTime.average : 0])
      .filter(([_, time]) => time > 0) as [string, number][];
    
    if (avgResponseTimes.length >= 2) {
      const timeRatio = avgResponseTimes[0][1] / avgResponseTimes[1][1];
      if (timeRatio > 3) {
        const slower = avgResponseTimes.sort((a, b) => b[1] - a[1])[0][0];
        insights.push({
          text: `${slower} yanıt vermekte genellikle daha yavaş`,
          icon: <Clock size={16} className="text-amber-500" />,
          type: "warning"
        });
      }
    }
    
    // Manipülatif dil kullanımı varsa
    const manipulationCounts = Object.entries(participantStats).map(([name, data]: [string, any]) => ({
      name,
      count: data.manipulation ? data.manipulation.messageCount : 0
    }));
    
    if (manipulationCounts.some(m => m.count > 5)) {
      const mostManipulative = manipulationCounts.sort((a, b) => b.count - a.count)[0].name;
      insights.push({
        text: `${mostManipulative} manipülatif dil kullanma eğiliminde`,
        icon: <AlertTriangle size={16} className="text-red-500" />,
        type: "negative"
      });
    }
    
    return insights;
  };

  const dynamics = relationshipDynamics();

  const calculateRelationshipScore = () => {
    if (Object.keys(participantStats).length < 2) return 0;
    
    let score = 50; // Başlangıç puanı
    
    // Pozitif faktörler
    // 1. Dengeli mesaj dağılımı
    const messageDistribution = Object.values(participantStats).map((data: any) => data.messageCount);
    const totalMessages = messageDistribution.reduce((sum: number, count: number) => sum + count, 0);
    const messageBalance = Math.abs((messageDistribution[0] / totalMessages * 100) - (messageDistribution[1] / totalMessages * 100));
    
    if (messageBalance < 15) score += 10;
    else if (messageBalance > 40) score -= 10;
    
    // 2. Sevgi ifadeleri ve duygusal derinlik
    const totalLoveExpressions = loveExpressions.total;
    const emotionalDepth = Object.values(participantStats).reduce((sum: number, data: any) => {
      return sum + (data.intimacy?.emotionalDepth || 0);
    }, 0) / Object.keys(participantStats).length;

    if (totalLoveExpressions > 20 && emotionalDepth > 0.7) score += 20;
    else if (totalLoveExpressions > 10 && emotionalDepth > 0.5) score += 15;
    else if (totalLoveExpressions > 5 && emotionalDepth > 0.3) score += 10;
    
    // 3. Güven ve açıklık
    const vulnerabilityScore = Object.values(participantStats).reduce((sum: number, data: any) => {
      return sum + (data.intimacy?.vulnerabilitySharing || 0);
    }, 0) / Object.keys(participantStats).length;

    if (vulnerabilityScore > 0.7) score += 15;
    else if (vulnerabilityScore > 0.4) score += 10;
    
    // 4. İletişimde karşılıklılık
    const reciprocityScore = Object.values(participantStats).reduce((sum: number, data: any) => {
      return sum + (data.intimacy?.reciprocity || 0);
    }, 0) / Object.keys(participantStats).length;

    if (reciprocityScore > 0.8) score += 15;
    else if (reciprocityScore > 0.6) score += 10;
    
    // 5. İletişim süresi - uzun süreli ilişki
    const days = Object.values(participantStats)[0].conversationDuration || 0;
    if (days > 365) score += 10;
    else if (days > 180) score += 7;
    else if (days > 90) score += 5;
    
    // Negatif faktörler
    // 1. Manipülatif dil
    const manipulationCounts = Object.values(participantStats).map((data: any) => data.manipulation?.messageCount || 0);
    const totalManipulation = manipulationCounts.reduce((sum: number, count: number) => sum + count, 0);
    
    if (totalManipulation > 20) score -= 20;
    else if (totalManipulation > 10) score -= 15;
    else if (totalManipulation > 5) score -= 10;
    
    // 2. Aşırı dengesiz özür ve güç dinamiği
    if (apologyData.length >= 2) {
      const apologyRatio = (apologyData[0].count && apologyData[1].count) ? 
        apologyData[0].count / apologyData[1].count : 0;
      
      if (apologyRatio > 5) score -= 15;
      else if (apologyRatio > 3) score -= 10;
    }
    
    // 3. Duygusal tutarsızlık
    const consistencyScore = Object.values(participantStats).reduce((sum: number, data: any) => {
      return sum + (data.intimacy?.consistency || 0);
    }, 0) / Object.keys(participantStats).length;

    if (consistencyScore < 0.3) score -= 15;
    else if (consistencyScore < 0.5) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  };

  const relationshipScore = calculateRelationshipScore();
  
  const getRelationshipHealthLabel = (score: number) => {
    if (score >= 80) return "Çok Sağlıklı";
    if (score >= 65) return "Sağlıklı";
    if (score >= 50) return "Dengeli";
    if (score >= 35) return "İyileştirilebilir";
    return "Problemli";
  };
  
  const getRelationshipColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 65) return "text-green-500";
    if (score >= 50) return "text-amber-500";
    if (score >= 35) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <SubscriptionCheck>
      <div className="space-y-6">
        {Object.keys(participantStats).length >= 2 && (
          <div className="bg-card rounded-lg border shadow-sm mb-8">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">İlişki Sağlığı</h2>
              <p className="text-muted-foreground mb-6">WhatsApp konuşmasına dayalı ilişki sağlığı değerlendirmesi</p>
              <div className="grid grid-cols-1 gap-8">
                <div>
                  <div className="mb-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">İlişki Puanı</span>
                      <span className={`font-bold text-lg ${getRelationshipColor(relationshipScore)}`}>
                        {relationshipScore}/100
                      </span>
                    </div>
                    <Progress value={relationshipScore} className="h-3" />
                    <div className="text-center font-medium mt-2 text-lg">
                      <span className={getRelationshipColor(relationshipScore)}>
                        {getRelationshipHealthLabel(relationshipScore)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-3">İlişki Bulguları</h4>
                    <div className="space-y-2">
                      {dynamics && dynamics.map((insight, index) => (
                        <div 
                          key={index} 
                          className={`p-3 rounded-lg text-sm flex items-start gap-2 ${
                            insight.type === 'positive' ? 'bg-green-100 dark:bg-green-900/20' : 
                            insight.type === 'negative' ? 'bg-red-100 dark:bg-red-900/20' : 
                            'bg-amber-100 dark:bg-amber-900/20'
                          }`}
                        >
                          <div className="mt-0.5">{insight.icon}</div>
                          <span>{insight.text}</span>
                        </div>
                      ))}
                      
                      {(!dynamics || dynamics.length === 0) && (
                        <div className="text-muted-foreground text-sm italic">
                          Veri yetersiz. Daha doğru sonuçlar için daha fazla mesaj gerekiyor.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-3">İletişim Dağılımı</h4>
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={Object.entries(participantStats).map(([name, data]: [string, any]) => ({
                            name,
                            value: data.messageCount
                          }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={isMobile ? 40 : 60}
                          outerRadius={isMobile ? 80 : 90}
                          paddingAngle={2}
                          dataKey="value"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {Object.entries(participantStats).map(([name]) => (
                            <Cell key={name} fill={participantColors[name]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: any) => [`${value} mesaj`, '']}
                          labelFormatter={(name: any) => `${name}`}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 gap-8">
          <RelationshipInsightCard 
            title="Özür Dinamikleri" 
            description="Sohbetteki özür dileme desenleri" 
            icon={<Shield className="h-5 w-5 text-blue-600" />}
            color="bg-blue-100"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary/50 rounded-xl p-3 text-center">
                  <div className="text-xs text-muted-foreground mb-1">Toplam Özür</div>
                  <div className="text-2xl font-medium">{apologies.total}</div>
                </div>
                <div className="bg-secondary/50 rounded-xl p-3 text-center">
                  <div className="text-xs text-muted-foreground mb-1">En Çok Özür Dileyen</div>
                  <div className="text-lg font-medium truncate">{apologies.mostApologetic || "Yok"}</div>
                </div>
              </div>
              
              {apologies.apologyExamples && apologies.apologyExamples.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Örnek Özürler</h4>
                  {apologies.apologyExamples.slice(0, 2).map((example, index) => (
                    <div key={index} className="bg-secondary/30 rounded-xl p-3">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center">
                          <User className="h-3.5 w-3.5 mr-1.5" />
                          <span className="text-xs text-muted-foreground">{example.sender}</span>
                        </div>
                        {example.sincerity !== undefined && (
                          <Badge variant={example.sincerity > 0.7 ? "default" : "secondary"} className="text-[10px] py-0 px-2 h-4">
                            {example.sincerity > 0.7 ? "Samimi" : example.sincerity > 0.4 ? "Orta" : "Düşük"} 
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm">{example.content}</p>
                      <div className="mt-1.5 text-xs font-medium text-blue-600/80">
                        {example.text}
                      </div>
                      {example.context && (
                        <div className="mt-1 text-xs text-muted-foreground italic">
                          Bağlam: {example.context}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic">
                  Sohbette herhangi bir özür ifadesi bulunamadı.
                </div>
              )}
              
              {apologyData.length > 0 && (
                <div className="h-[180px] mt-4">
                  <h4 className="text-sm font-medium mb-2">Özür Dağılımı</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={apologyData}
                      margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                    >
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => [`${value} özür`, '']} />
                      <Bar dataKey="count" fill="#3B82F6">
                        {apologyData.map((entry, index) => (
                          <Cell key={index} fill={participantColors[entry.name] || "#3B82F6"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </RelationshipInsightCard>
          
          <RelationshipInsightCard
            title="Sevgi İfadeleri" 
            description="Sohbetteki romantik ifadeler ve sevgi göstergeleri"
            icon={<Heart className="h-5 w-5 text-rose-600" />}
            color="bg-rose-100"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary/50 rounded-xl p-3 text-center">
                  <div className="text-xs text-muted-foreground mb-1">Toplam Sevgi İfadesi</div>
                  <div className="text-2xl font-medium">{loveExpressions.total}</div>
                </div>
                <div className="bg-secondary/50 rounded-xl p-3 text-center">
                  <div className="text-xs text-muted-foreground mb-1">En Romantik Kişi</div>
                  <div className="text-lg font-medium truncate">{loveExpressions.mostRomantic || "Yok"}</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium">En Çok Kullanılan İfadeler</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {loveExpressions.mostCommonExpressions && 
                   loveExpressions.mostCommonExpressions.length > 0 ? (
                    loveExpressions.mostCommonExpressions.slice(0, 4).map((expression, index) => (
                      <div key={index} className="bg-secondary/30 rounded-xl p-3 flex items-center justify-between">
                        <div className="flex items-center">
                          <Heart className="h-3.5 w-3.5 text-rose-500 mr-2" />
                          <span>{expression.text}</span>
                        </div>
                        <span className="text-sm font-medium">{expression.count}x</span>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-sm text-muted-foreground italic">
                      Sohbette sevgi ifadeleri bulunamadı.
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Sevgi İfadesi Örnekleri</h4>
                {getAllLoveExpressions().length > 0 ? (
                  getAllLoveExpressions().map((example, index) => (
                    <div key={index} className="bg-secondary/30 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center">
                          <User className="h-3.5 w-3.5 mr-1.5" />
                          <span className="text-xs text-muted-foreground">{example.sender}</span>
                        </div>
                        <Badge variant={example.intensity === 'Yüksek' ? "default" : "secondary"} className="text-xs py-0">
                          {example.intensity} Yoğunluk
                        </Badge>
                      </div>
                      <p className="text-sm">{example.content}</p>
                      <div className="mt-1.5 text-xs font-medium text-rose-600/80">
                        {example.text}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground italic">
                    Örnek sevgi ifadeleri bulunamadı.
                  </div>
                )}
              </div>
            </div>
          </RelationshipInsightCard>
        </div>
        
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Sevgi İfadesi Dağılımı</CardTitle>
            <CardDescription>Katılımcıların sevgi ifadesi kullanım analizi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={loveExpressionData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [`${value}`, '']} />
                  <Bar name="Sevgi İfadeleri" dataKey="count" fill="#ec4899">
                    {loveExpressionData.map((entry) => (
                      <Cell key={entry.name} fill={participantColors[entry.name] || "#ec4899"} />
                    ))}
                  </Bar>
                  <Bar name="Seni Seviyorum" dataKey="iLoveYouCount" fill="#be185d">
                    {loveExpressionData.map((entry) => (
                      <Cell key={entry.name} fill={participantColors[entry.name] ? participantColors[entry.name] + "AA" : "#be185d"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>İlişki İpuçları</CardTitle>
            <CardDescription>Konuşma analizine dayalı iletişim önerileri</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-800">
                    <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                  </div>
                  <h3 className="font-medium">İletişimi Güçlendirme</h3>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <ArrowRight className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>Düşüncelerinizi açıkça ifade ederken karşı tarafın fikirlerine saygı gösterin</span>
                  </li>
                  <li className="flex gap-2">
                    <ArrowRight className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>Aktif dinleme yapın ve anladığınızı göstermek için soruları olumlu şekilde cevaplayın</span>
                  </li>
                  {relationshipScore < 65 && (
                    <li className="flex gap-2">
                      <ArrowRight className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>Konuşma başlatma ve yanıtlama dengesini iyileştirmeye çalışın</span>
                    </li>
                  )}
                </ul>
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-800">
                    <Shield className="h-5 w-5 text-amber-600 dark:text-amber-300" />
                  </div>
                  <h3 className="font-medium">Dikkat Edilmesi Gerekenler</h3>
                </div>
                <ul className="space-y-2 text-sm">
                  {loveExpressionData.length >= 2 && loveExpressionData[0].count / (loveExpressionData[1].count || 1) > 3 && (
                    <li className="flex gap-2">
                      <ArrowRight className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>Sevgi ifadelerindeki dengesizlik ilişkide sorun yaratabilir</span>
                    </li>
                  )}
                  {apologyData.length >= 2 && apologyData[0].count / (apologyData[1].count || 1) > 3 && (
                    <li className="flex gap-2">
                      <ArrowRight className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>Bir tarafın sürekli özür dilemesi sağlıklı olmayabilir</span>
                    </li>
                  )}
                  <li className="flex gap-2">
                    <ArrowRight className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>Manipülatif dil kullanımından kaçının, duygularınızı doğrudan ifade edin</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SubscriptionCheck>
  );
};

export default RelationshipAnalysisSection;
