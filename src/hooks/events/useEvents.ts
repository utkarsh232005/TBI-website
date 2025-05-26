import { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, getDocs, addDoc, doc, deleteDoc, updateDoc, Timestamp, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { EventDocument, EventStatus } from '@/types/events';
import { useToast } from '@/components/ui/use-toast';

export const useEvents = () => {
  const [events, setEvents] = useState<EventDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch all events
  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const eventsRef = collection(db, 'events');
      const q = query(eventsRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const eventsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EventDocument[];
      
      setEvents(eventsData);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to load events',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Create a new event
  const createEvent = async (data: Omit<EventDocument, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const eventData = {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'events'), eventData);
      
      toast({
        title: 'Success',
        description: 'Event created successfully',
      });
      
      await fetchEvents();
      return docRef.id;
    } catch (err) {
      console.error('Error creating event:', err);
      toast({
        title: 'Error',
        description: 'Failed to create event',
        variant: 'destructive',
      });
      throw err;
    }
  };

  // Update an existing event
  const updateEvent = async (id: string, data: Partial<EventDocument>) => {
    try {
      await updateDoc(doc(db, 'events', id), {
        ...data,
        updatedAt: Timestamp.now(),
      });
      
      toast({
        title: 'Success',
        description: 'Event updated successfully',
      });
      
      await fetchEvents();
    } catch (err) {
      console.error('Error updating event:', err);
      toast({
        title: 'Error',
        description: 'Failed to update event',
        variant: 'destructive',
      });
      throw err;
    }
  };

  // Delete an event
  const deleteEvent = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'events', id));
      
      toast({
        title: 'Success',
        description: 'Event deleted successfully',
      });
      
      await fetchEvents();
    } catch (err) {
      console.error('Error deleting event:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete event',
        variant: 'destructive',
      });
      throw err;
    }
  };

  // Update event status
  const updateEventStatus = async (id: string, status: EventStatus) => {
    return updateEvent(id, { status });
  };

  // Filter events by status
  const getEventsByStatus = (status: EventStatus) => {
    return events.filter(event => event.status === status);
  };

  // Initial fetch
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    isLoading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    updateEventStatus,
    getEventsByStatus,
    refreshEvents: fetchEvents,
  };
};
