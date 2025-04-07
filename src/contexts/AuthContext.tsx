
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

// Define TypeScript types for Supabase tables
type Subscription = {
  is_active: boolean;
  subscription_type: string;
  expires_at: string | null;
};

type SubscriptionStatus = {
  isActive: boolean;
  subscriptionType: string | null;
  expiresAt: string | null;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  subscription: SubscriptionStatus | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  loadingSubscription: boolean;
  refreshSubscription: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  subscription: null,
  isLoading: true,
  signOut: async () => {},
  loadingSubscription: false,
  refreshSubscription: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(false);

  const fetchSubscription = async (userId: string) => {
    try {
      setLoadingSubscription(true);
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setSubscription({
          isActive: data.is_active,
          subscriptionType: data.subscription_type,
          expiresAt: data.expires_at,
        });
      } else {
        setSubscription(null);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setSubscription(null);
    } finally {
      setLoadingSubscription(false);
    }
  };

  const refreshSubscription = async () => {
    if (user?.id) {
      await fetchSubscription(user.id);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          // Use setTimeout to avoid potential deadlock
          setTimeout(() => {
            fetchSubscription(newSession.user.id);
          }, 0);
        } else {
          setSubscription(null);
        }
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        setSession(existingSession);
        setUser(existingSession?.user ?? null);

        if (existingSession?.user) {
          await fetchSubscription(existingSession.user.id);
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      authSubscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    session,
    user,
    subscription,
    isLoading,
    signOut,
    loadingSubscription,
    refreshSubscription,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
