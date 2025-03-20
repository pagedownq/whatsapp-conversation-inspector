
import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquareText } from 'lucide-react';

const Header = () => {
  return (
    <motion.header 
      className="flex items-center justify-center py-8 mb-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="flex items-center gap-3">
        <motion.div
          className="bg-primary/10 p-2.5 rounded-xl"
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        >
          <MessageSquareText className="h-6 w-6 text-primary" />
        </motion.div>
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-wider font-medium text-muted-foreground">WhatsApp</span>
          <h1 className="text-2xl font-display font-semibold tracking-tight">Analizer</h1>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
