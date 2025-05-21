
"use client";

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronDown } from 'lucide-react'; // ChevronDown might not be needed anymore
import { CampusStatusDialog } from '@/components/ui/campus-status-dialog';
import Image from 'next/image';

export default function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [showCampusDialog, setShowCampusDialog] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current && observer) {
        try {
          observer.unobserve(sectionRef.current);
        } catch (e) {
          // console.warn("Error unobserving hero section:", e);
        }
      }
    };
  }, []);
  
  const handleApplyForIncubationClick = () => {
    setShowCampusDialog(true);
  };

  const handleCampusStatusSelect = (status: "campus" | "off-campus") => {
    localStorage.setItem('applicantCampusStatus', status);
    setShowCampusDialog(false);
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      ref={sectionRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white pt-12 sm:pt-16" // bg-black from example
    >
      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://landingfoliocom.imgix.net/store/collection/dusk/images/noise.png"
          alt="Noise texture"
          layout="fill"
          objectFit="cover"
          className="opacity-50"
          unoptimized // For simple overlay, optimization might not be critical & avoids config
          data-ai-hint="noise texture"
        />
      </div>

      {/* Bottom Gradient Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-bottom-gradient-hero z-0" />
      
      <div className={`relative z-10 mx-auto max-w-4xl p-4 text-center transition-all duration-1000 ease-out ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <p className="text-sm font-normal tracking-widest uppercase mb-8">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-500">
            YOUR STARTUP NEEDS A KICK
          </span>
        </p>
        <h1 className="font-orbitron text-4xl font-normal text-white sm:text-5xl lg:text-6xl xl:text-7xl">
          Connect &amp; grow with your targeted customers
        </h1>
        
        <div className="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row">
          {/* "Apply for Incubation" styled like "Start 14 Days Free Trial" */}
          <div className="relative inline-flex items-center justify-center w-full sm:w-auto group">
            <div className="absolute transition-all duration-200 rounded-full -inset-px bg-gradient-to-r from-cyan-500 to-purple-500 group-hover:shadow-lg group-hover:shadow-cyan-500/50"></div>
            <Button
              size="lg"
              onClick={handleApplyForIncubationClick}
              className="relative inline-flex items-center justify-center w-full px-8 py-3 text-base font-normal text-white bg-black border border-transparent rounded-full sm:w-auto group" // Added group here for consistency if inner elements need it
            >
              Apply for Incubation
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          {/* "See Success Stories" styled like "Talk to Sales" */}
          <Button
            asChild
            variant="outline"
            size="lg"
            className="inline-flex items-center justify-center w-full px-8 py-3 text-base font-normal text-white transition-all duration-200 bg-black border border-gray-600 rounded-full sm:w-auto hover:border-white group"
          >
            <a href="#startups">
              See Success Stories
              {/* Icon can be added here if desired, e.g. <ChevronDown className="ml-2 h-5 w-5 transition-transform group-hover:translate-y-1" /> */}
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
