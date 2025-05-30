
// src/app/user/events/page.tsx
"use client";

import { useEffect, useState } from 'react';
import EventCard, { type Event } from '@/components/ui/event-card';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';
import { Loader2, AlertCircle, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';

export interface FirestoreEvent {
  id: string;
  title: string;
  description: string;
  date: string; 
  time: string;
  venue: string;
  applyLink?: string;
  imageUrl?: string;
  createdAt?: Timestamp;
  dataAiHint?: string;
}

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

export default function UserEventsPage() {
  const [events, setEvents] = useState<FirestoreEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const eventsCollection = collection(db, "events");
        const q = query(eventsCollection, orderBy("date", "asc"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedEvents: FirestoreEvent[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedEvents.push({
            id: doc.id,
            title: data.title,
            description: data.description,
            date: data.date,
            time: data.time,
            venue: data.venue,
            applyLink: data.applyLink,
            imageUrl: data.imageUrl || `https://placehold.co/600x400/121212/7DF9FF.png?text=${encodeURIComponent(data.title.substring(0,10))}`,
            createdAt: data.createdAt,
            dataAiHint: `event ${data.title.toLowerCase().split(' ').slice(0,1).join('') || 'general'}`
          });
        });
        setEvents(fetchedEvents);
      } catch (err: any) {
        console.error("Error fetching events for user page: ", err);
        setError("Failed to load events. Please try again later. " + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="space-y-8">
        <motion.div
          className="text-left mb-8" // Changed to text-left
          initial="hidden"
          animate="visible"
          variants={pageTitleVariants}
        >
          <h1 className="font-montserrat text-3xl font-bold tracking-tight text-white">
            Upcoming Events
          </h1>
          <motion.p
            className="mt-2 max-w-2xl text-lg text-neutral-400"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2, ease: "easeOut"} }}
          >
            Stay updated with our latest workshops, competitions, and networking opportunities.
          </motion.p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-400" />
          </div>
        ) : error ? (
          <div className="text-center py-10 bg-rose-900/20 border border-rose-500/30 rounded-lg p-6 text-rose-300">
            <AlertCircle className="mx-auto h-10 w-10 mb-3 text-rose-400" />
            <p className="text-xl font-semibold">Could not load events</p>
            <p className="text-neutral-400">{error}</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-10 bg-neutral-800/30 rounded-lg border border-dashed border-neutral-700">
            <CalendarDays className="mx-auto h-12 w-12 text-neutral-500 mb-4" />
            <p className="text-neutral-400 text-lg">
              No upcoming events scheduled at the moment. Please check back later.
            </p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-10"
            variants={gridVariants}
            initial="hidden"
            animate="visible"
          >
            {events.map((eventData) => {
              const cardEvent: Event = {
                id: eventData.id,
                title: eventData.title,
                date: format(new Date(eventData.date.replace(/-/g, '\/')), "MMMM d, yyyy"),
                time: eventData.time,
                location: eventData.venue,
                description: eventData.description,
                imageUrl: eventData.imageUrl || `https://placehold.co/600x400/121212/7DF9FF.png?text=${encodeURIComponent(eventData.title.substring(0,10))}`,
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
    </div>
  );
}

const sectionVariants = { // Keep if used elsewhere, otherwise can remove if only for this page
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const fadeInUp = { // Keep if used elsewhere
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

