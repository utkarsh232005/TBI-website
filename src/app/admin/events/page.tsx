"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from './events.module.css';

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
  RefreshCw,
  X
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
      
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 w-full flex flex-col items-center py-10 px-2">
        <div className="w-full max-w-6xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
            <div className="px-8 pt-8 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 rounded-full p-3 flex items-center justify-center">
                  <CalendarDays className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="admin-heading-2 mb-1">Events Management</h1>
                  <p className="admin-caption">Create, manage and organize your upcoming events</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 md:flex-shrink-0">
                <Button 
                  variant="outline" 
                  onClick={fetchEvents}
                  className="bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 focus:ring-2 focus:ring-blue-200 rounded-lg shadow-sm px-5 py-2 font-medium transition"
                  suppressHydrationWarning
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow px-5 py-2 font-medium transition w-full sm:w-auto" suppressHydrationWarning>
                      <PlusCircle className="mr-2 h-5 w-5" /> Add New Event
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] bg-white border border-gray-200 shadow-lg rounded-xl">
                    <DialogHeader>
                      <DialogTitle className="admin-heading-4 flex items-center gap-3">
                        <div className="bg-blue-100 text-blue-700 border border-blue-200 rounded-lg w-10 h-10 flex items-center justify-center">
                          📅
                        </div>
                        Create New Event
                      </DialogTitle>
                      <DialogDescription className="admin-body-small">
                        Fill in the details below to add a new event to the platform.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2 pl-3">
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
                        
                        <DialogFooter className="mt-6">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsCreateDialogOpen(false)}
                            disabled={isSubmitting}
                            className="border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 transition-colors"
                            suppressHydrationWarning
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
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
            </div>
          </div>

          {/* Search Section */}
          <div className="bg-white rounded-2xl shadow border border-gray-200">
            <div className="p-6">
              <div className="relative max-w-md mx-auto md:mx-0">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-blue-500" />
                </div>
                <Input
                  type="text"
                  placeholder="Search events by title, venue, or date..."
                  className="pl-12 h-12 text-base border-gray-200 focus:border-blue-400 focus:ring-blue-300 shadow-sm rounded-xl bg-white focus:bg-white transition-all duration-300 w-full"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  suppressHydrationWarning
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-100 rounded-r-xl transition-colors"
                    suppressHydrationWarning
                  >
                    <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Content Section */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="p-6">
              {loading ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-blue-100 text-blue-700 border border-blue-200 rounded-lg w-10 h-10 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                    <span className="text-lg font-semibold text-gray-700">Loading events...</span>
                  </div>
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-4 rounded-lg bg-gray-50 border border-gray-200 shadow-sm mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="h-16 w-16 rounded-lg bg-gray-200 flex-shrink-0"></div>
                        <div className="space-y-3 flex-1 min-w-0">
                          <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
                          <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                          <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="border border-red-200 bg-red-50 rounded-xl">
                  <div className="flex items-start space-x-4 p-6">
                    <div className="bg-red-100 text-red-700 border border-red-200 rounded-lg w-10 h-10 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-red-800 mb-2">Error loading events</h3>
                      <p className="text-red-600 mb-4 break-words">{error}</p>
                      <Button
                        onClick={fetchEvents}
                        className="bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
                        suppressHydrationWarning
                      >
                        <RefreshCw className="mr-2 h-4 w-4" /> Try Again
                      </Button>
                    </div>
                  </div>
                </div>
              ) : filteredEvents.length === 0 ? (
                <motion.div
                  variants={itemVariants}
                  className="bg-white border-2 border-dashed border-gray-300 rounded-xl text-center py-16"
                >
                  <div className="max-w-md mx-auto">
                    <div className="bg-blue-100 text-blue-700 border border-blue-200 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                      <CalendarIcon className="h-10 w-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-700 mb-2">No events found</h3>
                    <p className="text-lg text-gray-500 mb-6">
                      {searchQuery ? 'Try a different search term' : 'Get started by adding a new event'}
                    </p>
                    {!searchQuery && (
                      <Button
                        onClick={() => setIsCreateDialogOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
                        suppressHydrationWarning
                      >
                        <PlusCircle className="mr-2 h-5 w-5" />
                        Add Your First Event
                      </Button>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  className="space-y-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      {searchQuery ? (
                        <>
                          <Search className="h-5 w-5 text-blue-600" />
                          <span>Search Results</span>
                        </>
                      ) : (
                        <>
                          <CalendarDays className="h-5 w-5 text-blue-600" />
                          <span>All Events</span>
                        </>
                      )}
                    </h2>
                    <div className="bg-green-100 text-green-700 border border-green-200 px-3 py-1.5 rounded-full font-semibold text-sm flex items-center">
                      <span className="mr-1">✨</span>
                      {filteredEvents.length} {filteredEvents.length === 1 ? 'Result' : 'Results'}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                      {filteredEvents.map((event, index) => (
                        <motion.div
                          key={event.id}
                          variants={itemVariants}
                          initial="hidden"
                          animate="show"
                          exit="exit"
                          custom={index}
                          layoutId={event.id}
                        >
                          <Card className="h-full bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
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
                                <CardTitle className="text-xl text-gray-900">{event.title}</CardTitle>
                                <div className="flex gap-1">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
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
                                    className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
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
                                    event.status === 'published' ? 'bg-green-100 text-green-700 border border-green-200' :
                                    event.status === 'draft' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                                    'bg-gray-100 text-gray-700 border border-gray-200'
                                  }
                                >
                                  {event.status === 'published' ? 'Published' : 
                                  event.status === 'draft' ? 'Draft' : 'Archived'}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-gray-600 line-clamp-3 mb-4">{event.description}</p>
                              <div className="flex flex-col space-y-2 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <div className="bg-blue-100 text-blue-700 border border-blue-200 rounded-lg w-6 h-6 flex items-center justify-center mr-2">
                                    <CalendarDays className="h-3 w-3" />
                                  </div>
                                  <span>{formatEventDate(event.date)}</span>
                                </div>
                                {event.time && (
                                  <div className="flex items-center">
                                    <div className="bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg w-6 h-6 flex items-center justify-center mr-2">
                                      <Clock className="h-3 w-3" />
                                    </div>
                                    <span>{event.time}</span>
                                  </div>
                                )}
                                {event.venue && (
                                  <div className="flex items-center">
                                    <div className="bg-purple-100 text-purple-700 border border-purple-200 rounded-lg w-6 h-6 flex items-center justify-center mr-2">
                                      <MapPin className="h-3 w-3" />
                                    </div>
                                    <span>{event.venue}</span>
                                  </div>
                                )}
                                {event.applyLink && (
                                  <div className="flex items-center mt-3">
                                    <a 
                                      href={event.applyLink} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 hover:underline"
                                    >
                                      Apply Now
                                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                    </a>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
