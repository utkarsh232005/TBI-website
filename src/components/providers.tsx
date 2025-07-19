"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { NavbarProvider } from "@/contexts/navbar-context";
import { UserProvider } from "@/contexts/user-context";
import { AuthProvider } from "@/contexts/AuthContext";
import { SessionProvider } from "@/components/session-provider";
import { Toaster } from "@/components/ui/toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <UserProvider>
        <AuthProvider>
          <SessionProvider>
            <NavbarProvider>
              {children}
            </NavbarProvider>
          </SessionProvider>
        </AuthProvider>
      </UserProvider>
      <Toaster />
    </ThemeProvider>
  );
}
