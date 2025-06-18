"use client";

import { Rocket, Loader2, AlertCircle } from 'lucide-react'; 
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { AuroraText } from "@/components/magicui/aurora-text";
import { processImageUrl } from '@/lib/utils';
import Marquee from "react-fast-marquee";
import StartupModal from '@/components/ui/startup-modal';
import { Startup } from '@/types/startup';

interface StartupDoc {
  id: string;
  name: string;
  logoUrl: string;
  description: string;
  websiteUrl?: string;
  dataAiHint?: string;
  createdAt: Timestamp;
  funnelSource: string;
  session: string;
  monthYearOfIncubation: string;
  status: string;
  legalStatus: string;
  rknecEmailId: string;
  emailId: string;
  mobileNumber: string;
  updatedAt?: Timestamp;
}

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
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        });        setStartups(fetchedStartups);
        
        // Preload only non-base64 images
        const imageUrls = fetchedStartups
          .map(startup => processImageUrl(startup.logoUrl, startup.name.substring(0,3)))
          .filter(url => !url.startsWith('data:image/')); // Skip base64 images

        if (imageUrls.length > 0) {
          try {
            await Promise.allSettled(imageUrls.map(url => preloadImage(url)));
            setPreloadedImages(new Set(imageUrls));
            setImagesLoaded(true);
          } catch (imgErr) {
            console.warn("Some images failed to preload, but continuing anyway:", imgErr);
            setImagesLoaded(true); // Still continue even if some images fail
          }
        } else {
          setImagesLoaded(true); // No images to preload
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
  }, [startups.length, imagesLoaded]);
  // Modal handlers
  const handleStartupClick = (startup: StartupDoc) => {
    setSelectedStartup(startup as Startup);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedStartup(null);
  };
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
          <AuroraText>Featured Startups</AuroraText>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground dark:text-neutral-700 sm:text-xl">
            Meet some of the innovative companies thriving in the RCEOM-TBI ecosystem.
          </p>
        </motion.div>

        {isLoading ? (          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full space-y-12"
          >
            {/* Marquee Loading Skeleton */}
            <div className="relative w-full overflow-hidden rounded-2xl bg-card/50 border border-border/50">
              <div className="flex animate-pulse space-x-6 py-8 px-4">
                {[...Array(8)].map((_, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 w-24 h-24 bg-muted rounded-xl animate-pulse"
                  />
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
        ) : (          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.6 } }}
            className="w-full"
          >            {/* Marquee Section */}
            <div className="relative">
              <div className="relative overflow-hidden">
                <Marquee
                  gradient={false}
                  speed={40}
                  pauseOnHover={true}
                  className="py-8"
                >                  {startups.map((startup, index) => (
                    <motion.div
                      key={`${startup.id}-marquee-${index}`}
                      whileHover={{ scale: 1.1, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      className="mx-6 cursor-pointer"
                      onClick={() => handleStartupClick(startup)}
                    >
                      <img
                        src={processImageUrl(startup.logoUrl, startup.name)}
                        alt={`${startup.name} logo`}
                        className="w-24 h-24 md:w-28 md:h-28 object-contain transition-transform duration-300 hover:scale-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://placehold.co/300x150/1A1A1A/FFFFFF.png?text=${encodeURIComponent(startup.name.substring(0, 3))}`;
                        }}
                      />
                    </motion.div>
                  ))}
                </Marquee>
              </div>
              
              {/* Marquee Description */}
              <div className="text-center mt-6">
                <p className="text-sm text-muted-foreground">
                  Click on any logo to learn more about the startup
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Startup Modal */}
      <StartupModal
        startup={selectedStartup}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </motion.section>
  );
}

