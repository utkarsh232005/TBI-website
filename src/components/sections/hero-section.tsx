
"use client";

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { CampusStatusDialog } from '@/components/ui/campus-status-dialog';
import { gsap } from 'gsap';
import { useTheme } from 'next-themes'; // Keep for potential theme-specific logic if needed later
import { motion } from 'framer-motion';
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";



const DUMMY_GOOGLE_FORM_LINK = 'https://docs.google.com/forms/d/e/YOUR_FORM_ID_HERE/viewform?usp=sf_link'; // DUMMY LINK

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
      // DUMMY_GOOGLE_FORM_LINK: This is a placeholder.
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
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background text-foreground pt-12 sm:pt-16"
    >
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-bottom-gradient-hero z-0" />
      
      <div 
        className="relative z-10 mx-auto max-w-4xl p-4 text-center"
      >
        <p 
          ref={taglineRef}
          className="font-montserrat text-sm font-normal tracking-widest uppercase mb-8 opacity-0"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-accent"> {/* from-white to-purple */}
            Your startup needs a kick
          </span>
        </p>
        <h1 
          ref={headlineRef}
          className="font-montserrat text-4xl font-normal text-foreground sm:text-5xl lg:text-6xl xl:text-7xl" 
        >
          Connect & grow with your targeted customers
        </h1>
          <div 
          ref={buttonsRef}
          className="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row opacity-0"
        >
          <div onClick={handleApplyForIncubationClick}>
            <InteractiveHoverButton>Apply for the Incubation</InteractiveHoverButton>
          </div>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="inline-flex items-center justify-center w-full px-8 py-3 text-base font-normal text-foreground transition-all duration-200 bg-background border-border rounded-full sm:w-auto hover:border-accent group"
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
    </motion.section>
  );
}
