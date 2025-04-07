
import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquareText, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <motion.header 
      className="flex items-center justify-center py-8 mb-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <Link to="/" className="flex items-center gap-3">
        <motion.div
          className="bg-gradient-to-r from-primary/20 to-purple-500/20 p-3.5 rounded-2xl shadow-sm"
          whileHover={{ scale: 1.05, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        >
          <div className="relative">
            <MessageSquareText className="h-7 w-7 text-primary" />
            <motion.div
              className="absolute -top-1 -right-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <Sparkles className="h-3 w-3 text-amber-500" />
            </motion.div>
          </div>
        </motion.div>
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-wider font-medium bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">WhatsApp</span>
          <h1 className="text-3xl font-display font-bold tracking-tight bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">Analizer</h1>
        </div>
      </Link>
    </motion.header>
  );
};

export default Header;
