"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronDown } from 'lucide-react';

const NUM_PARTICLES = 30;

export default function HeroSection() {
  const [particles, setParticles] = useState<JSX.Element[]>([]);
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
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    const newParticles = Array.from({ length: NUM_PARTICLES }).map((_, i) => {
      const size = Math.random() * 3 + 1; // size between 1px and 4px
      const xStart = Math.random() * 100; // vw
      const xEnd = Math.random() * 100; // vw
      const scale = Math.random() * 0.5 + 0.5; // scale between 0.5 and 1
      const animationDuration = Math.random() * 15 + 10; // duration between 10s and 25s
      const animationDelay = Math.random() * 10; // delay up to 10s

      return (
        <div
          key={i}
          className="particle"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            left: `${Math.random() * 100}%`, // Initial horizontal position spread
            animationDuration: `${animationDuration}s`,
            animationDelay: `-${animationDelay}s`, // Negative delay starts part-way through
            // @ts-ignore CSS custom properties
            '--x-start': `${xStart}vw`,
            '--x-end': `${xEnd}vw`,
            '--scale': scale,
          }}
        />
      );
    });
    setParticles(newParticles);
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background text-foreground"
    >
      <div className="particles">
        {particles}
      </div>
      <div className={`relative z-10 mx-auto max-w-3xl p-8 text-center transition-all duration-1000 ease-out ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <h1 className="font-orbitron text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Empowering
          </span>
          the Next Generation of Innovators
        </h1>
        <p className="mt-6 text-lg text-muted-foreground sm:text-xl md:text-2xl">
          Join our ecosystem of visionaries, creators, and successful startups.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="font-poppins font-semibold group">
            <Link href="#contact">
              Apply for Incubation
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="font-poppins font-semibold group border-primary text-primary hover:bg-primary/10 hover:text-primary">
            <Link href="#startups">
              See Success Stories
              <ChevronDown className="ml-2 h-5 w-5 transition-transform group-hover:translate-y-1" />
            </Link>
          </Button>
        </div>
      </div>
      <div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-primary opacity-0"
        style={{ animationDelay: '2s', animationFillMode: 'forwards' }}
      >
        <ChevronDown size={32} />
      </div>
    </section>
  );
}
