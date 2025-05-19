"use client";

import { useRef, useEffect, useState } from 'react';
import AnimatedCounter from '@/components/ui/animated-counter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UsersRound, TrendingUp, Rocket, Lightbulb, Goal } from 'lucide-react';

const stats = [
  { id: 1, value: 50, label: 'Startups Mentored', Icon: Rocket, suffix: '+' },
  { id: 2, value: 10, label: 'Funding Raised (Millions)', Icon: TrendingUp, prefix: '$', suffix: 'M+' },
  { id: 3, value: 100, label: 'Mentors & Experts', Icon: UsersRound, suffix: '+' },
];

const missionVision = [
  {
    Icon: Lightbulb,
    title: "Our Vision",
    description: "To be the leading catalyst for groundbreaking innovation, fostering a global community where visionary ideas transform into impactful realities."
  },
  {
    Icon: Goal,
    title: "Our Mission",
    description: "To empower early-stage startups by providing exceptional mentorship, strategic resources, and a supportive ecosystem, enabling them to achieve sustainable growth and success."
  }
];

export default function AboutSection() {
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

  const animationClass = (delay: string) => 
    `transition-all duration-700 ease-out ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`;

  return (
    <section id="about" ref={sectionRef} className="py-16 md:py-24 bg-background text-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-12 md:mb-16 ${animationClass('delay-0')}`}>
          <h2 className="font-orbitron text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-primary">
            About InnoNexus
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground sm:text-xl">
            We are dedicated to nurturing the brightest minds and innovative ideas, transforming them into successful ventures that shape the future.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 md:mb-16">
          {missionVision.map((item, index) => (
            <div key={item.title} className={`${animationClass(`delay-${(index + 1) * 100}ms`)}`}>
              <Card className="h-full bg-card shadow-xl hover:shadow-primary/20 transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                  <item.Icon className="h-10 w-10 text-primary" />
                  <CardTitle className="font-orbitron text-2xl text-card-foreground">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat, index) => (
            <div key={stat.id} className={`${animationClass(`delay-${(index + 3) * 100}ms`)}`}>
              <Card className="text-center bg-card shadow-xl hover:shadow-accent/20 transition-shadow duration-300 p-6">
                <CardContent className="flex flex-col items-center justify-center">
                  <stat.Icon className="h-12 w-12 mb-4 text-accent" />
                  <AnimatedCounter
                    targetValue={stat.value}
                    className="font-orbitron text-4xl font-bold text-foreground"
                    suffix={stat.suffix}
                    prefix={stat.prefix}
                  />
                  <p className="mt-2 text-lg text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
