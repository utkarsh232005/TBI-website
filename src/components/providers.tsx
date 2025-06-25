"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { NavbarProvider } from "@/contexts/navbar-context";
import { UserProvider } from "@/contexts/user-context";
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
        <NavbarProvider>
          {children}
        </NavbarProvider>
      </UserProvider>
      <Toaster />
    </ThemeProvider>
  );
}
