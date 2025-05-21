
// This file is no longer used as the primary navbar.
// It is replaced by resizable-navbar.tsx and main-navbar.tsx.
// You can choose to delete this file if it's no longer needed elsewhere.

import Link from 'next/link';
import { InnoNexusLogo } from '@/components/icons/innnexus-logo';
import { Button } from '@/components/ui/button';
import { Menu, LogIn } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const navLinks = [
  { href: '#about', label: 'About Us' },
  { href: '#startups', label: 'Startups' },
  { href: '#program', label: 'Program' },
  { href: '#testimonials', label: 'Testimonials' },
  { href: '#contact', label: 'Apply' },
];

export default function OldNavbar() { // Renamed to OldNavbar to avoid conflicts if needed temporarily
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
              prefetch={false}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="hidden md:inline-flex">
            <Link href="/login">
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Link>
          </Button>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[240px] sm:w-[300px] p-6">
                <SheetHeader className="mb-6 text-left">
                   <SheetTitle>
                    <Link href="/" prefetch={false} aria-label="InnoNexus Home">
                      <InnoNexusLogo className="h-8 w-auto" />
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-lg transition-colors hover:text-primary"
                      prefetch={false}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Link
                      href="/login"
                      className="text-lg transition-colors hover:text-primary flex items-center"
                      prefetch={false}
                    >
                      <LogIn className="mr-2 h-5 w-5" />
                      Login
                    </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
