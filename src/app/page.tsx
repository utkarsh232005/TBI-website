
"use client"; // Add this if not present, for useState

import { useState } from 'react'; // Import useState
import MainNavbar from '@/components/ui/main-navbar';
import Footer from '@/components/ui/footer';
import HeroSection from '@/components/sections/hero-section';
import AboutSection from '@/components/sections/about-section';
import FeaturedStartupsSection from '@/components/sections/featured-startups-section';
import ProgramDetailsSection from '@/components/sections/program-details-section';
import TestimonialsSection from '@/components/sections/testimonials-section';
import RcoemSplashScreen from '@/components/sections/rcoem-splash-screen';
// import ContactSection from '@/components/sections/contact-section'; // No longer directly rendered
import ApplicationFormDialog from '@/components/ui/application-form-dialog'; // Import the new dialog

export default function HomePage() {
  const [isApplicationFormOpen, setIsApplicationFormOpen] = useState(false);
  const [showMainContent, setShowMainContent] = useState(false);
  const handleOpenApplicationForm = () => {
    // Ensure off-campus users are still handled correctly if they reach here.
    const campusStatusFromStorage = typeof window !== "undefined" ? localStorage.getItem('applicantCampusStatus') as "campus" | "off-campus" | null : null;
    if (campusStatusFromStorage === "off-campus") {
      // This case should ideally be handled before calling this, 
      // e.g. in HeroSection, but as a fallback:
      window.location.href = 'https://docs.google.com/forms/d/e/YOUR_FORM_ID_HERE/viewform?usp=sf_link'; // DUMMY LINK
      return;
    }
    setIsApplicationFormOpen(true);
  };

  const handleSplashComplete = () => {
    setShowMainContent(true);
  };

  // Show splash screen first, then main content
  if (!showMainContent) {
    return (
      <RcoemSplashScreen onComplete={handleSplashComplete}>
        <div className="flex flex-col min-h-screen bg-background font-poppins">
          <MainNavbar onApplyClick={handleOpenApplicationForm} />
          <main className="flex-grow">
            <HeroSection onApplyClick={handleOpenApplicationForm} />
            <AboutSection />
            <FeaturedStartupsSection />
            <ProgramDetailsSection />
            <TestimonialsSection />
          </main>
          <Footer />
          <ApplicationFormDialog 
            open={isApplicationFormOpen} 
            onOpenChange={setIsApplicationFormOpen} 
          />
        </div>
      </RcoemSplashScreen>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background font-poppins">
      <MainNavbar onApplyClick={handleOpenApplicationForm} /> {/* Pass handler to Navbar */}
      <main className="flex-grow">
        <HeroSection onApplyClick={handleOpenApplicationForm} /> {/* Pass handler to HeroSection */}
        <AboutSection />
        <FeaturedStartupsSection />
        <ProgramDetailsSection />
        <TestimonialsSection />
        {/* ContactSection is no longer rendered here */}
      </main>
      <Footer />
      <ApplicationFormDialog 
        open={isApplicationFormOpen} 
        onOpenChange={setIsApplicationFormOpen} 
      />
    </div>
  );
}
