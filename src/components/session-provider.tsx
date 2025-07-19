"use client";

import React, { useEffect } from 'react';

interface SessionProviderProps {
  children: React.ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  useEffect(() => {
    // Initialize session manager when component mounts
    if (typeof window !== 'undefined') {
      console.log('🔐 Session Manager initializing...');
      
      // Dynamically import and initialize session manager
      const initializeSessionManager = async () => {
        try {
          const { sessionManager } = await import('@/lib/session-manager');
          
          if (sessionManager) {
            console.log('🔐 Session Manager initialized successfully');
            await sessionManager.forceTokenRefresh();
          }
        } catch (error) {
          console.log('No active session to refresh on page load:', error);
        }
      };
      
      initializeSessionManager();
    }

    // Cleanup on unmount
    return () => {
      // Import and cleanup session manager
      if (typeof window !== 'undefined') {
        import('@/lib/session-manager').then(({ sessionManager }) => {
          if (sessionManager) {
            sessionManager.cleanup();
          }
        }).catch(() => {
          // Ignore cleanup errors
        });
      }
    };
  }, []);

  return <>{children}</>;
}
