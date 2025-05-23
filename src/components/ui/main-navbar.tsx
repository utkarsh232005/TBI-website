
"use client";
import {
  Navbar,
  NavBody,
  MobileNav,
  NavbarLogo,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
  NavbarButton,
} from "@/components/ui/resizable-navbar";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

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

  // "Apply" is removed from actionNavItems
  const actionNavItems = [
    { name: 'Login', link: '/login', isButton: false },
  ];


  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // The handleApplyNavItemClick function is no longer needed here as "Apply" is removed.
  // If onApplyClick was used for other purposes, that logic would need reassessment.
  // For now, assuming it was solely for the "Apply" button.

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
        
        {/* Action Buttons (Login) - Right Aligned */}
        <div className="flex items-center gap-2">
          {actionNavItems.map((item) => (
            item.link ? ( // This handles Login
              <Link
                href={item.link}
                key={`action-${item.name}`}
                onMouseEnter={() => setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={closeMobileMenu}
                className="relative px-3 py-2 text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                {hoveredItem === item.name && (
                  <motion.div
                    layoutId={`hovered-action-${item.name}`}
                    className="absolute inset-0 h-full w-full rounded-full bg-muted/30"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-20">{item.name}</span>
              </Link>
            ) : item.isButton && item.action ? ( // This part was for "Apply", now effectively unused due to actionNavItems change
                 <button
                    key={`action-${item.name}`}
                    onClick={item.action}
                    onMouseEnter={() => setHoveredItem(item.name)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className="relative px-3 py-2 text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {hoveredItem === item.name && (
                      <motion.div
                        layoutId={`hovered-action-button-${item.name}`} 
                        className="absolute inset-0 h-full w-full rounded-full bg-muted/30"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <span className="relative z-20">{item.name}</span>
                  </button>
            ) : null
          ))}
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
          {/* "Apply" button removed from mobile menu */}
          <div className="flex w-full flex-col gap-4 pt-4 border-t border-border mt-4">
            <NavbarButton
              as="a" 
              href="/login"
              onClick={closeMobileMenu}
              variant="outline"
              className="w-full"
            >
              Login
            </NavbarButton>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
