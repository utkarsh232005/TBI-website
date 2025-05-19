"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  title: string;
  avatarUrl: string;
  companyLogoUrl?: string;
  dataAiHintAvatar?: string;
  dataAiHintLogo?: string;
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
}

export default function TestimonialCarousel({ testimonials }: TestimonialCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          // observer.unobserve(entry.target); // Keep observing if you want animations on re-scroll
        }
      },
      { threshold: 0.1 }
    );

    if (carouselRef.current) {
      observer.observe(carouselRef.current);
    }

    return () => {
      if (carouselRef.current) {
        observer.unobserve(carouselRef.current);
      }
    };
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1));
  };

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  const currentTestimonial = testimonials[currentIndex];

  return (
    <div ref={carouselRef} className="relative w-full max-w-2xl mx-auto">
      <Card className={`overflow-hidden bg-card shadow-xl transition-all duration-500 ease-in-out ${isInView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <CardContent className="p-8 text-center">
          <Quote className="h-12 w-12 text-primary mx-auto mb-6 transform -scale-x-100" />
          <p className="text-lg md:text-xl italic text-foreground mb-8 min-h-[100px] md:min-h-[120px]">
            "{currentTestimonial.quote}"
          </p>
          <div className="flex flex-col items-center">
            <Avatar className="h-20 w-20 mb-4 border-2 border-primary">
              <AvatarImage src={currentTestimonial.avatarUrl} alt={currentTestimonial.name} data-ai-hint={currentTestimonial.dataAiHintAvatar || "profile portrait"} />
              <AvatarFallback>{currentTestimonial.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <h4 className="font-poppins font-semibold text-xl text-foreground">{currentTestimonial.name}</h4>
            <p className="text-sm text-muted-foreground">{currentTestimonial.title}</p>
            {currentTestimonial.companyLogoUrl && (
              <div className="relative h-10 w-28 mt-2">
                <Image 
                  src={currentTestimonial.companyLogoUrl} 
                  alt={`${currentTestimonial.title.split(',')[1]?.trim() || 'Company'} logo`}
                  fill
                  style={{ objectFit: 'contain' }}
                  className="opacity-70"
                  data-ai-hint={currentTestimonial.dataAiHintLogo || "company logo"}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {testimonials.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2  md:-translate-x-full rounded-full bg-card hover:bg-primary hover:text-primary-foreground"
            onClick={handlePrev}
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 md:translate-x-full rounded-full bg-card hover:bg-primary hover:text-primary-foreground"
            onClick={handleNext}
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}
       <div className="flex justify-center mt-6 space-x-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-3 w-3 rounded-full transition-colors ${
              currentIndex === index ? 'bg-primary' : 'bg-muted hover:bg-primary/50'
            }`}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
