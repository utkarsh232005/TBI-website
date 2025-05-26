import { format, isToday, isTomorrow, isAfter, isBefore, addDays } from 'date-fns';
import { EventDocument, EventStatus } from '@/types/events';

export const formatEventDate = (dateString: string | Date) => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  if (isToday(date)) {
    return 'Today';
  }
  
  if (isTomorrow(date)) {
    return 'Tomorrow';
  }
  
  return format(date, 'EEEE, MMM d, yyyy');
};

export const formatEventTime = (timeString: string) => {
  // Convert 24h to 12h format
  const [hours, minutes] = timeString.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

export const getStatusVariant = (status: EventStatus) => {
  switch (status) {
    case 'approved':
      return 'bg-teal-500/20 text-teal-400 border-teal-500/30';
    case 'rejected':
      return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    case 'pending':
    default:
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  }
};

export const filterEvents = (
  events: EventDocument[], 
  filters: {
    searchQuery?: string;
    status?: EventStatus | 'all';
    dateRange?: { from?: Date; to?: Date };
  } = {}
) => {
  let result = [...events];
  
  const { searchQuery, status = 'all', dateRange = {} } = filters;
  const { from: dateFrom, to: dateTo } = dateRange;
  
  // Apply search
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    result = result.filter(event => 
      event.title.toLowerCase().includes(query) ||
      event.description.toLowerCase().includes(query) ||
      event.venue.toLowerCase().includes(query)
    );
  }
  
  // Apply status filter
  if (status !== 'all') {
    result = result.filter(event => event.status === status);
  }
  
  // Apply date range filter
  if (dateFrom) {
    result = result.filter(event => {
      const eventDate = new Date(event.date);
      return isAfter(eventDate, dateFrom);
    });
  }
  
  if (dateTo) {
    result = result.filter(event => {
      const eventDate = new Date(event.date);
      return isBefore(eventDate, addDays(dateTo, 1)); // Include the end date
    });
  }
  
  return result;
};

export const sortEvents = (events: EventDocument[], sortBy: 'date' | 'title' = 'date', order: 'asc' | 'desc' = 'desc') => {
  return [...events].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return order === 'asc' ? dateA - dateB : dateB - dateA;
    } else {
      // Sort by title
      return order === 'asc' 
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    }
  });
};
