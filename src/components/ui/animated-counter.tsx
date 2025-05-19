"use client";

import { useEffect, useState, useRef } from 'react';

interface AnimatedCounterProps {
  targetValue: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}

export default function AnimatedCounter({
  targetValue,
  duration = 2000,
  className,
  suffix = '',
  prefix = ''
}: AnimatedCounterProps) {
  const [currentValue, setCurrentValue] = useState(0);
  const counterRef = useRef<HTMLSpanElement>(null);
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

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => {
      if (counterRef.current) {
        observer.unobserve(counterRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      setCurrentValue(Math.floor(targetValue * percentage));

      if (progress < duration) {
        requestAnimationFrame(step);
      } else {
        setCurrentValue(targetValue); // Ensure final value is exact
      }
    };

    requestAnimationFrame(step);
  }, [targetValue, duration, isInView]);

  return (
    <span ref={counterRef} className={className}>
      {prefix}{currentValue.toLocaleString()}{suffix}
    </span>
  );
}
