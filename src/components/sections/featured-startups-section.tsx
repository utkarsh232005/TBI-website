
"use client";

import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';
import { Rocket, Loader2, AlertCircle } from 'lucide-react'; 
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, Timestamp } from 'firebase/firestore';

interface StartupDoc {
  id: string;
  name: string;
  logoUrl: string;
  description: string;
  badgeText: string;
  websiteUrl?: string;
  dataAiHint?: string;
  createdAt: Timestamp;
}

// Skeleton for the header, adapted to use theme variables
const Skeleton = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-card to-secondary"></div>
);

const sectionTitleVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const bentoGridVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const bentoItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function FeaturedStartupsSection() {
  const [startups, setStartups] = useState<StartupDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStartups = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const startupsCollection = collection(db, "startups");
        const q = query(startupsCollection, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedStartups: StartupDoc[] = [];
        querySnapshot.forEach((doc) => {
          fetchedStartups.push({ id: doc.id, ...doc.data() } as StartupDoc);
        });
        setStartups(fetchedStartups);
      } catch (err: any) {
        console.error("Error fetching startups for landing page: ", err);
        setError("Failed to load featured startups. " + err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStartups();
  }, []);

  const bentoItems = startups.map((startup, i) => ({
    id: startup.id,
    title: startup.name,
    description: startup.description,
    header: (
      <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-card-foreground/5 items-center justify-center p-2">
        <Image
          src={startup.logoUrl || `https://placehold.co/300x150/121212/FFFFFF.png?text=${encodeURIComponent(startup.name.substring(0,3))}`}
          alt={`${startup.name} logo`}
          width={150} 
          height={75} 
          style={{ objectFit: 'contain', maxHeight: '100%', maxWidth: '100%' }}
          data-ai-hint={startup.dataAiHint || "startup logo"}
          className="rounded-md"
        />
      </div>
    ),
    icon: <Rocket className="h-4 w-4 text-muted-foreground" />,
    className: i === 3 ? "md:col-span-2" : "", // Example: make the 4th item larger if 6 items: 0,1,2 (row1), 3 (spans), 4 (row2), 5 (row3)
                                            // Adjust i === x based on total items and desired layout
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
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground dark:text-neutral-700 sm:text-xl">
            Meet some of the innovative companies thriving in the RCEOM-TBI ecosystem.
          </p>
        </motion.div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-12 w-12 animate-spin text-accent" />
            <p className="ml-3 text-muted-foreground">Loading startups...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-destructive">
            <AlertCircle className="mx-auto h-12 w-12 mb-4" />
            <p className="text-xl font-semibold">Could not load startups</p>
            <p className="text-muted-foreground">{error}</p>
          </div>
        ) : startups.length === 0 ? (
           <div className="text-center py-10">
            <Rocket className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">
              No featured startups to display at the moment.
            </p>
          </div>
        ) : (
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
        )}
      </div>
    </motion.section>
  );
}

    