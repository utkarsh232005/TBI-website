
// src/app/events/page.tsx
import MainNavbar from '@/components/ui/main-navbar';
import Footer from '@/components/ui/footer';
import EventCard, { type Event } from '@/components/ui/event-card';

const eventsData: Event[] = [
  {
    id: '1',
    title: 'Innovate & Elevate: Startup Pitch Competition 2024',
    date: 'October 26, 2024',
    time: '10:00 AM - 4:00 PM',
    location: 'Main Auditorium, Tech Park',
    description: 'Join us for an exciting day of groundbreaking ideas as startups pitch their innovations to a panel of esteemed judges and investors. Network with industry leaders and witness the future of technology.',
    imageUrl: 'https://placehold.co/600x400/1A1A1A/7DF9FF.png',
    dataAiHint: 'startup pitch competition',
    detailsUrl: '#',
  },
  {
    id: '2',
    title: 'AI & The Future of Work: A Panel Discussion',
    date: 'November 15, 2024',
    time: '2:00 PM - 3:30 PM',
    location: 'Online Webinar',
    description: 'Explore the transformative impact of Artificial Intelligence on various industries and the evolving landscape of work. Our expert panel will discuss challenges, opportunities, and future trends.',
    imageUrl: 'https://placehold.co/600x400/121212/FF2D55.png',
    dataAiHint: 'AI webinar technology',
    detailsUrl: '#',
  },
  {
    id: '3',
    title: 'Sustainable Solutions Showcase',
    date: 'December 5, 2024',
    time: '1:00 PM - 5:00 PM',
    location: 'GreenTech Convention Center',
    description: 'Discover startups pioneering sustainable technologies and eco-friendly solutions. This showcase aims to connect innovators with investors and partners passionate about a greener future.',
    imageUrl: 'https://placehold.co/600x400/1E1E1E/32CD32.png',
    dataAiHint: 'sustainability eco tech',
    // detailsUrl: '#', // Example of event without details link
  },
   {
    id: '4',
    title: 'Founder\'s Networking Night',
    date: 'January 20, 2025',
    time: '6:00 PM - 9:00 PM',
    location: 'The Innovation Hub Rooftop',
    description: 'An exclusive evening for founders to connect, share experiences, and build valuable relationships in a relaxed atmosphere. Light refreshments will be served.',
    imageUrl: 'https://placehold.co/600x400/1A1A1A/BF5AF2.png',
    dataAiHint: 'networking event rooftop',
    detailsUrl: '#',
  },
];

export default function EventsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-poppins">
      <MainNavbar />
      <main className="flex-grow py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h1 className="font-orbitron text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-primary">
              Upcoming Events
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground sm:text-xl">
              Stay updated with our latest workshops, competitions, and networking opportunities.
            </p>
          </div>

          {eventsData && eventsData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-10">
              {eventsData.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground text-lg">
              No upcoming events scheduled at the moment. Please check back later.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
