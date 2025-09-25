import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

interface UserRole {
  id: string;
  role: 'admin' | 'user';
  is_primary: boolean;
  created_at: string;
}

export const useUserRole = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setUserRole(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching user role:', error);
          setUserRole(null);
          setIsAdmin(false);
        } else if (data) {
          setUserRole(data as UserRole);
          setIsAdmin(data.role === 'admin');
        } else {
          // No role found, user is regular user
          setUserRole(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error in fetchUserRole:', error);
        setUserRole(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const setAdminRole = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: 'admin',
          is_primary: true
        });

      if (error) {
        console.error('Error setting admin role:', error);
        return false;
      }

      if (userId === user?.id) {
        setIsAdmin(true);
        // Refresh the role data
        const { data } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (data) {
          setUserRole(data as UserRole);
        }
      }

      return true;
    } catch (error) {
      console.error('Error in setAdminRole:', error);
      return false;
    }
  };

  return {
    userRole,
    isAdmin,
    loading,
    setAdminRole
  };
};