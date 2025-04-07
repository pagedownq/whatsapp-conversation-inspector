
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-8 border-t bg-gradient-to-b from-background to-secondary/10">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              MGverse &copy; {currentYear} - <a href="https://analizore.netlify.app/" className="hover:underline">analizore.netlify.app</a>
            </p>
            <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
              <span>Made with</span> 
              <Heart className="h-3 w-3 text-red-500 fill-red-500" /> 
              <span>in Türkiye</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Gizlilik Politikası
            </Link>
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault(); 
                localStorage.removeItem('cookie-consent');
                window.location.reload();
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Çerez Ayarları
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
