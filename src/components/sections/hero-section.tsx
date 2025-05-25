
"use client";

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { CampusStatusDialog } from '@/components/ui/campus-status-dialog';
// import Image from 'next/image'; // Image import no longer needed for noise texture
import { gsap } from 'gsap';
import { useTheme } from 'next-themes'; // Keep for other theme-dependent logic if any, or remove if not used elsewhere in this component

// DUMMY_GOOGLE_FORM_LINK: This is a placeholder. Replace with your actual Google Form link for off-campus applicants.
const DUMMY_GOOGLE_FORM_LINK = 'https://docs.google.com/forms/d/e/YOUR_FORM_ID_HERE/viewform?usp=sf_link';

interface HeroSectionProps {
  onApplyClick?: () => void;
}

export default function HeroSection({ onApplyClick }: HeroSectionProps) {
  const [showCampusDialog, setShowCampusDialog] = useState(false);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const taglineRef = useRef<HTMLParagraphElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    if (!mounted) return; // Ensure animations run only client-side

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Animate tagline
    if (taglineRef.current) {
      tl.fromTo(
        taglineRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.2 }
      );
    }

    // Animate headline words
    if (headlineRef.current) {
      const words = headlineRef.current.innerText.split(/\s+/);
      headlineRef.current.innerHTML = words
        .map((word) => `<span class="inline-block opacity-0">${word}</span>`)
        .join(' ');
      
      const wordSpans = headlineRef.current.querySelectorAll('span');
      tl.to(
        wordSpans,
        {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          duration: 0.6,
          ease: 'power2.out',
        },
        "-=0.4" // Overlap slightly with tagline animation
      );
    }

    // Animate buttons
    if (buttonsRef.current) {
      tl.fromTo(
        buttonsRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8 },
        "-=0.5" // Overlap with headline animation
      );
    }
  }, [mounted]);

  const handleApplyForIncubationClick = () => {
    setShowCampusDialog(true);
  };

  const handleCampusStatusSelect = (status: "campus" | "off-campus") => {
    if (typeof window !== "undefined") {
      localStorage.setItem('applicantCampusStatus', status);
    }
    setShowCampusDialog(false);

    if (status === "off-campus") {
      window.location.href = DUMMY_GOOGLE_FORM_LINK;
    } else { 
      if (onApplyClick) {
        onApplyClick(); 
      } else {
        console.warn("onApplyClick not provided to HeroSection for campus applicants.");
      }
    }
  };

  return (
    <section 
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white pt-12 sm:pt-16"
    >
      {/* Noise Texture Overlay - REMOVED
      {mounted && resolvedTheme === 'dark' && (
        <div className="absolute inset-0 z-0">
          <Image
            src="https://landingfoliocom.imgix.net/store/collection/dusk/images/noise.png"
            alt="Noise texture"
            fill
            style={{ objectFit: 'cover' }}
            className="opacity-50"
            unoptimized
            priority // Added priority as this image is LCP when visible
            data-ai-hint="noise texture"
          />
        </div>
      )}
      */}

      {/* Bottom Gradient Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-bottom-gradient-hero z-0" />
      
      <div 
        className="relative z-10 mx-auto max-w-4xl p-4 text-center"
      >
        <p 
          ref={taglineRef}
          className="text-sm font-normal tracking-widest uppercase mb-8 opacity-0" // Initial state for GSAP
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-500">
            YOUR STARTUP NEEDS A KICK
          </span>
        </p>
        <h1 
          ref={headlineRef}
          className="font-orbitron text-4xl font-normal text-white sm:text-5xl lg:text-6xl xl:text-7xl"
        >
          {/* Words will be injected here by GSAP */}
          Connect & grow with your targeted customers
        </h1>
        
        <div 
          ref={buttonsRef}
          className="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row opacity-0" // Initial state for GSAP
        >
          <div className="relative inline-flex items-center justify-center w-full sm:w-auto group">
            <div className="absolute transition-all duration-200 rounded-full -inset-px bg-gradient-to-r from-cyan-500 to-purple-500 group-hover:shadow-lg group-hover:shadow-cyan-500/50"></div>
            <Button
              size="lg"
              onClick={handleApplyForIncubationClick}
              className="relative inline-flex items-center justify-center w-full px-8 py-3 text-base font-normal text-white bg-black border border-transparent rounded-full sm:w-auto group"
            >
              Apply for Incubation
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="inline-flex items-center justify-center w-full px-8 py-3 text-base font-normal text-white transition-all duration-200 bg-black border border-gray-600 rounded-full sm:w-auto hover:border-white group"
          >
            <a href="#startups">
              See Success Stories
            </a>
          </Button>
        </div>
      </div>
      
      <CampusStatusDialog
        open={showCampusDialog}
        onOpenChange={setShowCampusDialog}
        onSelect={handleCampusStatusSelect}
      />
    </section>
  );
}
