import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
<<<<<<< HEAD
import { ThemeProvider } from "@/components/theme-provider"; // Import ThemeProvider
=======
>>>>>>> c8f9f0a (Saving local changes before pull)

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
<<<<<<< HEAD
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
=======
    <html lang="en" className="dark">
      <body className="antialiased relative min-h-screen font-poppins">
        {children}
        <Toaster />
>>>>>>> c8f9f0a (Saving local changes before pull)
      </body>
    </html>
  );
}
