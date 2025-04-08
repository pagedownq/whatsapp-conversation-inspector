
import React from 'react';
import { motion } from 'framer-motion';
import { FileUp, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const EmptyState = ({ onUploadClick }: { onUploadClick: () => void }) => {
  const { user, subscription } = useAuth();
  const navigate = useNavigate();
  
  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-16 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      <motion.div 
        className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6"
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      >
        <FileUp className="h-10 w-10 text-muted-foreground" />
      </motion.div>
      
      <motion.h2 
        className="text-2xl font-display font-medium mb-2 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        Yüklemeye Başla
      </motion.h2>
      
      <motion.p 
        className="text-muted-foreground text-center max-w-md mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        WhatsApp sohbet dışa aktarım dosyanızı (.txt veya .zip) yükleyin. Verileriniz sadece tarayıcınızda işlenir ve hiçbir yere gönderilmez.
      </motion.p>
      
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <motion.button
          className="bg-primary text-primary-foreground rounded-full px-6 py-3 font-medium shadow-soft hover:shadow-lg btn-transition"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={onUploadClick}
        >
          Dosya Seç
        </motion.button>

        {!user ? (
          <Button 
            variant="outline" 
            onClick={() => navigate('/auth')}
            className="flex items-center gap-2 rounded-full"
          >
            Giriş Yap
          </Button>
        ) : (
          subscription?.isActive ? (
            <div className="flex items-center gap-2">
              <Badge variant="premium">
                <Crown className="h-3 w-3 mr-1 text-amber-800" /> Premium
              </Badge>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => navigate('/premium')}
              className="rounded-full bg-gradient-to-r from-amber-200/20 to-amber-500/20 text-purple-800 border-amber-300/50 hover:bg-amber-200/30 hover:text-purple-900"
            >
              <Crown className="h-4 w-4 mr-1 text-amber-500" />
              Premium Özellikler
            </Button>
          )
        )}
      </div>
    </motion.div>
  );
};

export default EmptyState;
