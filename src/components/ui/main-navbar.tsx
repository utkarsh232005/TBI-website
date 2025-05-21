
"use client";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useState } from "react";
import Link from "next/link"; // Import Link for navigation

export default function MainNavbar() {
  const navItems = [
    { name: 'About Us', link: '#about' },
    { name: 'Startups', link: '#startups' },
    { name: 'Program', link: '#program' },
    { name: 'Testimonials', link: '#testimonials' },
    { name: 'Apply', link: '#contact' },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <Navbar>
      {/* Desktop Navigation */}
      <NavBody>
        <NavbarLogo />
        <NavItems items={navItems} onItemClick={closeMobileMenu} />
        <div className="flex items-center gap-2">
          <NavbarButton as="a" href="/login" variant="ghost">
            Login
          </NavbarButton>
          {/* Example of a primary action button, if needed later */}
          {/* <NavbarButton variant="primary" onClick={() => console.log("Primary Action")}>Apply Now</NavbarButton> */}
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
          <div className="flex w-full flex-col gap-4 pt-4 border-t border-border mt-4">
            <NavbarButton
              as="a"
              href="/login"
              onClick={closeMobileMenu}
              variant="outline" // Using outline for a less prominent look in mobile menu
              className="w-full"
            >
              Login
            </NavbarButton>
            {/* <NavbarButton
              onClick={() => {
                closeMobileMenu();
                // Potentially scroll to contact section
                const contactSection = document.getElementById('contact');
                if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth' });
              }}
              variant="primary"
              className="w-full"
            >
              Apply Now
            </NavbarButton> */}
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
