
import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, ChevronRight, Trash2, Clock, Calendar, User, Brain, BookOpen, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ChatStats } from '@/utils/analyzeChat';

interface PastAnalysesProps {
  onSelectAnalysis: (data: ChatStats) => void;
}

const PastAnalyses: React.FC<PastAnalysesProps> = ({ onSelectAnalysis }) => {
  const { toast } = useToast();

  // Inform user that saving functionality has been removed
  React.useEffect(() => {
    toast({
      title: 'Bilgi',
      description: 'Analiz kaydetme özelliği kaldırılmıştır. Bu ekranda örnek analizler gösterilmektedir.',
    });
  }, [toast]);

  // Static example analyses
  const exampleAnalyses = [
    {
      id: '1',
      title: 'Örnek Sohbet Analizi',
      date: new Date().toISOString(),
      participantCount: 2,
      messageCount: 356,
      duration: 45,
      startDate: '10.05.2023',
      endDate: '24.06.2023',
      mostManipulative: 'Ali',
      data: {} as ChatStats // This would be populated with example data if needed
    },
    {
      id: '2',
      title: 'İş Grubu Analizi',
      date: new Date().toISOString(),
      participantCount: 8,
      messageCount: 1243,
      duration: 120,
      startDate: '01.01.2023',
      endDate: '01.05.2023',
      mostManipulative: 'Mehmet',
      data: {} as ChatStats // This would be populated with example data if needed
    }
  ];

  const handleSampleSelect = () => {
    toast({
      title: 'Bilgi',
      description: 'Örnek analiz seçildi. Gerçek analiz için WhatsApp sohbet dosyası yüklemeniz gerekmektedir.',
    });
  };

  return (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-bold">Örnek Analizler</h2>
      <p className="text-muted-foreground mb-4">
        Bu ekranda gerçek analizler yerine örnek analizler gösterilmektedir. Gerçek bir analiz yapmak için yeni bir WhatsApp sohbet dosyası yükleyin.
      </p>
      
      <div className="grid gap-4">
        {exampleAnalyses.map(analysis => (
          <motion.div 
            key={analysis.id}
            className="border border-border rounded-xl overflow-hidden bg-card shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            whileHover={{ y: -2 }}
            onClick={handleSampleSelect}
          >
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium text-lg">{analysis.title}</h3>
                <div className="text-xs text-muted-foreground">
                  Örnek Analiz
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-primary/70" />
                  <span className="text-sm">{analysis.participantCount} Kişi</span>
                </div>
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2 text-primary/70" />
                  <span className="text-sm">{analysis.messageCount} Mesaj</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-primary/70" />
                  <span className="text-sm">{analysis.duration} Gün</span>
                </div>
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-2 text-primary/70" />
                  <span className="text-sm">Genişletilmiş Analiz</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Brain className="h-4 w-4 mr-2 text-purple-500" />
                  <span className="text-sm text-purple-500 font-medium">En Manipülatif: {analysis.mostManipulative}</span>
                </div>
                <div className="flex items-center">
                  <Sparkles className="h-4 w-4 mr-2 text-amber-500" />
                  <span className="text-sm text-amber-500 font-medium">Yeni İlişki Analizi</span>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  className="inline-flex items-center px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <span>Görüntüle</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default PastAnalyses;
