import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from './useAuth';

interface UseInactivityTimeoutProps {
  timeoutMinutes?: number;
  onTimeout?: () => void;
}

export const useInactivityTimeout = ({ 
  timeoutMinutes = 5,
  onTimeout 
}: UseInactivityTimeoutProps = {}) => {
  const { user, pinVerified, setPinVerified } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimeout = useCallback(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only set timeout if user is logged in and PIN is verified
    if (!user || !pinVerified) {
      return;
    }

    // Update last activity time
    lastActivityRef.current = Date.now();

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      console.log('Inactivity timeout - requiring PIN verification');
      setPinVerified(false);
      if (onTimeout) {
        onTimeout();
      }
    }, timeoutMinutes * 60 * 1000); // Convert minutes to milliseconds
  }, [timeoutMinutes, onTimeout]);

  const handleActivity = useCallback(() => {
    // Only track activity if user is logged in and PIN is verified
    if (!user || !pinVerified) {
      return;
    }

    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;

    // Only reset if more than 10 seconds have passed (prevent too frequent resets)
    if (timeSinceLastActivity > 10000) {
      resetTimeout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Start timeout when user logs in or PIN is verified
    if (user && pinVerified) {
      resetTimeout();
    }

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, pinVerified]);

  useEffect(() => {
    // Activity detection events
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    resetTimeout,
  };
};
