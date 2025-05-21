"use client";

import { useRef, useEffect, useState } from 'react';
// import TestimonialCarousel, { type Testimonial } from '@/components/ui/testimonial-carousel'; // Old carousel
import { InfiniteMovingCards } from '@/components/ui/infinite-moving-cards'; // New component

// Testimonial data structure is compatible
const testimonialsData = [
  {
    id: '1',
    quote: 'InnoNexus provided us with unparalleled mentorship and resources. Their network was instrumental in our early success and Series A funding.',
    name: 'Dr. Aris Thorne',
    title: 'CEO, QuantumLeap AI',
    avatarUrl: 'https://placehold.co/100x100/7DF9FF/121212.png?text=AT',
    companyLogoUrl: 'https://placehold.co/120x50/FFFFFF/121212.png?text=QAI+Logo',
    dataAiHintAvatar: "scientist portrait",
    dataAiHintLogo: "technology logo"
  },
  {
    id: '2',
    quote: 'The incubation program at InnoNexus was a game-changer. We went from a concept to a market-ready product in record time, thanks to their support.',
    name: 'Lena Hanson',
    title: 'Founder, EcoSynth Solutions',
    avatarUrl: 'https://placehold.co/100x100/32CD32/121212.png?text=LH',
    companyLogoUrl: 'https://placehold.co/120x50/FFFFFF/121212.png?text=ESS+Logo',
    dataAiHintAvatar: "entrepreneur portrait",
    dataAiHintLogo: "eco logo"
  },
  {
    id: '3',
    quote: 'The hands-on guidance and strategic advice we received were invaluable. InnoNexus truly understands the challenges startups face.',
    name: 'Raj Patel',
    title: 'CTO, NovaMed Devices',
    avatarUrl: 'https://placehold.co/100x100/FF2D55/121212.png?text=RP',
    companyLogoUrl: 'https://placehold.co/120x50/FFFFFF/121212.png?text=NMD+Logo',
    dataAiHintAvatar: "developer portrait",
    dataAiHintLogo: "medical tech logo"
  },
];

export default function TestimonialsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => {
      if (sectionRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const animationClass = (delay: string = '0ms') => 
    `transition-all duration-700 ease-out ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}` + ` style="transition-delay: ${delay}"`;


  return (
    <section id="testimonials" ref={sectionRef} className="py-16 md:py-24 bg-background text-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-12 md:mb-16 ${animationClass()}`}>
          <h2 className="font-orbitron text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-primary">
            Words From Our Innovators
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground sm:text-xl">
            Hear what founders say about their journey with InnoNexus.
          </p>
        </div>
        
        <div 
          className={`relative flex flex-col items-center justify-center overflow-hidden ${animationClass('150ms')}`}
        >
          <InfiniteMovingCards
            items={testimonialsData}
            direction="right"
            speed="slow"
          />
        </div>
      </div>
    </section>
  );
}
