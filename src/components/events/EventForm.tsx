import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarDays, Clock, MapPin, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { cn } from '@/lib/utils';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { eventFormSchema, EventFormValues } from '@/schemas/event.schema';
import { EventStatus } from '@/types/events';

interface EventFormProps {
  defaultValues?: Partial<EventFormValues>;
  onSubmit: (data: EventFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  submitButtonText?: string;
  className?: string;
}

export const EventForm = ({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
  submitButtonText = 'Create Event',
  className,
}: EventFormProps) => {
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      description: '',
      date: new Date(),
      time: '19:00',
      venue: '',
      status: 'pending',
      registrationLink: '',
      imageUrl: '',
      ...defaultValues,
    },
  });

  const [date, setDate] = useState<Date | undefined>(
    defaultValues?.date || new Date()
  );

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      form.setValue('date', selectedDate, { shouldValidate: true });
    }
  };

  const handleSubmit = async (data: EventFormValues) => {
    try {
      await onSubmit(data);
    } catch (error) {
      // Error handling is done in the parent component
      console.error('Form submission error:', error);
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className={cn('space-y-6', className)}
    >
      <div className="space-y-4">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Event Title *</Label>
          <Input
            id="title"
            placeholder="Enter event title"
            {...form.register('title')}
            className={cn('bg-gray-900/50 border-gray-700', {
              'border-red-500/50': form.formState.errors.title,
            })}
          />
          {form.formState.errors.title && (
            <p className="text-sm text-red-500">
              {form.formState.errors.title.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            placeholder="Enter event description"
            rows={4}
            {...form.register('description')}
            className={cn('bg-gray-900/50 border-gray-700', {
              'border-red-500/50': form.formState.errors.description,
            })}
          />
          {form.formState.errors.description && (
            <p className="text-sm text-red-500">
              {form.formState.errors.description.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date */}
          <div className="space-y-2">
            <Label>Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal bg-gray-900/50 border-gray-700 text-white hover:bg-gray-800',
                    !date && 'text-muted-foreground',
                    form.formState.errors.date && 'border-red-500/50'
                  )}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-gray-900 border-gray-700">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  initialFocus
                  className="bg-gray-900 text-white"
                  classNames={{
                    day_selected: 'bg-indigo-600 hover:bg-indigo-700 text-white',
                    day_today: 'bg-gray-800 text-white',
                    day_range_middle: 'bg-gray-700 text-white',
                    day_hidden: 'invisible',
                  }}
                />
              </PopoverContent>
            </Popover>
            {form.formState.errors.date && (
              <p className="text-sm text-red-500">
                {form.formState.errors.date.message}
              </p>
            )}
          </div>

          {/* Time */}
          <div className="space-y-2">
            <Label htmlFor="time">Time *</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Clock className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="time"
                type="time"
                className={cn('pl-10 bg-gray-900/50 border-gray-700', {
                  'border-red-500/50': form.formState.errors.time,
                })}
                {...form.register('time')}
              />
            </div>
            {form.formState.errors.time && (
              <p className="text-sm text-red-500">
                {form.formState.errors.time.message}
              </p>
            )}
          </div>
        </div>

        {/* Venue */}
        <div className="space-y-2">
          <Label htmlFor="venue">Venue *</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <MapPin className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              id="venue"
              placeholder="Enter event venue"
              className={cn('pl-10 bg-gray-900/50 border-gray-700', {
                'border-red-500/50': form.formState.errors.venue,
              })}
              {...form.register('venue')}
            />
          </div>
          {form.formState.errors.venue && (
            <p className="text-sm text-red-500">
              {form.formState.errors.venue.message}
            </p>
          )}
        </div>

        {/* Registration Link */}
        <div className="space-y-2">
          <Label htmlFor="registrationLink">Registration Link</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <LinkIcon className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              id="registrationLink"
              type="url"
              placeholder="https://example.com/register"
              className="pl-10 bg-gray-900/50 border-gray-700"
              {...form.register('registrationLink')}
            />
          </div>
          {form.formState.errors.registrationLink && (
            <p className="text-sm text-red-500">
              {form.formState.errors.registrationLink.message}
            </p>
          )}
        </div>

        {/* Image URL */}
        <div className="space-y-2">
          <Label htmlFor="imageUrl">Image URL</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <ImageIcon className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              id="imageUrl"
              type="url"
              placeholder="https://example.com/image.jpg"
              className="pl-10 bg-gray-900/50 border-gray-700"
              {...form.register('imageUrl')}
            />
          </div>
          {form.formState.errors.imageUrl && (
            <p className="text-sm text-red-500">
              {form.formState.errors.imageUrl.message}
            </p>
          )}
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            onValueChange={(value) =>
              form.setValue('status', value as EventStatus)
            }
            defaultValue={form.getValues('status')}
          >
            <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700 text-white">
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="border-gray-700 text-white hover:bg-gray-800"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {submitButtonText.includes('Update') ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            submitButtonText
          )}
        </Button>
      </div>
    </form>
  );
};
