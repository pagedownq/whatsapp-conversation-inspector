
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MessageSquare, ChevronRight, Trash2, Clock, Calendar, User, Brain, HeartIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ChatStats } from '@/utils/analyzeChat';

interface PastAnalysis {
  id: string;
  date: string;
  title: string;
  participantCount: number;
  messageCount: number;
  duration: number;
  startDate: string;
  endDate: string;
  mostManipulative: string;
  data: ChatStats;
}

interface PastAnalysesProps {
  onSelectAnalysis: (data: ChatStats) => void;
}

const PastAnalyses: React.FC<PastAnalysesProps> = ({ onSelectAnalysis }) => {
  const [analyses, setAnalyses] = useState<PastAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPastAnalyses();
  }, []);

  const loadPastAnalyses = () => {
    try {
      setLoading(true);
      
      // Load from localStorage
      const storedAnalyses = localStorage.getItem('whatsapp-analyses');
      if (storedAnalyses) {
        const parsedAnalyses = JSON.parse(storedAnalyses);
        setAnalyses(parsedAnalyses);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to load past analyses:', error);
      toast({
        title: 'Hata',
        description: 'Geçmiş analizler yüklenemedi',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    try {
      const updatedAnalyses = analyses.filter(a => a.id !== id);
      setAnalyses(updatedAnalyses);
      localStorage.setItem('whatsapp-analyses', JSON.stringify(updatedAnalyses));
      
      toast({
        title: 'Başarılı',
        description: 'Analiz silindi',
      });
    } catch (error) {
      console.error('Failed to delete analysis:', error);
      toast({
        title: 'Hata',
        description: 'Analiz silinemedi',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="bg-secondary/30 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
          <Clock className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">Henüz analiz yok</h3>
        <p className="text-muted-foreground">
          WhatsApp sohbet dosyası yükleyerek analizler oluşturabilirsiniz.
        </p>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-bold">Geçmiş Analizler</h2>
      
      <div className="grid gap-4">
        {analyses.map(analysis => (
          <motion.div 
            key={analysis.id}
            className="border border-border rounded-xl overflow-hidden bg-card shadow-sm hover:shadow-md transition-shadow"
            whileHover={{ y: -2 }}
          >
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium text-lg">{analysis.title}</h3>
                <div className="text-xs text-muted-foreground">
                  {formatDate(analysis.date)}
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
                  <Brain className="h-4 w-4 mr-2 text-primary/70" />
                  <span className="text-sm text-purple-500 font-medium truncate">{analysis.mostManipulative}</span>
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDelete(analysis.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Sil
                </Button>
                
                <Button
                  onClick={() => onSelectAnalysis(analysis.data)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  size="sm"
                >
                  <span>Görüntüle</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default PastAnalyses;
