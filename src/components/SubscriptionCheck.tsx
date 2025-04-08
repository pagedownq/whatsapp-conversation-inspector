
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Lock, Crown } from 'lucide-react';

type SubscriptionCheckProps = {
  children: React.ReactNode;
};

const SubscriptionCheck: React.FC<SubscriptionCheckProps> = ({ children }) => {
  const { user, subscription } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-[300px] p-6 text-center"
      >
        <Lock className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Premium Özellik</h2>
        <p className="text-muted-foreground mb-6">
          Bu özelliği kullanmak için giriş yapmanız gerekmektedir.
        </p>
        <Button onClick={() => navigate('/auth')}>Giriş Yap / Kayıt Ol</Button>
      </motion.div>
    );
  }

  if (!subscription?.isActive) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-[300px] p-6 text-center"
      >
        <div className="relative mb-4">
          <div className="absolute inset-0 gold-shimmer rounded-full"></div>
          <Crown className="h-14 w-14 text-purple-800 relative z-10" />
        </div>
        <h2 className="text-xl font-semibold mb-2 text-purple-800">Premium Abonelik Gerekli</h2>
        <p className="text-muted-foreground mb-6">
          Bu özelliği kullanmak için premium aboneliğe sahip olmanız gerekmektedir.
        </p>
        <Button 
          onClick={() => navigate('/pricing')}
          className="premium-button"
        >
          <Crown className="h-4 w-4 mr-2 text-amber-500" />
          Abonelik Al
        </Button>
      </motion.div>
    );
  }

  return <>{children}</>;
};

export default SubscriptionCheck;
