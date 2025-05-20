
import Link from 'next/link';
import { InnoNexusLogo } from '@/components/icons/innnexus-logo';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react'; // For mobile menu icon
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'; // For mobile drawer

const navLinks = [
  { href: '#about', label: 'About Us' },
  { href: '#startups', label: 'Startups' },
  { href: '#program', label: 'Program' },
  { href: '#testimonials', label: 'Testimonials' },
  { href: '#contact', label: 'Apply' },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2" aria-label="InnoNexus Home" prefetch={false}>
          <InnoNexusLogo className="h-8 w-auto" />
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-primary"
              prefetch={false} // Disable prefetching
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[240px] sm:w-[300px] p-6">
              <div className="flex flex-col space-y-4">
                <Link href="/" className="mb-4" prefetch={false}>
                  <InnoNexusLogo className="h-8 w-auto" />
                </Link>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-lg transition-colors hover:text-primary"
                    prefetch={false} // Disable prefetching for mobile links too
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
