// src/components/ui/event-card.tsx
"use client";

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, MapPin, ArrowRight, Link as LinkIcon } from 'lucide-react'; // Added LinkIcon
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns'; // For more robust date formatting

export interface Event {
  id: string;
  title: string;
  date: string; // Can be 'YYYY-MM-DD' or a pre-formatted string
  time: string;
  location: string; // Corresponds to 'venue' from Firestore
  description: string;
  imageUrl: string;
  dataAiHint: string;
  detailsUrl?: string; // Corresponds to 'applyLink' from Firestore
}

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  let displayDate = event.date;
  try {
    // If date is in 'YYYY-MM-DD' format from Firestore, format it. Otherwise, use as is.
    if (event.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
       // Replace hyphens with slashes for better cross-browser compatibility with new Date()
      displayDate = format(new Date(event.date.replace(/-/g, '\/')), "MMMM d, yyyy");
    }
  } catch (e) {
    console.warn("Could not parse event date for formatting:", event.date, e);
    // displayDate remains event.date
  }


  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -5 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      className="h-full" 
    >
      <Card className="group flex flex-col overflow-hidden bg-card shadow-lg transition-all duration-300 hover:shadow-primary/20 rounded-2xl border border-border h-full">
        <div className="relative w-full h-48 sm:h-56 overflow-hidden">
          <Image
            src={event.imageUrl || `https://placehold.co/600x400/121212/7DF9FF.png?text=${encodeURIComponent(event.title.substring(0,10))}`}
            alt={event.title}
            fill
            style={{ objectFit: 'cover' }}
            className="transition-transform duration-500 group-hover:scale-105"
            data-ai-hint={event.dataAiHint || "event image"}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-4">
            <h2 className="font-orbitron text-xl sm:text-2xl font-bold text-white line-clamp-2">
              {event.title}
            </h2>
          </div>
        </div>
        <CardContent className="p-5 flex-grow flex flex-col">
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <CalendarDays className="mr-2 h-4 w-4 text-primary" />
            <span>{displayDate} at {event.time}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground mb-4">
            <MapPin className="mr-2 h-4 w-4 text-primary" />
            <span>{event.location}</span>
          </div>
          <CardDescription className="text-muted-foreground line-clamp-3 flex-grow mb-4">
            {event.description}
          </CardDescription>
        </CardContent>
        <CardFooter className="p-5 border-t border-border">
          {event.detailsUrl ? (
            <Button asChild variant="default" className="w-full group/button">
              <a href={event.detailsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center">
                <LinkIcon className="mr-2 h-4 w-4" /> {/* Changed icon */}
                Apply / View Details 
                <ArrowRight className="ml-auto h-4 w-4 transition-transform group-hover/button:translate-x-1" />
              </a>
            </Button>
          ) : (
            <Button variant="secondary" className="w-full" disabled>
              Details Coming Soon
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
