
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileText, Users, DollarSign, Network, ArrowRight, CheckCircle2, Lightbulb, Target } from 'lucide-react';
import { motion } from 'framer-motion';

const programFeatures = [
  {
    id: 'application',
    Icon: FileText,
    title: 'Streamlined Application',
    description: 'Our application process is straightforward. Submit your idea, business plan, and team profile. We value passion, viability, and strong teams.',
    color: "text-sky-400", // Example color, maps to text-accent
    bgColor: "bg-sky-400/10",
  },
  {
    id: 'mentorship',
    Icon: Users,
    title: 'Expert Mentorship',
    description: 'Access experienced mentors and industry experts. Our tailored programs cover product development, market strategy, fundraising, and more.',
    buttonText: 'See Our Mentors',
    buttonLink: '/mentors',
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
  },
  {
    id: 'funding',
    Icon: DollarSign,
    title: 'Funding Pathways',
    description: 'We provide seed funding and connect you with angel investors and VCs. We help prepare your pitch and financial projections.',
    color: "text-lime-400",
    bgColor: "bg-lime-400/10",
  },
  {
    id: 'networking',
    Icon: Network,
    title: 'Vibrant Networking',
    description: 'Join exclusive events, workshops, and demo days. Connect with partners, clients, investors, and fellow innovators to accelerate your journey.',
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
  },
];

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function ProgramDetailsSection() {
  return (
    <motion.section
      id="program"
      className="py-16 md:py-24 bg-background text-foreground" // Changed to bg-background
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={sectionVariants}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="text-center mb-12 md:mb-16" variants={itemVariants}>
          <h2 className="font-montserrat text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-accent">
            Program Highlights
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground sm:text-xl">
            Discover how RCEOM-TBI fuels your startup's growth and success with these key features.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {programFeatures.map((feature) => (
            <motion.div
              key={feature.id}
              variants={itemVariants}
              className="h-full"
            >
              <Card className="flex flex-col h-full bg-card shadow-xl hover:shadow-accent/20 transition-shadow duration-300 rounded-2xl border border-border overflow-hidden">
                <CardHeader className="p-6">
                  <div className={`mb-4 inline-flex items-center justify-center rounded-lg p-3 ${feature.bgColor}`}>
                    <feature.Icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <CardTitle className="font-orbitron text-2xl text-card-foreground">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0 flex-grow">
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
                {feature.buttonText && feature.buttonLink && (
                  <div className="p-6 pt-0 mt-auto">
                    <Button asChild variant="default" size="lg" className="w-full group bg-accent hover:bg-accent/90 text-accent-foreground">
                      <Link href={feature.buttonLink}>
                        {feature.buttonText}
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
