
"use client";

import { useState } from 'react';
import MainNavbar from '@/components/ui/main-navbar';
import Footer from '@/components/ui/footer';
import HeroSection from '@/components/sections/hero-section';
import FeaturesSection from '@/components/sections/features-section';
import RcoemAboutSection from '@/components/sections/rcoem-about-section';
import TeamSection from '@/components/sections/team-section';
import FeaturedStartupsSection from '@/components/sections/featured-startups-section';
import ModernTestimonialsSection from '@/components/sections/modern-testimonials-section';
import RcoemSplashScreen from '@/components/sections/rcoem-splash-screen';
import ApplicationFormDialog from '@/components/ui/application-form-dialog';

export default function HomePage() {
  const [isApplicationFormOpen, setIsApplicationFormOpen] = useState(false);
  const [showMainContent, setShowMainContent] = useState(false);
  
  const handleOpenApplicationForm = () => {
    // This function now simply opens the unified application form dialog.
    // The distinction between campus and off-campus is handled by the
    // CampusStatusDialog and the form submission logic.
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
            <FeaturesSection />
            <RcoemAboutSection />
            <TeamSection />
            <FeaturedStartupsSection />
            <ModernTestimonialsSection />
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
        <HeroSection onApplyClick={handleOpenApplicationForm} />
        <FeaturesSection />
        <RcoemAboutSection />
        <TeamSection />
        <FeaturedStartupsSection />
        <ModernTestimonialsSection />
      </main>
      <Footer />
      <ApplicationFormDialog 
        open={isApplicationFormOpen} 
        onOpenChange={setIsApplicationFormOpen} 
      />
    </div>
  );
}
