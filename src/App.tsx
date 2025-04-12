
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Rejected from "./pages/Rejected";

import Pricing from "./pages/Pricing";
import MesafeliSatis from "./pages/MesafeliSatis";
import KVKKAydinlatma from "./pages/KVKKAydinlatma";
import IadePolitikasi from "./pages/IadePolitikasi";
import GizlilikPolitikasi from "./pages/GizlilikPolitikasi";
import "./App.css";

// Create a new QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner position="bottom-right" closeButton />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
          
            <Route path="/rejected" element={<Rejected />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/mesafeli-satis" element={<MesafeliSatis />} />
            <Route path="/kvkk-aydinlatma" element={<KVKKAydinlatma />} />
            <Route path="/iade-politikasi" element={<IadePolitikasi />} />
            <Route path="/gizlilik-politikasi" element={<GizlilikPolitikasi />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
