"use client";

import { Rocket, Loader2, AlertCircle } from 'lucide-react'; 
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { Carousel, Card } from '@/components/ui/apple-cards-carousel';
import { Skeleton } from '@/components/ui/skeleton';

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

// Skeleton loader for startup cards
const StartupCardSkeleton = ({ index }: { index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="relative z-10 flex aspect-square h-60 w-60 flex-col items-start justify-start overflow-hidden rounded-xl bg-card border border-border md:h-64 md:w-64 flex-shrink-0"
  >
    {/* Gradient overlay */}
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-full bg-gradient-to-b from-black/50 via-transparent to-transparent" />
    
    {/* Text content skeleton */}
    <div className="relative z-40 p-5 space-y-2">
      <Skeleton className="h-4 w-20 bg-white/20 animate-pulse" />
      <Skeleton className="h-5 w-32 bg-white/30 animate-pulse" />
    </div>
    
    {/* Background image skeleton with shimmer effect */}
    <div className="absolute inset-0 z-10 bg-gradient-to-r from-muted/30 via-muted/50 to-muted/30 animate-pulse">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
    </div>
  </motion.div>
);

// Skeleton for the header, adapted to use theme variables
const SkeletonHeader = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-card to-secondary"></div>
);

const sectionTitleVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function FeaturedStartupsSection() {
  const [startups, setStartups] = useState<StartupDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());

  // Image preloading function
  const preloadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject();
      img.src = src;
    });
  };

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

        // Preload all images
        const imageUrls = fetchedStartups.map(startup => 
          startup.logoUrl || 
          `https://placehold.co/500x500/121212/FFFFFF.png?text=${encodeURIComponent(startup.name.substring(0,3))}`
        );

        try {
          await Promise.allSettled(imageUrls.map(url => preloadImage(url)));
          setPreloadedImages(new Set(imageUrls));
          setImagesLoaded(true);
        } catch (imgErr) {
          console.warn("Some images failed to preload, but continuing anyway:", imgErr);
          setImagesLoaded(true); // Still continue even if some images fail
        }

      } catch (err: any) {
        console.error("Error fetching startups for landing page: ", err);
        setError("Failed to load featured startups. " + err.message);
      } finally {
        // Only set loading to false after both data and images are ready
        if (startups.length === 0) {
          setIsLoading(false);
        }
      }
    };
    fetchStartups();
  }, []);

  // Set loading to false when both startups and images are ready
  useEffect(() => {
    if (startups.length > 0 && imagesLoaded) {
      // Add a small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [startups.length, imagesLoaded]);// Transform startups into cards for the carousel
  const carouselItems = startups.map((startup, index) => {
    // Ensure we have a valid image URL with proper fallback
    const imageUrl = startup.logoUrl || 
      `https://placehold.co/500x500/121212/FFFFFF.png?text=${encodeURIComponent(startup.name.substring(0,3))}`;
    
    return (
      <Card
        key={`${startup.id}-${index}`} // More stable key
        index={index}
        layout={false} // Disable layout animations to prevent conflicts
        card={{
          src: imageUrl,
          title: startup.name,
          category: startup.badgeText || "Featured Startup",
          content: (
            <div className="text-foreground">
              <p className="text-lg leading-relaxed">{startup.description}</p>
              {startup.websiteUrl && (
                <a 
                  href={startup.websiteUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-6 inline-block px-5 py-2.5 bg-accent text-accent-foreground rounded-md font-medium hover:bg-accent/90 transition-colors"
                >
                  Visit Website
                </a>
              )}
            </div>
          )
        }}
      />
    );
  });

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
        </motion.div>        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full"
          >
            <div className="relative w-full">
              {/* Left vignette effect */}
              <div className="absolute left-0 top-0 bottom-0 z-[1000] w-[12%] bg-gradient-to-r from-background via-background/60 to-transparent pointer-events-none"></div>
              
              {/* Right vignette effect */}
              <div className="absolute right-0 top-0 bottom-0 z-[1000] w-[12%] bg-gradient-to-l from-background via-background/60 to-transparent pointer-events-none"></div>
              
              {/* Skeleton cards container - matches carousel's overflow and gap */}
              <div className="flex gap-4 md:gap-8 overflow-x-hidden px-4 py-4 scroll-smooth">
                {[...Array(5)].map((_, index) => (
                  <StartupCardSkeleton key={index} index={index} />
                ))}
              </div>
            </div>
            
            {/* Loading text with subtle animation */}
            <motion.div 
              className="flex justify-center items-center mt-6"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Loader2 className="h-5 w-5 animate-spin text-accent mr-2" />
              <p className="text-muted-foreground">Loading featured startups...</p>
            </motion.div>
          </motion.div>
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.6 } }}
            className="w-full"
          >
            <Carousel items={carouselItems} />
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}

