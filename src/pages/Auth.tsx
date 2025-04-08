
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Loader2, Mail, Lock, User, ArrowLeft } from 'lucide-react';
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

const formVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: {
      duration: 0.3,
      ease: "easeIn",
    }
  }
};

const inputVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
    }
  }),
};

const Auth = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 bg-gradient-to-br from-background to-secondary/30">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.6,
          ease: [0.22, 1, 0.36, 1]
        }}
        className="w-full max-w-md"
      >
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri Dön
        </Button>

        <Card className="shadow-lg border-t-4 border-t-primary overflow-hidden backdrop-blur-sm bg-background/95">
          <CardHeader className="space-y-1">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <CardTitle className="text-2xl font-bold text-center">
                {activeTab === 'login' ? 'Giriş Yap' : 'Hesap Oluştur'}
              </CardTitle>
              <CardDescription className="text-center">
                {activeTab === 'login' 
                  ? 'Premium özellikleri kullanmak için giriş yapın' 
                  : 'Yeni bir hesap oluşturun'}
              </CardDescription>
            </motion.div>
          </CardHeader>
          
          <Tabs 
            value={activeTab} 
            onValueChange={(v) => setActiveTab(v as 'login' | 'register')}
            className="relative"
          >
            <TabsList className="grid grid-cols-2 mx-4 relative z-10">
              <TabsTrigger 
                value="login"
                className="data-[state=active]:animate-pulse-slow transition-all duration-300"
              >
                Giriş
              </TabsTrigger>
              <TabsTrigger 
                value="register"
                className="data-[state=active]:animate-pulse-slow transition-all duration-300"
              >
                Kayıt
              </TabsTrigger>
            </TabsList>
            
            <AnimatePresence mode="wait">
              <TabsContent value="login" className="mt-4 overflow-hidden">
                <motion.div
                  key="login-form"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(handleLogin)}>
                      <CardContent className="space-y-4 pt-4">
                        <motion.div
                          variants={inputVariants}
                          initial="hidden"
                          animate="visible"
                          custom={0}
                        >
                          <FormField
                            control={loginForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem className="space-y-1">
                                <FormLabel className="flex items-center gap-2">
                                  <Mail className="h-4 w-4" /> E-posta
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="ornek@email.com" 
                                    type="email"
                                    disabled={isLoading}
                                    className="transition-all duration-300 focus:ring-2 focus:ring-primary/50"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                        
                        <motion.div
                          variants={inputVariants}
                          initial="hidden"
                          animate="visible"
                          custom={1}
                        >
                          <FormField
                            control={loginForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem className="space-y-1">
                                <FormLabel className="flex items-center gap-2">
                                  <Lock className="h-4 w-4" /> Şifre
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="******" 
                                    type="password"
                                    disabled={isLoading}
                                    className="transition-all duration-300 focus:ring-2 focus:ring-primary/50"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                      </CardContent>
                      
                      <CardFooter>
                        <motion.div
                          className="w-full"
                          variants={inputVariants}
                          initial="hidden"
                          animate="visible"
                          custom={2}
                        >
                          <Button 
                            type="submit" 
                            className="w-full relative overflow-hidden btn-transition group"
                            disabled={isLoading}
                          >
                            <span className="absolute inset-0 bg-primary/10 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                            {isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                                Giriş Yapılıyor...
                              </>
                            ) : (
                              'Giriş Yap'
                            )}
                          </Button>
                        </motion.div>
                      </CardFooter>
                    </form>
                  </Form>
                </motion.div>
              </TabsContent>
              
              <TabsContent value="register" className="mt-4 overflow-hidden">
                <motion.div
                  key="register-form"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(handleRegister)}>
                      <CardContent className="space-y-4 pt-4">
                        <motion.div
                          variants={inputVariants}
                          initial="hidden"
                          animate="visible"
                          custom={0}
                        >
                          <FormField
                            control={registerForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem className="space-y-1">
                                <FormLabel className="flex items-center gap-2">
                                  <Mail className="h-4 w-4" /> E-posta
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="ornek@email.com" 
                                    type="email"
                                    disabled={isLoading}
                                    className="transition-all duration-300 focus:ring-2 focus:ring-primary/50"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                        
                        <motion.div
                          variants={inputVariants}
                          initial="hidden"
                          animate="visible"
                          custom={1}
                        >
                          <FormField
                            control={registerForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem className="space-y-1">
                                <FormLabel className="flex items-center gap-2">
                                  <Lock className="h-4 w-4" /> Şifre
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="******" 
                                    type="password"
                                    disabled={isLoading}
                                    className="transition-all duration-300 focus:ring-2 focus:ring-primary/50"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                        
                        <motion.div
                          variants={inputVariants}
                          initial="hidden"
                          animate="visible"
                          custom={2}
                        >
                          <FormField
                            control={registerForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem className="space-y-1">
                                <FormLabel className="flex items-center gap-2">
                                  <Lock className="h-4 w-4" /> Şifre Tekrar
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="******" 
                                    type="password"
                                    disabled={isLoading}
                                    className="transition-all duration-300 focus:ring-2 focus:ring-primary/50"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                      </CardContent>
                      
                      <CardFooter>
                        <motion.div
                          className="w-full"
                          variants={inputVariants}
                          initial="hidden"
                          animate="visible"
                          custom={3}
                        >
                          <Button 
                            type="submit" 
                            className="w-full relative overflow-hidden btn-transition group"
                            disabled={isLoading}
                          >
                            <span className="absolute inset-0 bg-primary/10 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                            {isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                                Kayıt Yapılıyor...
                              </>
                            ) : (
                              'Kayıt Ol'
                            )}
                          </Button>
                        </motion.div>
                      </CardFooter>
                    </form>
                  </Form>
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
