import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, Clock, MapPin, ExternalLink, ChevronDown, ChevronUp, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { EventDocument, EventStatus } from '@/types/events';
import { formatEventDate, formatEventTime } from '@/lib/utils/event.utils';
import { StatusBadge } from './StatusBadge';
import { processImageUrl } from '@/lib/utils';

interface EventCardProps {
  event: EventDocument;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onEdit: (event: EventDocument) => void;
  onDelete: (id: string) => Promise<void>;
  onStatusChange: (id: string, status: EventStatus) => Promise<void>;
  className?: string;
}

export const EventCard = ({
  event,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onStatusChange,
  className,
}: EventCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const eventDate = new Date(event.date);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this event?')) {
      setIsDeleting(true);
      try {
        await onDelete(event.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleStatusChange = async (e: React.MouseEvent, status: EventStatus) => {
    e.stopPropagation();
    setIsUpdating(true);
    try {
      await onStatusChange(event.id, status);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <motion.div
      layout
      className={cn(
        'overflow-hidden rounded-2xl bg-gray-900/50 border border-gray-800/50 hover:border-indigo-500/30 transition-colors duration-200',
        className
      )}
    >      <div
      className="p-4 cursor-pointer flex items-center justify-between"
      onClick={() => onToggleExpand(event.id)}
    >
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            {event.imageUrl ? (<div className="h-12 w-12 rounded-lg overflow-hidden border border-gray-700">
              <img
                src={processImageUrl(event.imageUrl, event.title.substring(0, 3))}
                alt={event.title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  // Fallback to default icon if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="h-12 w-12 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400"><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                  }
                }}
              />
            </div>
            ) : (
              <div className="h-12 w-12 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <CalendarDays className="h-5 w-5" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-100">{event.title}</h3>
              <StatusBadge status={event.status} />
            </div>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                {formatEventDate(event.date)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatEventTime(event.time)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {event.venue}
              </span>
            </div>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-200 p-1">
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-gray-800/50">              <div className="prose prose-invert max-w-none text-sm text-gray-300">
              <p>{event.description}</p>
            </div>
              {event.imageUrl && (
                <div className="mt-4">
                  <img
                    src={processImageUrl(event.imageUrl, event.title)}
                    alt={event.title}
                    className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-700"
                    onError={(e) => {
                      // Hide image if it fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              {event.registrationLink && (
                <div className="mt-4 pt-4 border-t border-gray-800/50">
                  <div className="flex flex-wrap gap-3">
                    <a
                      href={event.registrationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Register Now
                    </a>
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-800/50 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    Created: {event.createdAt?.toDate
                      ? format(event.createdAt.toDate(), 'MMM d, yyyy')
                      : event.createdAt?.seconds
                        ? format(new Date(event.createdAt.seconds * 1000), 'MMM d, yyyy')
                        : 'N/A'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(event);
                    }}
                  >
                    <Edit className="h-3.5 w-3.5 mr-1.5" />
                    Edit
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-1.5 h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                        Delete
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
