import { Orbitron, Poppins } from 'next/font/google';

export const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  weight: ['400', '700'], // Specify weights you'll use
});

export const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['300', '400', '500', '600', '700'], // Specify weights
});
