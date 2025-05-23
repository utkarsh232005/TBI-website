
"use client";
import {
  Navbar,
  NavBody,
  MobileNav,
  NavbarLogo,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
  NavbarButton, // Added back for mobile login
} from "@/components/ui/resizable-navbar";
import { useState }
 from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MainNavbarProps {
  onApplyClick?: () => void;
}

export default function MainNavbar({ onApplyClick }: MainNavbarProps) {
  const mainNavLinks = [
    { name: 'About Us', link: '/#about' },
    { name: 'Startups', link: '/#startups' },
    { name: 'Program', link: '/#program' },
    { name: 'Events', link: '/events' }, // Changed Testimonials to Events
    { name: 'Mentors', link: '/mentors' },
  ];

  const actionNavItems = [
    { name: 'Apply', action: onApplyClick, isButton: true },
    { name: 'Login', link: '/login', isButton: false },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleApplyNavItemClick = () => {
    closeMobileMenu();
    if (onApplyClick) {
      onApplyClick();
    } else {
      const campusStatusFromStorage = typeof window !== "undefined" ? localStorage.getItem('applicantCampusStatus') as "campus" | "off-campus" | null : null;
      if (campusStatusFromStorage === "off-campus") {
        window.location.href = 'https://docs.google.com/forms/d/e/YOUR_FORM_ID_HERE/viewform?usp=sf_link'; // DUMMY LINK
      } else {
        console.warn("onApplyClick not provided to MainNavbar for Apply button.");
      }
    }
  };
  
  return (
    <Navbar>
      {/* Desktop Navigation */}
      <NavBody>
        <NavbarLogo />
        <div className="flex-1 flex justify-center items-center space-x-1 text-sm font-normal text-muted-foreground transition duration-200 lg:space-x-2">
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
                  className="absolute inset-0 h-full w-full rounded-full" // Transparent pill for animation drive
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-20">{item.name}</span>
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {actionNavItems.map((item) => (
            item.link ? (
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
                    className="absolute inset-0 h-full w-full rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-20">{item.name}</span>
              </Link>
            ) : item.isButton && item.action ? (
                 <button
                    key={`action-${item.name}`}
                    onClick={item.action}
                    onMouseEnter={() => setHoveredItem(item.name)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className="relative px-3 py-2 text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {hoveredItem === item.name && (
                      <motion.div
                        layoutId={`hovered-action-${item.name}`} 
                        className="absolute inset-0 h-full w-full rounded-full"
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
          <button
            onClick={handleApplyNavItemClick}
            className="block py-2 text-lg text-foreground hover:text-primary"
          >
            Apply
          </button>
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
