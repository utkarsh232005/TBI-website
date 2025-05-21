
"use client";
import {
  Navbar,
  NavBody,
  // NavItems, // Replaced with custom rendering
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useState } from "react";
import Link from "next/link"; // Import Link for navigation
import { motion } from "framer-motion"; // Moved import to top
import { cn } from "@/lib/utils"; // Moved import to top

interface MainNavbarProps {
  onApplyClick?: () => void;
}

export default function MainNavbar({ onApplyClick }: MainNavbarProps) {
  const navItems = [
    { name: 'About Us', link: '#about' },
    { name: 'Startups', link: '#startups' },
    { name: 'Program', link: '#program' },
    { name: 'Testimonials', link: '#testimonials' },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);

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
  
  const dynamicNavItems = [
    ...navItems,
    { name: 'Apply', action: handleApplyNavItemClick, isButton: true } 
  ];


  return (
    <Navbar>
      {/* Desktop Navigation */}
      <NavBody>
        <NavbarLogo />
        {/* Custom rendering for NavItems to handle mixed links and buttons */}
        <motion.div
          onMouseLeave={() => setHovered(null)}
          className={cn(
            "absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-2 text-sm font-normal text-muted-foreground transition duration-200 lg:flex lg:space-x-2",
          )}
        >
          {dynamicNavItems.map((item, idx) => (
            item.link ? (
              <Link
                href={item.link}
                key={`link-${idx}`}
                onMouseEnter={() => setHovered(idx)}
                onClick={closeMobileMenu}
                className="relative px-4 py-2 text-muted-foreground hover:text-foreground"
              >
                {hovered === idx && (
                  <motion.div
                    layoutId="hovered"
                    className="absolute inset-0 h-full w-full rounded-full bg-muted/50"
                  />
                )}
                <span className="relative z-20">{item.name}</span>
              </Link>
            ) : item.isButton && item.action ? (
                 <button
                    key={`action-${idx}`}
                    onClick={item.action}
                    onMouseEnter={() => setHovered(idx)}
                    className="relative px-4 py-2 text-muted-foreground hover:text-foreground"
                  >
                    {hovered === idx && (
                      <motion.div
                        layoutId={`hovered-action-${idx}`} // Ensure unique layoutId
                        className="absolute inset-0 h-full w-full rounded-full bg-muted/50"
                      />
                    )}
                    <span className="relative z-20">{item.name}</span>
                  </button>
            ) : null
          ))}
        </motion.div>
        {/* <NavItems items={navItems} onItemClick={closeMobileMenu} /> Replaced with custom rendering */}
        <div className="flex items-center gap-2">
          <NavbarButton as="a" href="/login" variant="ghost" className="text-foreground hover:bg-accent hover:text-accent-foreground">
            Login
          </NavbarButton>
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
          {navItems.map((item, idx) => ( 
            <Link
              key={`mobile-link-${idx}`}
              href={item.link}
              onClick={closeMobileMenu}
              className="relative block py-2 text-lg text-foreground hover:text-primary"
            >
              {item.name}
            </Link>
          ))}
          <button
            onClick={handleApplyNavItemClick}
            className="relative block py-2 text-lg text-foreground hover:text-primary"
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

// Removed imports from bottom as they are now at the top
