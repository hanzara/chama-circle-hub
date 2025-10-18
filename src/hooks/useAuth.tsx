
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, testSupabaseConnection } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  supabaseConnected: boolean;
  isAdmin: boolean;
  pinVerified: boolean;
  hasPinSetup: boolean | null;
  setPinVerified: (verified: boolean) => void;
  checkPinStatus: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string, additionalData?: any) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabaseConnected, setSupabaseConnected] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pinVerified, setPinVerified] = useState(false);
  const [hasPinSetup, setHasPinSetup] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Test connection quickly
        const { connected } = await testSupabaseConnection();
        if (mounted) {
          setSupabaseConnected(connected);
        }

        // Get initial session immediately
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (mounted && !error) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log('Auth state change:', event, session?.user?.email);
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Handle profile creation and role check after successful sign up or sign in
      if (event === 'SIGNED_IN' && session?.user) {
        // Reset PIN verification on every sign-in for security
        setPinVerified(false);
        
        setTimeout(async () => {
          try {
            // Create or update basic profile
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert({
                user_id: session.user.id,
                username: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || '',
                updated_at: new Date().toISOString(),
              }, {
                onConflict: 'user_id'
              });

            if (profileError && profileError.code !== '23505') {
              console.error('Profile update error:', profileError);
            }

            // Create or update enhanced profile for OAuth users
            const { error: enhancedError } = await supabase
              .from('user_profiles_enhanced')
              .upsert({
                user_id: session.user.id,
                full_name: session.user.user_metadata.full_name || session.user.user_metadata.name || '',
                email: session.user.email || '',
                phone: session.user.user_metadata.phone || null,
                user_category: 'individual',
                kyc_status: 'pending',
                updated_at: new Date().toISOString(),
              }, {
                onConflict: 'user_id'
              });

            if (enhancedError && enhancedError.code !== '23505') {
              console.error('Enhanced profile update error:', enhancedError);
            }

            // Check user role
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', session.user.id)
              .maybeSingle();

            if (roleData) {
              setIsAdmin(roleData.role === 'admin');
            }
          } catch (err) {
            console.error('Profile update failed:', err);
          }
        }, 0);
      }

      // Check PIN status on sign in
      if (event === 'SIGNED_IN' && session?.user) {
        setTimeout(() => {
          checkPinStatus();
        }, 100);
      }

      // Clear admin status and PIN verification on sign out
      if (event === 'SIGNED_OUT') {
        setIsAdmin(false);
        setPinVerified(false);
        setHasPinSetup(null);
      }
    });

    // Initialize auth
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string, additionalData?: any) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: additionalData?.phone || null,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error('Signup failed: No user data returned');
      }

      // Create enhanced profile immediately after signup
      try {
        const { error: profileError } = await supabase
          .from('user_profiles_enhanced')
          .insert({
            user_id: data.user.id,
            full_name: fullName,
            email: email,
            phone: additionalData?.phone || null,
            location: additionalData?.location || null,
            user_category: additionalData?.userCategory || 'individual',
            business_name: additionalData?.businessName || null,
            institution_name: additionalData?.institutionName || null,
            kyc_status: 'pending',
          });

        if (profileError && profileError.code !== '23505') {
          console.error('Profile creation error:', profileError);
        }
      } catch (profileErr) {
        console.error('Profile creation failed:', profileErr);
      }

      // Check if email confirmation is required
      if (data.session) {
        toast({
          title: "Account created!",
          description: "Welcome! You're now signed in.",
        });
      } else {
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link. Please check your email to verify your account.",
          duration: 7000,
        });
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      const errorMessage = error.message?.includes('already registered') 
        ? 'This email is already registered. Please sign in instead.'
        : error.message || 'Failed to create account. Please try again.';
      
      toast({
        title: "Sign Up Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      });
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const checkPinStatus = async () => {
    if (!user) {
      setHasPinSetup(null);
      return;
    }

    try {
      // Check legacy PIN table first
      const { data: legacyData, error: legacyError } = await supabase
        .from('user_pins')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (legacyError && legacyError.code !== 'PGRST116') {
        console.error('Error checking legacy PIN status:', legacyError);
        setHasPinSetup(null);
        return;
      }

      if (legacyData) {
        setHasPinSetup(true);
        return;
      }

      // Fallback to enhanced PIN table
      const { data: enhancedData, error: enhancedError } = await supabase
        .from('user_pins_enhanced')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (enhancedError && enhancedError.code !== 'PGRST116') {
        console.error('Error checking enhanced PIN status:', enhancedError);
        setHasPinSetup(null);
        return;
      }

      setHasPinSetup(!!enhancedData);
    } catch (error) {
      console.error('Error checking PIN status:', error);
      setHasPinSetup(null);
    }
  };

  const value = {
    user,
    session,
    loading,
    supabaseConnected,
    isAdmin,
    pinVerified,
    hasPinSetup,
    setPinVerified,
    checkPinStatus,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
