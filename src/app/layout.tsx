import type { Metadata } from 'next';
import { orbitron, poppins, montserrat } from '@/lib/fonts'; // Import montserrat
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { NavbarProvider } from "@/contexts/navbar-context";

export const metadata: Metadata = {
  title: 'RCEOM-TBI - Empowering Innovators',
  description: 'Join our ecosystem of visionaries, creators, and successful startups.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ position: 'relative' }} className={`${orbitron.variable} ${poppins.variable} ${montserrat.variable} font-poppins antialiased`}> {/* Add montserrat.variable */}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <NavbarProvider>
            {children}
          </NavbarProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
