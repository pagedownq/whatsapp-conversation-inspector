import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
const PremiumFeatures = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  return <>
      <div className="flex justify-center mt-4 mb-6 px-4">
        <motion.button onClick={() => navigate('/pricing')} className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-amber-200/30 to-amber-500/30 text-purple-800 border border-amber-300/50 hover:bg-amber-200/40 transition-all shadow-soft hover:shadow-lg" whileHover={{
        scale: 1.03
      }} whileTap={{
        scale: 0.98
      }}>
          <Crown className="h-5 w-5 text-amber-500" />
          <span className="font-medium">Premium Özellikler</span>
          <div className="relative ml-1">
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
          </div>
        </motion.button>
      </div>


    </>;
};
export default PremiumFeatures;