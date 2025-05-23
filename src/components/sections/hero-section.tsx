
"use client";

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { CampusStatusDialog } from '@/components/ui/campus-status-dialog';
import Image from 'next/image';
import { motion } from 'framer-motion';

// DUMMY_GOOGLE_FORM_LINK: This is a placeholder. Replace with your actual Google Form link for off-campus applicants.
const DUMMY_GOOGLE_FORM_LINK = 'https://docs.google.com/forms/d/e/YOUR_FORM_ID_HERE/viewform?usp=sf_link';

interface HeroSectionProps {
  onApplyClick?: () => void;
}

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.2,
    },
  },
};


export default function HeroSection({ onApplyClick }: HeroSectionProps) {
  // sectionRef and isInView are no longer needed for Framer Motion's whileInView or initial animate
  const [showCampusDialog, setShowCampusDialog] = useState(false);
  
  const handleApplyForIncubationClick = () => {
    setShowCampusDialog(true);
  };

  const handleCampusStatusSelect = (status: "campus" | "off-campus") => {
    localStorage.setItem('applicantCampusStatus', status);
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
      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://landingfoliocom.imgix.net/store/collection/dusk/images/noise.png"
          alt="Noise texture"
          layout="fill"
          objectFit="cover"
          className="opacity-50"
          unoptimized
          data-ai-hint="noise texture"
        />
      </div>

      {/* Bottom Gradient Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-bottom-gradient-hero z-0" />
      
      <motion.div 
        className="relative z-10 mx-auto max-w-4xl p-4 text-center"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.p 
          className="text-sm font-normal tracking-widest uppercase mb-8"
          variants={fadeInUp}
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-500">
            YOUR STARTUP NEEDS A KICK
          </span>
        </motion.p>
        <motion.h1 
          className="font-orbitron text-4xl font-normal text-white sm:text-5xl lg:text-6xl xl:text-7xl"
          variants={fadeInUp}
        >
          Connect &amp; grow with your targeted customers
        </motion.h1>
        
        <motion.div 
          className="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row"
          variants={fadeInUp}
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
        </motion.div>
      </motion.div>
      
      <CampusStatusDialog
        open={showCampusDialog}
        onOpenChange={setShowCampusDialog}
        onSelect={handleCampusStatusSelect}
      />
    </section>
  );
}
