import Navbar from '@/components/ui/navbar';
import Footer from '@/components/ui/footer';
import HeroSection from '@/components/sections/hero-section';
import AboutSection from '@/components/sections/about-section';
import FeaturedStartupsSection from '@/components/sections/featured-startups-section';
import ProgramDetailsSection from '@/components/sections/program-details-section';
import TestimonialsSection from '@/components/sections/testimonials-section';
import ContactSection from '@/components/sections/contact-section';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-poppins">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <AboutSection />
        <FeaturedStartupsSection />
        <ProgramDetailsSection />
        <TestimonialsSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
