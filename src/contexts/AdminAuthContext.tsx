"use client";

import React, { useEffect, useState } from 'react';

interface AdminAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  ensureAuth: () => Promise<void>;
}

const AdminAuthContext = React.createContext<AdminAuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  ensureAuth: async () => {},
});

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const ensureAuth = async () => {
    // Simple implementation - just mark as authenticated
    // In a real admin panel, you'd check session storage, cookies, etc.
    setIsAuthenticated(true);
  };

  useEffect(() => {
    // Auto-authenticate on mount for admin panel
    const initAuth = async () => {
      await ensureAuth();
      setIsLoading(false);
    };

    initAuth();
  }, []);

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, isLoading, ensureAuth }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => {
  const context = React.useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};
