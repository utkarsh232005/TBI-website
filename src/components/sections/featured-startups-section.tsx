
"use client";

import { useRef, useEffect, useState } from 'react';
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';
import { Rocket } from 'lucide-react'; 

// Data remains the same as before for content
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

// Skeleton component to match the plain dark rectangle header in the image
const Skeleton = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-card-foreground/5"></div>
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
  const bentoItems = startupsData.map((startup, i) => ({ // Added index i
    id: startup.id,
    title: startup.name,
    description: startup.description,
    header: <Skeleton />, // Use the plain Skeleton for the header
    icon: <Rocket className="h-4 w-4 text-muted-foreground" />, 
    // Apply spanning logic from demo: 4th item (index 3) spans 2 columns.
    // Since startupsData has 6 items (indices 0-5), i === 6 will not be met.
    className: i === 3 ? "md:col-span-2" : "", 
  }));
  

  return (
    <section id="startups" ref={sectionRef} className="py-16 md:py-24 bg-background text-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-12 md:mb-16 transition-all duration-700 ease-out ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="font-orbitron text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-primary">
            Featured Startups
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground sm:text-xl">
            Meet some of the innovative companies thriving in the RCEOM-TBI ecosystem.
          </p>
        </div>
        
        <BentoGrid className={`max-w-4xl mx-auto transition-all duration-500 ease-out ${isInView ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: `150ms` }}>
          {bentoItems.map((item, i) => ( // Added index i for transitionDelay keying
             <div
              key={item.id} // Use item.id for React key
              className={`transition-all duration-500 ease-out ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${i * 100 + 200}ms` }}
            >
              <BentoGridItem
                title={item.title}
                description={item.description}
                header={item.header}
                icon={item.icon}
                className={item.className} // Pass the calculated className for spanning
              />
            </div>
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}
