"use client";

import {
  Navbar,
  NavBody,
  MobileNav,
  NavbarLogo,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
  NavbarButton, // Keep this for mobile
} from "@/components/ui/resizable-navbar";
import { useState, useEffect } // Add useEffect for client-side checks
  from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ThemeToggleButton } from "@/components/ui/theme-toggle-button"; // Import the toggle button

interface MainNavbarProps {
  onApplyClick?: () => void;
}

export default function MainNavbar({ onApplyClick }: MainNavbarProps) {
  const mainNavLinks = [
    { name: 'About Us', link: '/#about' },
    { name: 'Startups', link: '/#startups' },
    { name: 'Program', link: '/#program' },
    { name: 'Events', link: '/events' },
    { name: 'Mentors', link: '/mentors' },
  ];

  // "Login" is now an action item on the right
  const actionNavItems = [
    { name: 'Login', link: '/login', isButton: false },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false); // For client-side rendering of toggle

  useEffect(() => {
    setMounted(true);
  }, []);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <Navbar>
      {/* Desktop Navigation */}
      <NavBody>
        <NavbarLogo />

        {/* Main Navigation Links - Centered */}
        <div className="flex-1 flex justify-center items-center space-x-1 text-sm font-normal transition duration-200 lg:space-x-2">
          {mainNavLinks.map((item) => (
            <Link
              href={item.link}
              key={`nav-${item.name}`}
              onMouseEnter={() => setHoveredItem(item.name)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={closeMobileMenu}
              className="relative px-3 py-2 text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              {hoveredItem === item.name && (
                <motion.div
                  layoutId={`hovered-nav-${item.name}`}
                  className="absolute inset-0 h-full w-full rounded-full bg-muted/30"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-20">{item.name}</span>
            </Link>
          ))}
        </div>
        
        {/* Action Items (Login, Theme Toggle) - Right Aligned */}
        <div className="flex items-center gap-2">
          {actionNavItems.map((item) => ( // This renders the "Login" link
            item.link ? (
              <Link
                href={item.link}
                key={`action-${item.name}`}
                onMouseEnter={() => setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={closeMobileMenu}
                className="relative px-3 py-2 text-muted-foreground hover:text-primary transition-colors duration-200 text-sm font-normal" // Matched style
              >
                {hoveredItem === item.name && (
                  <motion.div
                    layoutId={`hovered-action-${item.name}`} // Unique layoutId
                    className="absolute inset-0 h-full w-full rounded-full bg-muted/30"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-20">{item.name}</span>
              </Link>
            ) : null
          ))}
          {mounted && <ThemeToggleButton />} {/* Render toggle button only on client */}
        </div>
      </NavBody>

      {/* Mobile Navigation */}
      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <MobileNavToggle
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </MobileNavHeader>

        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          onClose={closeMobileMenu}
        >
          {mainNavLinks.map((item, idx) => ( 
            <Link
              key={`mobile-link-${idx}`}
              href={item.link}
              onClick={closeMobileMenu}
              className="block py-2 text-lg text-foreground hover:text-primary"
            >
              {item.name}
            </Link>
          ))}
          <div className="flex w-full flex-col gap-4 pt-4 border-t border-border mt-4">
            {actionNavItems.map((item) => item.link && ( // Renders "Login" for mobile
              <NavbarButton
                key={`mobile-action-${item.name}`}
                as="a" 
                href={item.link}
                onClick={closeMobileMenu}
                variant="outline"
                className="w-full"
              >
                {item.name}
              </NavbarButton>
            ))}
             {/* Add Theme Toggle to Mobile Menu if desired, might need specific styling */}
            <div className="flex justify-center pt-2">
               {mounted && <ThemeToggleButton />}
            </div>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
