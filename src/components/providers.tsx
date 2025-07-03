"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { NavbarProvider } from "@/contexts/navbar-context";
import { UserProvider } from "@/contexts/user-context";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <UserProvider>
        <AuthProvider>
          <NavbarProvider>
            {children}
          </NavbarProvider>
        </AuthProvider>
      </UserProvider>
      <Toaster />
    </ThemeProvider>
  );
}
