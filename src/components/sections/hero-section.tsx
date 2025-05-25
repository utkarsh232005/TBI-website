"use client";

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { CampusStatusDialog } from '@/components/ui/campus-status-dialog';
import { gsap } from 'gsap';
import { useTheme } from 'next-themes';

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
    if (!mounted) return;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (taglineRef.current) {
      tl.fromTo(
        taglineRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.2 }
      );
    }

    if (headlineRef.current) {
      const words = headlineRef.current.innerText.split(/\s+/);
      headlineRef.current.innerHTML = words
        .map((word) => `<span class=\"inline-block opacity-0\">${word}</span>`)
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
        "-=0.4"
      );
    }

    if (buttonsRef.current) {
      tl.fromTo(
        buttonsRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8 },
        "-=0.5"
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
      return;
    }
    
    if (onApplyClick) {
      onApplyClick();
    } else {
      console.warn("onApplyClick not provided to HeroSection for campus applicants.");
    }
  };

  return (
    <section 
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background text-foreground pt-12 sm:pt-16"
    >
      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 z-0 h-full w-full">
        <div className="relative h-full w-full">
          <Image
            src="https://landingfoliocom.imgix.net/store/collection/dusk/images/noise.png"
            alt="Noise texture"
            fill
            priority
            className="opacity-50 object-cover"
            unoptimized
          />
        </div>
      </div>

      {/* Bottom Gradient Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-bottom-gradient-hero z-0" />
      
      <div className="relative z-10 mx-auto max-w-4xl p-4 text-center">
        <p 
          ref={taglineRef}
          className="text-sm font-normal tracking-widest uppercase mb-8 opacity-0"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-500">
            YOUR STARTUP NEEDS A KICK
          </span>
        </p>
        <h1 
          ref={headlineRef}
          className="font-orbitron text-4xl font-normal sm:text-5xl lg:text-6xl xl:text-7xl"
        >
          Connect & grow with your targeted customers
        </h1>
        
        <div 
          ref={buttonsRef}
          className="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row opacity-0"
        >
          <div className="relative inline-flex items-center justify-center w-full sm:w-auto group">
            <div className="absolute transition-all duration-200 rounded-full -inset-px bg-gradient-to-r from-cyan-500 to-purple-500 group-hover:shadow-lg group-hover:shadow-cyan-500/50" />
            <Button
              size="lg"
              onClick={handleApplyForIncubationClick}
              className="relative inline-flex items-center justify-center w-full px-8 py-3 text-base font-normal bg-background border border-transparent rounded-full sm:w-auto group"
            >
              Apply for Incubation
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="inline-flex items-center justify-center w-full px-8 py-3 text-base font-normal bg-background border-border rounded-full sm:w-auto hover:border-primary transition-all duration-200"
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