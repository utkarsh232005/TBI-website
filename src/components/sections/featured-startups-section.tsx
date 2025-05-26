
"use client";

import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';
import { Rocket } from 'lucide-react'; 
import { motion } from 'framer-motion';
import Image from 'next/image'; // Import Image

const startupsData = [
  {
    id: '1',
    name: 'QuantumLeap AI',
    logoUrl: 'https://placehold.co/300x150/1A1A1A/FFFFFF.png?text=QAI', // Text white for dark bg
    description: 'Revolutionizing data analytics with quantum-inspired machine learning algorithms.',
    badgeText: 'Series A Funded',
    websiteUrl: '#',
    dataAiHint: "technology logo"
  },
  {
    id: '2',
    name: 'EcoSynth Solutions',
    logoUrl: 'https://placehold.co/300x150/1A1A1A/FFFFFF.png?text=ESS', // Text white
    description: 'Developing sustainable materials through innovative biosynthetic processes.',
    badgeText: 'Acquired',
    websiteUrl: '#',
    dataAiHint: "nature logo"
  },
  {
    id: '3',
    name: 'NovaMed Devices',
    logoUrl: 'https://placehold.co/300x150/1A1A1A/FFFFFF.png?text=NMD', // Text white
    description: 'Pioneering next-generation medical devices for remote patient monitoring.',
    badgeText: '500K+ Users',
    websiteUrl: '#',
    dataAiHint: "medical logo"
  },
   {
    id: '4',
    name: 'CyberGuard Inc.',
    logoUrl: 'https://placehold.co/300x150/1A1A1A/FFFFFF.png?text=CGI', // Text white
    description: 'Advanced cybersecurity solutions for protecting critical digital infrastructure.',
    badgeText: 'Seed Stage',
    websiteUrl: '#',
    dataAiHint: "security logo"
  },
  {
    id: '5',
    name: 'AeroGlide Systems',
    logoUrl: 'https://placehold.co/300x150/1A1A1A/FFFFFF.png?text=AGS', // Text white
    description: 'Urban air mobility platforms for efficient and eco-friendly transportation.',
    badgeText: 'Patent Pending',
    websiteUrl: '#',
    dataAiHint: "aviation logo"
  },
  {
    id: '6',
    name: 'ConnectSphere VR',
    logoUrl: 'https://placehold.co/300x150/1A1A1A/FFFFFF.png?text=CSVR', // Text white
    description: 'Immersive virtual reality experiences for collaboration and entertainment.',
    badgeText: 'Beta Launch',
    websiteUrl: '#',
    dataAiHint: "virtual reality"
  },
];

const Skeleton = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-card to-secondary"></div>
);


const sectionTitleVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const bentoGridVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
};

const bentoItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function FeaturedStartupsSection() {
  const bentoItems = startupsData.map((startup, i) => ({
    id: startup.id,
    title: startup.name,
    description: startup.description,
    header: <Skeleton />, 
    icon: <Rocket className="h-4 w-4 text-muted-foreground" />, 
    className: i === 3 ? "md:col-span-2" : "", 
  }));
  

  return (
    <motion.section 
      id="startups" 
      className="py-16 md:py-24 bg-background text-foreground"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-12 md:mb-16"
          variants={sectionTitleVariants}
        >
          <h2 className="font-montserrat text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-accent">
            Featured Startups
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground sm:text-xl">
            Meet some of the innovative companies thriving in the RCEOM-TBI ecosystem.
          </p>
        </motion.div>
        
        <motion.div
          variants={bentoGridVariants}
          className="max-w-4xl mx-auto" 
        >
          <BentoGrid>
            {bentoItems.map((item) => (
              <motion.div
                key={item.id}
                variants={bentoItemVariants}
                 whileHover={{ scale: 1.02, transition: { type: "spring", stiffness: 300, damping: 15 } }}
              >
                <BentoGridItem
                  title={item.title}
                  description={item.description}
                  header={item.header}
                  icon={item.icon}
                  className={item.className} 
                />
              </motion.div>
            ))}
          </BentoGrid>
        </motion.div>
      </div>
    </motion.section>
  );
}
