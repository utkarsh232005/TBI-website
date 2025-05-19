"use client";

import { useRef, useEffect, useState } from 'react';
import StartupCard from '@/components/ui/startup-card';

const startupsData = [
  {
    id: '1',
    name: 'QuantumLeap AI',
    logoUrl: 'https://placehold.co/300x150/1A1A1A/7DF9FF.png?text=QAI',
    description: 'Revolutionizing data analytics with quantum-inspired machine learning algorithms.',
    badgeText: 'Series A Funded',
    websiteUrl: '#',
    dataAiHint: "technology logo"
  },
  {
    id: '2',
    name: 'EcoSynth Solutions',
    logoUrl: 'https://placehold.co/300x150/1A1A1A/32CD32.png?text=ESS',
    description: 'Developing sustainable materials through innovative biosynthetic processes.',
    badgeText: 'Acquired',
    websiteUrl: '#',
    dataAiHint: "nature logo"
  },
  {
    id: '3',
    name: 'NovaMed Devices',
    logoUrl: 'https://placehold.co/300x150/1A1A1A/FF2D55.png?text=NMD',
    description: 'Pioneering next-generation medical devices for remote patient monitoring.',
    badgeText: '500K+ Users',
    websiteUrl: '#',
    dataAiHint: "medical logo"
  },
   {
    id: '4',
    name: 'CyberGuard Inc.',
    logoUrl: 'https://placehold.co/300x150/1A1A1A/BF5AF2.png?text=CGI',
    description: 'Advanced cybersecurity solutions for protecting critical digital infrastructure.',
    badgeText: 'Seed Stage',
    websiteUrl: '#',
    dataAiHint: "security logo"
  },
  {
    id: '5',
    name: 'AeroGlide Systems',
    logoUrl: 'https://placehold.co/300x150/1A1A1A/0A84FF.png?text=AGS',
    description: 'Urban air mobility platforms for efficient and eco-friendly transportation.',
    badgeText: 'Patent Pending',
    websiteUrl: '#',
    dataAiHint: "aviation logo"
  },
  {
    id: '6',
    name: 'ConnectSphere VR',
    logoUrl: 'https://placehold.co/300x150/1A1A1A/FF9500.png?text=CSVR',
    description: 'Immersive virtual reality experiences for collaboration and entertainment.',
    badgeText: 'Beta Launch',
    websiteUrl: '#',
    dataAiHint: "virtual reality"
  },
];

export default function FeaturedStartupsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.05 } // Lower threshold for potentially larger grid
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section id="startups" ref={sectionRef} className="py-16 md:py-24 bg-background text-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-12 md:mb-16 transition-all duration-700 ease-out ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="font-orbitron text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-primary">
            Featured Startups
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground sm:text-xl">
            Meet some of the innovative companies thriving in the InnoNexus ecosystem.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {startupsData.map((startup, index) => (
            <div
              key={startup.id}
              className={`transition-all duration-500 ease-out ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <StartupCard startup={startup} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
