import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useUserPin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const setPin = async (pin: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to set a PIN",
        variant: "destructive",
      });
      return false;
    }

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      toast({
        title: "Error",
        description: "PIN must be exactly 4 digits",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      console.log('Setting PIN for user:', user.id);
      
      const { data, error } = await supabase.rpc('set_user_pin', {
        p_user_id: user.id,
        p_pin: pin
      });

      console.log('Set PIN response:', { data, error });

      if (error) throw error;

      const result = data as { success: boolean; message: string };
      
      if (result.success) {
        toast({
          title: "Success",
          description: "PIN set successfully",
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      console.error('Error setting PIN:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to set PIN",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPin = async (pin: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to verify PIN",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('verify_user_pin_v2', {
        p_user_id: user.id,
        p_pin: pin
      });

      if (error) {
        console.error('PIN verification RPC error:', error);
        throw error;
      }

      console.log('PIN verification result:', data);
      
      if (!data) {
        toast({
          title: "Invalid PIN",
          description: "The PIN you entered is incorrect",
          variant: "destructive",
        });
      }

      return data as boolean;
    } catch (error: any) {
      console.error('Error verifying PIN:', error);
      toast({
        title: "Verification Error",
        description: error.message || "Failed to verify PIN. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    setPin,
    verifyPin,
    isLoading
  };
};