
"use client";

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';
import { Rocket } from 'lucide-react'; // Using Lucide for a generic icon

// Data remains the same as before
const startupsData = [
  {
    id: '1',
    name: 'QuantumLeap AI',
    logoUrl: 'https://placehold.co/300x150/1A1A1A/7DF9FF.png?text=QAI',
    description: 'Revolutionizing data analytics with quantum-inspired machine learning algorithms.',
    badgeText: 'Series A Funded', // This badge won't be directly used in BentoGridItem, but data is kept
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

const BentoCompatibleSkeleton = ({ startup }: { startup: typeof startupsData[0] }) => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl items-center justify-center relative overflow-hidden bg-card-foreground/5">
    <Image
      src={startup.logoUrl}
      alt={`${startup.name} logo`}
      fill
      style={{ objectFit: 'contain' }}
      className="p-4"
      data-ai-hint={startup.dataAiHint || "startup logo"}
    />
  </div>
);


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
      { threshold: 0.05 } 
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

  // Prepare items for BentoGrid
  const bentoItems = startupsData.map(startup => ({
    id: startup.id,
    title: startup.name,
    description: startup.description,
    header: <BentoCompatibleSkeleton startup={startup} />,
    icon: <Rocket className="h-4 w-4 text-primary" />, // Generic icon
    className: startupsData.indexOf(startup) === 2 || startupsData.indexOf(startup) === 5 ? "md:col-span-2" : "", // Adjusting for 0-based index for items 3 and 6
  }));
  
  // Handle cases with fewer than 6 startups for md:col-span-2 logic
  // For simplicity, we'll apply col-span-2 to 3rd and 6th item if they exist.
  // A more dynamic col-span logic might be needed for varying numbers of items.
  // For this implementation, we'll assume startupsData.length is suitable or the col-span logic will gracefully handle fewer items.
  // If startupsData.length is 3, the 3rd item (index 2) gets col-span-2.
  // If startupsData.length is 6, 3rd (index 2) and 6th (index 5) get col-span-2.

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
        
        <BentoGrid className={`max-w-4xl mx-auto transition-all duration-500 ease-out ${isInView ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: `150ms` }}>
          {bentoItems.map((item, i) => (
             <div
              key={item.id}
              className={`transition-all duration-500 ease-out ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${i * 100 + 200}ms` }} // Stagger animation for items
            >
              <BentoGridItem
                title={item.title}
                description={item.description}
                header={item.header}
                icon={item.icon}
                className={item.className} // Apply md:col-span-2 based on item's pre-calculated className
              />
            </div>
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}
