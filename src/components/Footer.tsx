
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
              MGverse &copy; {currentYear}
            </p>
            <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
              <span>Made with</span> 
              <Heart className="h-3 w-3 text-red-500 fill-red-500" /> 
              <span>in Türkiye</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-center sm:text-left">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Yasal</h3>
              <div className="flex flex-col space-y-2">
                <Link to="/gizlilik-politikasi" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Gizlilik Politikası
                </Link>
                <Link to="/kvkk-aydinlatma" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  KVKK Aydınlatma Metni
                </Link>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Sözleşmeler</h3>
              <div className="flex flex-col space-y-2">
                <Link to="/mesafeli-satis" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Mesafeli Satış Sözleşmesi
                </Link>
                <Link to="/iade-politikasi" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  İade Politikası
                </Link>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Tercihler</h3>
              <div className="flex flex-col space-y-2">
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
        </div>
      </div>
    </footer>
  );
};

export default Footer;
