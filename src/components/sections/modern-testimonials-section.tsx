"use client";

import { motion } from 'framer-motion';
import { InfiniteMovingCards } from '@/components/ui/infinite-moving-cards';

const testimonials = [
  {
    quote: "The incubation program transformed our vision into reality. The mentorship and resources are unparalleled.",
    name: "FAJAR",
    title: "Founder & CEO, Euphoriya"
  },
  {
    quote: "TBI's network opened doors we didn't even know existed. Best decision we made for our sustainability startup.",
    name: "Sneha Patel",
    title: "Co-founder, EcoInnovate"
  },
  {
    quote: "From prototype to product, TBI's technical expertise and infrastructure support was crucial for our development.",
    name: "Arjun Singh",
    title: "CTO, AI Dynamics"
  },
  {
    quote: "The funding support and investor connections were invaluable for our growth trajectory. We secured our seed round within 6 months.",
    name: "Rahul Mehta",
    title: "CEO, TechFlow Solutions"
  },
  {
    quote: "The legal and compliance support saved us months of bureaucratic hassles. A must for any serious startup.",
    name: "Kavya Sharma",
    title: "Founder, HealthTech Pro"
  }
];

export default function ModernTestimonialsSection() {
  return (
    <section className="py-20 bg-background dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center rounded-full bg-primary/10 px-6 py-2 text-sm font-medium text-primary ring-1 ring-primary/20 mb-4">
            Success Stories
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            What Our{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              Founders Say
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Real stories from founders who have accelerated their journey with our support.
          </p>
        </motion.div>

        <div className="relative flex flex-col items-center justify-center">
          <InfiniteMovingCards
            items={testimonials}
            direction="right"
            speed="slow"
          />
        </div>
      </div>
    </section>
  );
}
