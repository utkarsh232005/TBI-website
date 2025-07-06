
"use client";

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { CampusStatusDialog } from '@/components/ui/campus-status-dialog';
import { gsap } from 'gsap';
import { useTheme } from 'next-themes'; // Keep for potential theme-specific logic if needed later
import { motion } from 'framer-motion';
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";

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
    
    // Always open the application dialog, regardless of status
    if (onApplyClick) {
      onApplyClick();
    } else {
      console.warn("onApplyClick handler not provided to HeroSection.");
    }
  };

  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white pt-20"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-600/20 via-slate-900/50 to-black"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 mx-auto max-w-6xl px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-6"
        >
          <span className="inline-flex items-center rounded-full bg-purple-600/20 px-6 py-2 text-sm font-medium text-purple-200 ring-1 ring-purple-600/30">
            🚀 Transform Your Startup Journey
          </span>
        </motion.div>

        <motion.h1 
          ref={headlineRef}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-bold text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-tight mb-8"
        >
          <span className="block text-white">Build the</span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-red-400">
            Future
          </span>
          <span className="block text-white">of Innovation</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mx-auto max-w-3xl text-xl text-gray-300 leading-relaxed mb-12"
        >
          Join India's premier technology business incubator and transform your innovative ideas into successful startups. 
          Get mentorship, funding, and resources to scale your business.
        </motion.p>

        <motion.div 
          ref={buttonsRef}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <div onClick={handleApplyForIncubationClick} className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-4 rounded-full text-lg shadow-2xl shadow-purple-500/25 transform transition-all duration-200 hover:scale-105"
            >
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="lg"
            asChild
            className="w-full sm:w-auto border-gray-300 text-gray-300 hover:bg-white hover:text-gray-900 font-semibold px-8 py-4 rounded-full text-lg transition-all duration-200 hover:scale-105"
          >
            <a href="#success-stories">
              See Success Stories
            </a>
          </Button>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center"
        >
          <div className="space-y-2">
            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              100+
            </div>
            <div className="text-gray-300">Startups Incubated</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              ₹50Cr+
            </div>
            <div className="text-gray-300">Funding Raised</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              50+
            </div>
            <div className="text-gray-300">Mentors Network</div>
          </div>
        </motion.div>
      </div>
      
      <CampusStatusDialog
        open={showCampusDialog}
        onOpenChange={setShowCampusDialog}
        onSelect={handleCampusStatusSelect}
      />
    </motion.section>
  );
}
