
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import NotFound from '@/pages/NotFound';
import GizlilikPolitikasi from '@/pages/GizlilikPolitikasi';
import MesafeliSatis from '@/pages/MesafeliSatis';
import KVKKAydinlatma from '@/pages/KVKKAydinlatma';
import IadePolitikasi from '@/pages/IadePolitikasi';
import Rejected from '@/pages/Rejected';
import Pricing from '@/pages/Pricing';
import Payment from '@/pages/Payment';
import './App.css';

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/gizlilik-politikasi" element={<GizlilikPolitikasi />} />
            <Route path="/mesafeli-satis-sozlesmesi" element={<MesafeliSatis />} />
            <Route path="/kvkk-aydinlatma-metni" element={<KVKKAydinlatma />} />
            <Route path="/iade-politikasi" element={<IadePolitikasi />} />
            <Route path="/rejected" element={<Rejected />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}
