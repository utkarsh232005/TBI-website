
// src/components/ui/event-card.tsx
"use client";

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, MapPin, ArrowRight, Link as LinkIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns'; 
import { processImageUrl } from '@/lib/utils';

export interface Event {
  id: string;
  title: string;
  date: string; 
  time: string;
  location: string; 
  description: string;
  imageUrl: string;
  dataAiHint: string;
  detailsUrl?: string; 
}

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  let displayDate = event.date;
  try {
    if (event.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      displayDate = format(new Date(event.date.replace(/-/g, '\/')), "MMMM d, yyyy");
    }
  } catch (e) {
    console.warn("Could not parse event date for formatting:", event.date, e);
  }


  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -5 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      className="h-full" 
    >
      <Card className="group flex flex-col overflow-hidden bg-card shadow-lg transition-all duration-300 hover:shadow-accent/20 rounded-2xl border border-border h-full">        <div className="relative w-full h-48 sm:h-56 overflow-hidden">          <Image
            src={processImageUrl(event.imageUrl, event.title.substring(0,10))}
            alt={event.title}
            fill
            style={{ objectFit: 'cover' }}
            className="transition-transform duration-500 group-hover:scale-105"
            data-ai-hint={event.dataAiHint || "event image"}
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              const target = e.target as HTMLImageElement;
              target.src = `https://placehold.co/600x400/121212/7DF9FF.png?text=${encodeURIComponent(event.title.substring(0,10))}`;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-4">
            <h2 className="font-montserrat text-xl sm:text-2xl font-bold text-white line-clamp-2">
              {event.title}
            </h2>
          </div>
        </div>
        <CardContent className="p-5 flex-grow flex flex-col">
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <CalendarDays className="mr-2 h-4 w-4 text-foreground" /> {/* Icon color to white */}
            <span>{displayDate} at {event.time}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground mb-4">
            <MapPin className="mr-2 h-4 w-4 text-foreground" /> {/* Icon color to white */}
            <span>{event.location}</span>
          </div>
          <CardDescription className="text-muted-foreground line-clamp-3 flex-grow mb-4">
            {event.description}
          </CardDescription>
        </CardContent>
        <CardFooter className="p-5 border-t border-border">
          {event.detailsUrl ? (
            <Button asChild variant="default" className="w-full group/button bg-accent hover:bg-accent/90">
              <a href={event.detailsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center">
                <LinkIcon className="mr-2 h-4 w-4" />
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
