import type { Metadata } from 'next';
import { orbitron, poppins, montserrat } from '@/lib/fonts'; // Import montserrat
import './globals.css';
import { Providers } from "@/components/providers";

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
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
