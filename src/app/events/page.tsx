// src/app/events/page.tsx
"use client";

import { useEffect, useState } from 'react';
import MainNavbar from '@/components/ui/main-navbar';
import Footer from '@/components/ui/footer';
import EventCard, { type Event } from '@/components/ui/event-card'; // Assuming EventCard's Event type matches
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';
import { Loader2, AlertCircle, CalendarDays } from 'lucide-react';
import { format } from 'date-fns'; // Added this import

const pageTitleVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const gridVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const cardItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// Event type as expected by EventCard, matching Firestore structure
export interface FirestoreEvent {
  id: string;
  title: string;
  description: string;
  date: string; // Stored as 'YYYY-MM-DD'
  time: string;
  venue: string;
  applyLink?: string;
  imageUrl?: string;
  createdAt?: Timestamp; // For ordering if needed
  dataAiHint?: string; // Optional, can be constructed or defaulted
}

export default function EventsPage() {
  const [events, setEvents] = useState<FirestoreEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const eventsCollection = collection(db, "events");
        // Order by event date (which is a string 'YYYY-MM-DD') then by creation time for events on same day
        const q = query(eventsCollection, orderBy("date", "asc"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedEvents: FirestoreEvent[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedEvents.push({
            id: doc.id,
            title: data.title,
            description: data.description,
            date: data.date, // Assuming date is stored as 'YYYY-MM-DD'
            time: data.time,
            venue: data.venue,
            applyLink: data.applyLink,
            imageUrl: data.imageUrl || `https://placehold.co/600x400/121212/7DF9FF.png?text=${encodeURIComponent(data.title.substring(0, 10))}`, // Fallback placeholder
            createdAt: data.createdAt,
            dataAiHint: `event ${data.title.toLowerCase().split(' ').slice(0, 1).join('') || 'general'}` // Simple AI hint
          });
        });
        setEvents(fetchedEvents);
      } catch (err: any) {
        console.error("Error fetching events for public page: ", err);
        setError("Failed to load events. Please try again later. " + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background font-poppins">
      <MainNavbar />
      <main className="flex-grow py-16 md:py-24">
        <motion.div
          className="container mx-auto px-4 sm:px-6 lg:px-8"
          initial="hidden"
          animate="visible"
          variants={sectionVariants} // Using sectionVariants for overall container
        >
          <motion.div
            className="text-center mb-12 md:mb-16"
            variants={pageTitleVariants} // Variants for title block
          >
            <h1 className="font-orbitron text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-primary">
              Upcoming Events
            </h1>
            <motion.p
              className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground sm:text-xl"
              variants={fadeInUp} // Using a more specific variant
            >
              Stay updated with our latest workshops, competitions, and networking opportunities.
            </motion.p>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-20 text-destructive">
              <AlertCircle className="mx-auto h-12 w-12 mb-4" />
              <p className="text-xl font-semibold">Could not load events</p>
              <p className="text-muted-foreground">{error}</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20">
              <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">
                No upcoming events scheduled at the moment. Please check back later.
              </p>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-10"
              variants={gridVariants} // Variants for the grid container
            >
              {events.map((eventData) => {
                // Adapt FirestoreEvent to EventCard's Event type
                const cardEvent: Event = {
                  id: eventData.id,
                  title: eventData.title,
                  // Format date string 'YYYY-MM-DD' to a more readable format for the card
                  date: format(new Date(eventData.date.replace(/-/g, '\/')), "MMMM d, yyyy"), // Ensure cross-browser date parsing
                  time: eventData.time,
                  location: eventData.venue,
                  description: eventData.description,
                  imageUrl: eventData.imageUrl || `https://placehold.co/600x400/121212/7DF9FF.png?text=${encodeURIComponent(eventData.title.substring(0, 10))}`,
                  dataAiHint: eventData.dataAiHint || 'event general',
                  detailsUrl: eventData.applyLink,
                };
                return (
                  <motion.div key={eventData.id} variants={cardItemVariants}>
                    <EventCard event={cardEvent} />
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}

// Re-defining Framer Motion variants here as they were used in the original code.
// These can be moved to a shared file if used in multiple places.
const sectionVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};
