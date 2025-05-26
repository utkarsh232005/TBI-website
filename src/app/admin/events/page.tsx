"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// Firebase
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  Timestamp,
  where,
  DocumentData
} from 'firebase/firestore';

// Date utilities
import { format, formatDistanceToNow, isToday, isTomorrow, isAfter, parseISO } from 'date-fns';

// Form handling
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import { 
  Calendar as CalendarIcon, 
  CalendarDays,
  Edit, 
  ExternalLink, 
  Loader2,
  Plus, 
  PlusCircle,
  Search, 
  Trash2,
  AlertCircle,
  MapPin, 
  Clock, 
  Trash,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types and Interfaces
type EventStatus = 'draft' | 'published' | 'archived';

interface EventDocument extends DocumentData {
  id: string;
  title: string;
  description: string;
  date: Timestamp | Date | string;
  time: string;
  venue: string;
  status: EventStatus;
  applyLink?: string;
  imageUrl?: string;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

// Form Schema
const eventFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  venue: z.string().min(1, 'Venue is required'),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  applyLink: z.string().url('Invalid URL').optional().or(z.literal('')),
  imageUrl: z.string().url('Invalid URL').optional().or(z.literal(''))
});

type EventFormValues = z.infer<typeof eventFormSchema>;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1]
    }
  },
  exit: { 
    opacity: 0, 
    y: -20 
  },
  hover: {
    y: -4,
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    transition: { duration: 0.2 }
  }
};

// Helper function to format event date
const formatEventDate = (date: Timestamp | Date | string): string => {
  if (date instanceof Timestamp) {
    return format(date.toDate(), 'PPP');
  } else if (date instanceof Date) {
    return format(date, 'PPP');
  } else {
    try {
      return format(parseISO(date), 'PPP');
    } catch (error) {
      return date;
    }
  }
};

// Main component
export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventDocument[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form handling
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      description: '',
      date: '',
      time: '',
      venue: '',
      status: 'draft',
      applyLink: '',
      imageUrl: ''
    }
  });

  // Fetch events on component mount
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const eventsCollection = collection(db, 'events');
      const q = query(eventsCollection, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const eventsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EventDocument[];
      
      setEvents(eventsData);
      setFilteredEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load events. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter events based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredEvents(events);
      return;
    }
    
    const queryLower = searchQuery.toLowerCase();
    const filtered = events.filter(event => (
      event.title?.toLowerCase().includes(queryLower) ||
      event.description?.toLowerCase().includes(queryLower) ||
      event.venue?.toLowerCase().includes(queryLower) ||
      formatEventDate(event.date).toLowerCase().includes(queryLower)
    ));
    
    setFilteredEvents(filtered);
  }, [searchQuery, events]);

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Handle form submission
  const onSubmit = async (data: EventFormValues) => {
    try {
      setIsSubmitting(true);
      
      const eventData = {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      const eventsCollection = collection(db, 'events');
      await addDoc(eventsCollection, eventData);
      
      console.log("Event created successfully");
      form.reset();
      setIsCreateDialogOpen(false);
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Delete event handler
  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'events', id));
      console.log("Event deleted successfully");
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-[#E0E0E0]">
      <motion.div 
        className="container mx-auto px-4 py-8"
        initial="hidden"
        animate="show"
        variants={containerVariants}
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Events Management</h1>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#4F46E5] hover:bg-[#4338CA]" suppressHydrationWarning>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Event
              </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-[600px] bg-[#1E1E1E] border-none rounded-2xl">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Fill in the details below to create a new event.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Event title" {...field} disabled={isSubmitting} suppressHydrationWarning />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Event description" 
                            className="min-h-[100px]" 
                            {...field} 
                            disabled={isSubmitting}
                            suppressHydrationWarning 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field} 
                              disabled={isSubmitting}
                              suppressHydrationWarning 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time</FormLabel>
                          <FormControl>
                            <Input 
                              type="time" 
                              {...field} 
                              disabled={isSubmitting}
                              suppressHydrationWarning 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="venue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Venue</FormLabel>
                        <FormControl>
                          <Input placeholder="Event location" {...field} disabled={isSubmitting} suppressHydrationWarning />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="applyLink"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apply Link (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com" {...field} disabled={isSubmitting} suppressHydrationWarning />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.jpg" {...field} disabled={isSubmitting} suppressHydrationWarning />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsCreateDialogOpen(false)}
                      disabled={isSubmitting}
                      suppressHydrationWarning
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-[#4F46E5] hover:bg-[#4338CA]"
                      disabled={isSubmitting}
                      suppressHydrationWarning
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Event'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 bg-[#1E1E1E] border-none rounded-xl"
            suppressHydrationWarning
          />
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-[#4F46E5]" />
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-red-400">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-6 h-6 mr-2" />
              <h2 className="text-lg font-semibold">Error</h2>
            </div>
            <p className="mb-4">{error}</p>
            <Button 
              variant="outline" 
              className="border-red-500/30 text-red-400 hover:bg-red-900/20"
              onClick={fetchEvents}
              suppressHydrationWarning
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20">
            <div className="mx-auto w-20 h-20 rounded-full bg-[#1E1E1E] flex items-center justify-center mb-4">
              <CalendarIcon className="w-10 h-10 text-gray-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No events found</h2>
            <p className="text-gray-400 mb-6">
              {searchQuery ? 'No events match your search criteria.' : 'Get started by creating your first event.'}
            </p>
            {!searchQuery && (
              <Button 
                className="bg-[#4F46E5] hover:bg-[#4338CA]"
                onClick={() => setIsCreateDialogOpen(true)}
                suppressHydrationWarning
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            )}
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  whileHover="hover"
                  custom={index}
                  layoutId={event.id}
                >
                  <Card className="h-full bg-[#1E1E1E] border-none rounded-xl shadow-lg overflow-hidden">
                    {event.imageUrl && (
                      <div className="w-full h-48 overflow-hidden">
                        <img 
                          src={event.imageUrl} 
                          alt={event.title} 
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{event.title}</CardTitle>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700"
                            onClick={() => {
                              // Edit functionality would go here
                            }}
                            suppressHydrationWarning
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-900/20"
                            onClick={() => handleDeleteEvent(event.id)}
                            suppressHydrationWarning
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center mt-1">
                        <Badge 
                          className={
                            event.status === 'published' ? 'bg-teal-500/20 text-teal-400 hover:bg-teal-500/30' :
                            event.status === 'draft' ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' :
                            'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
                          }
                        >
                          {event.status === 'published' ? 'Published' : 
                           event.status === 'draft' ? 'Draft' : 'Archived'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-400 line-clamp-3 mb-4">{event.description}</p>
                      <div className="flex flex-col space-y-2 text-sm text-gray-400">
                        <div className="flex items-center">
                          <CalendarDays className="mr-2 h-4 w-4" />
                          <span>{formatEventDate(event.date)}</span>
                        </div>
                        {event.time && (
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4" />
                            <span>{event.time}</span>
                          </div>
                        )}
                        {event.venue && (
                          <div className="flex items-center">
                            <MapPin className="mr-2 h-4 w-4" />
                            <span>{event.venue}</span>
                          </div>
                        )}
                        {event.applyLink && (
                          <div className="flex items-center">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            <a 
                              href={event.applyLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[#4F46E5] hover:underline"
                            >
                              Apply Link
                            </a>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
