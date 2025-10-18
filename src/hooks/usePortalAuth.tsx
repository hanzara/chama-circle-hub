import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PortalUser {
  id: string;
  username: string;
  email?: string;
  access_level: 'admin' | 'member' | 'super_admin';
  organization?: string;
  session_token?: string;
}

export const usePortalAuth = () => {
  const [portalUser, setPortalUser] = useState<PortalUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticating, setAuthenticating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const session = localStorage.getItem('portal_session');
    if (session) {
      verifySession(session);
    } else {
      setLoading(false);
    }
  }, []);

  const verifySession = async (sessionToken: string) => {
    try {
      const { data, error } = await supabase.rpc('verify_portal_session', {
        p_session_token: sessionToken
      });

      if (error) throw error;

      const result = data as any;
      if (result?.success) {
        setPortalUser({
          id: result.user_id,
          username: result.username,
          access_level: result.access_level,
          organization: result.organization,
          session_token: sessionToken
        });
      } else {
        localStorage.removeItem('portal_session');
        toast({
          title: "Session Expired",
          description: "Please log in again",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Session verification error:', error);
      localStorage.removeItem('portal_session');
    } finally {
      setLoading(false);
    }
  };

  const authenticate = async (email: string, password: string) => {
    setAuthenticating(true);
    try {
      const { data, error } = await supabase.rpc('authenticate_portal_user_password', {
        p_email: email,
        p_password: password
      });

      if (error) throw error;

      const result = data as any;
      if (result?.success) {
        const user: PortalUser = {
          id: result.user_id,
          username: result.username,
          email: email,
          access_level: result.access_level,
          organization: result.organization,
          session_token: result.session_token
        };

        setPortalUser(user);
        localStorage.setItem('portal_session', result.session_token);

        toast({
          title: "Login Successful",
          description: `Welcome back, ${result.username}`,
        });

        return { success: true, user };
      } else {
        toast({
          title: "Authentication Failed",
          description: result?.message || "Invalid credentials",
          variant: "destructive",
        });
        return { success: false, message: result?.message };
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast({
        title: "Authentication Error",
        description: error.message || "Failed to authenticate",
        variant: "destructive",
      });
      return { success: false, message: error.message };
    } finally {
      setAuthenticating(false);
    }
  };

  const authenticateWithCode = async (username: string, code: string) => {
    setAuthenticating(true);
    try {
      const { data, error } = await supabase.rpc('authenticate_seller_with_code', {
        p_username: username,
        p_code: code.toUpperCase()
      });

      if (error) throw error;

      const result = data as any;
      if (result?.success) {
        const user: PortalUser = {
          id: result.user_id,
          username: result.username,
          access_level: result.access_level,
          organization: result.organization,
          session_token: result.session_token
        };

        setPortalUser(user);
        localStorage.setItem('portal_session', result.session_token);

        toast({
          title: "Login Successful",
          description: `Welcome, ${result.username}`,
        });

        return { success: true, user, requiresPasswordSetup: result.requires_password_setup };
      } else {
        toast({
          title: "Authentication Failed",
          description: result?.message || "Invalid code",
          variant: "destructive",
        });
        return { success: false, message: result?.message };
      }
    } catch (error: any) {
      console.error('Code authentication error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to authenticate",
        variant: "destructive",
      });
      return { success: false, message: error.message };
    } finally {
      setAuthenticating(false);
    }
  };

  const register = async (email: string, username: string, password: string, organization?: string) => {
    setAuthenticating(true);
    try {
      const { data, error } = await supabase.rpc('register_portal_user_with_password', {
        p_email: email,
        p_username: username,
        p_password: password,
        p_organization: organization || 'Default Organization',
        p_access_level: 'member'
      });

      if (error) throw error;

      const result = data as any;
      if (result?.success) {
        toast({
          title: "Registration Successful",
          description: "Account created successfully! You can now log in.",
          duration: 5000,
        });

        return { success: true };
      } else {
        toast({
          title: "Registration Failed",
          description: result?.message || "Failed to create account",
          variant: "destructive",
        });
        return { success: false, message: result?.message };
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
      return { success: false, message: error.message };
    } finally {
      setAuthenticating(false);
    }
  };

  const logout = () => {
    setPortalUser(null);
    localStorage.removeItem('portal_session');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  const isAdmin = () => {
    return portalUser?.access_level === 'admin' || portalUser?.access_level === 'super_admin';
  };

  const isSuperAdmin = () => {
    return portalUser?.access_level === 'super_admin';
  };

  return {
    portalUser,
    loading,
    authenticating,
    authenticate,
    authenticateWithCode,
    register,
    logout,
    isAdmin,
    isSuperAdmin,
    verifySession
  };
};