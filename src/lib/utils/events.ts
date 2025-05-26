import { format, isToday, isTomorrow, formatDistanceToNow } from 'date-fns';

export type EventStatus = 'pending' | 'approved' | 'rejected';

export interface EventDocument {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  status: EventStatus;
  registrationLink?: string;
  imageUrl?: string;
  applyLink?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export const getEventStatus = (dateString: string, timeString: string): string => {
  const eventDate = new Date(`${dateString}T${timeString}`);
  const now = new Date();
  
  if (isToday(eventDate)) return 'Today';
  if (isTomorrow(eventDate)) return 'Tomorrow';
  if (eventDate < now) return 'Past';
  return 'Upcoming';
};

export const formatEventDateTime = (dateString: string, timeString: string): string => {
  const eventDate = new Date(`${dateString}T${timeString}`);
  return format(eventDate, 'MMM d, yyyy h:mm a');
};

export const formatRelativeTime = (dateString: string): string => {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
};

export const filterEvents = (events: EventDocument[], query: string): EventDocument[] => {
  if (!query.trim()) return events;
  
  const searchTerm = query.toLowerCase().trim();
  return events.filter(event => 
    event.title.toLowerCase().includes(searchTerm) ||
    event.description.toLowerCase().includes(searchTerm) ||
    event.venue.toLowerCase().includes(searchTerm) ||
    event.status.toLowerCase().includes(searchTerm)
  );
};
