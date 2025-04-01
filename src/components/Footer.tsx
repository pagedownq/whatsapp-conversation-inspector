
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-6 border-t">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              WhatsApp Analyzer &copy; {currentYear} - <a href="https://whatsapp-conversation-inspector.lovable.app" className="hover:underline">https://whatsapp-conversation-inspector.lovable.app</a>
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
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
