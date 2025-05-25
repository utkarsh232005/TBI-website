import type { Metadata } from 'next';
import { orbitron, poppins } from '@/lib/fonts';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider"; // Import ThemeProvider

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
      <body className={`${orbitron.variable} ${poppins.variable} font-poppins antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark" // You can set system, dark, or light as default
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
