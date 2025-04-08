
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Loader2, Mail, Lock, Eye, EyeOff, User, Google } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});

const registerSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
  confirmPassword: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
});

const Auth = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { refreshSubscription } = useAuth();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleLogin = async (values: z.infer<typeof loginSchema>) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) throw error;

      toast({
        title: 'Giriş başarılı',
        description: 'Hesabınıza giriş yaptınız',
      });

      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Giriş başarısız',
        description: error.message || 'Giriş yaparken bir hata oluştu',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (values: z.infer<typeof registerSchema>) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });

      if (error) throw error;

      toast({
        title: 'Kayıt başarılı',
        description: 'Hesabınız oluşturuldu. E-posta adresinize gönderilen doğrulama bağlantısına tıklayarak hesabınızı aktifleştirebilirsiniz.',
      });
      
      setActiveTab('login');
    } catch (error: any) {
      toast({
        title: 'Kayıt başarısız',
        description: error.message || 'Kayıt olurken bir hata oluştu',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: 'Google ile giriş başarısız',
        description: error.message || 'Google ile giriş yaparken bir hata oluştu',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Illustration area */}
      <div className="w-full md:w-1/2 bg-[#B2C9B9] flex flex-col items-center justify-center p-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto"
        >
          <div className="mb-10">
            <img 
              src="/lovable-uploads/47b396fa-29b7-411c-af5c-e875d53dfab1.png" 
              alt="Illustration" 
              className="w-full max-w-xs mx-auto rounded-lg shadow-xl"
            />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">WhatsApp Analizi</h2>
          <p className="text-lg text-white/90 mb-8">
            Sohbetlerinizi analiz ederek konuşmalarınızdaki duygu ve ilişki dinamiklerini keşfedin
          </p>
          <div className="flex justify-center space-x-2 mt-6">
            {[0, 1, 2, 3].map((i) => (
              <div 
                key={i} 
                className={`h-2 w-2 rounded-full bg-white ${i === 0 ? 'opacity-100' : 'opacity-50'}`}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right side - Auth form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Hoş Geldiniz</h1>
            <p className="text-muted-foreground">
              {activeTab === 'login' ? 'Hesabınıza giriş yapın' : 'Yeni hesap oluşturun'}
            </p>
          </div>

          {activeTab === 'login' ? (
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-5">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-posta</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="ornek@email.com" 
                            type="email"
                            disabled={isLoading}
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Şifre</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="******" 
                            type={showPassword ? "text" : "password"}
                            disabled={isLoading}
                            className="pl-10 pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-3"
                            onClick={togglePasswordVisibility}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-sm text-primary hover:underline"
                    onClick={() => alert('Şifre sıfırlama işlevi henüz aktif değil')}
                  >
                    Şifremi unuttum
                  </button>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full rounded-md py-6"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      Giriş Yapılıyor...
                    </>
                  ) : (
                    'Giriş Yap'
                  )}
                </Button>

                <div className="relative my-6">
                  <Separator />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-background px-2 text-xs text-muted-foreground">
                      veya
                    </span>
                  </div>
                </div>

                <Button 
                  type="button" 
                  variant="outline"
                  className="w-full rounded-md py-6"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  <Google className="mr-2 h-4 w-4" />
                  Google ile Giriş Yap
                </Button>

                <div className="text-center mt-6">
                  <p className="text-muted-foreground text-sm">
                    Henüz hesabınız yok mu?{' '}
                    <button
                      type="button"
                      className="text-primary font-medium hover:underline"
                      onClick={() => setActiveTab('register')}
                    >
                      Kayıt Ol
                    </button>
                  </p>
                </div>
              </form>
            </Form>
          ) : (
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-5">
                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-posta</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="ornek@email.com" 
                            type="email"
                            disabled={isLoading}
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Şifre</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="******" 
                            type={showPassword ? "text" : "password"}
                            disabled={isLoading}
                            className="pl-10 pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-3"
                            onClick={togglePasswordVisibility}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Şifre Tekrar</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="******" 
                            type={showConfirmPassword ? "text" : "password"}
                            disabled={isLoading}
                            className="pl-10 pr-10"
                            {...field}
                          />
                          <button
                            type="button" 
                            className="absolute right-3 top-3"
                            onClick={toggleConfirmPasswordVisibility}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full rounded-md py-6"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      Kayıt Yapılıyor...
                    </>
                  ) : (
                    'Kayıt Ol'
                  )}
                </Button>

                <div className="text-center mt-6">
                  <p className="text-muted-foreground text-sm">
                    Zaten bir hesabınız var mı?{' '}
                    <button
                      type="button"
                      className="text-primary font-medium hover:underline"
                      onClick={() => setActiveTab('login')}
                    >
                      Giriş Yap
                    </button>
                  </p>
                </div>
              </form>
            </Form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
