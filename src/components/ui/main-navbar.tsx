
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
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ThemeToggleButton } from "@/components/ui/theme-toggle-button";

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

  const actionNavItems = [
    { name: 'Login', link: '/login', isButton: false },
    // Apply button is removed
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <Navbar>
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
              className="relative px-3 py-2 text-gray-300 hover:text-white transition-colors duration-200"
            >
              {hoveredItem === item.name && (
                <motion.div
                  layoutId={`hovered-nav-${item.name}`}
                  className="absolute inset-0 h-full w-full rounded-full bg-purple-500/20"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-20">{item.name}</span>
            </Link>
          ))}
        </div>

        {/* Action Items (Login, Theme Toggle) - Right Aligned */}
        <div className="flex items-center gap-2">
          {actionNavItems.map((item) => (
            item.link ? (
              <Link
                href={item.link}
                key={`action-${item.name}`}
                onMouseEnter={() => setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={closeMobileMenu}
                className="relative px-3 py-2 text-gray-300 hover:text-white transition-colors duration-200 text-sm font-normal"
              >
                {hoveredItem === item.name && (
                  <motion.div
                    layoutId={`hovered-action-${item.name}`}
                    className="absolute inset-0 h-full w-full rounded-full bg-purple-500/20"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-20">{item.name}</span>
              </Link>
            ) : null
          ))}
          {mounted && <ThemeToggleButton />}
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
              className="block py-2 text-lg text-gray-300 hover:text-white"
            >
              {item.name}
            </Link>
          ))}
          <div className="flex w-full flex-col gap-4 pt-4 border-t border-purple-500/30 mt-4">
            {actionNavItems.map((item) => item.link && (
              <NavbarButton
                key={`mobile-action-${item.name}`}
                as="a"
                href={item.link}
                onClick={closeMobileMenu}
                variant="outline" // Keeps it distinct
                className="w-full hover:border-purple-400 hover:text-white border-purple-500/50 text-gray-300"
              >
                {item.name}
              </NavbarButton>
            ))}
            <div className="flex justify-center pt-2">
              {mounted && <ThemeToggleButton />}
            </div>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
