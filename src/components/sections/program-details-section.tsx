
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button'; 
import Link from 'next/link'; 
import { CheckCircle2, Users, DollarSign, CalendarDays, Network, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const programData = [
  {
    id: 'application',
    title: 'Application Process',
    Icon: CalendarDays,
    content: 'Our application process is streamlined and transparent. Submit your innovative idea, a brief business plan, and your team profile. Selected applicants will be invited for an interview and pitch session. We look for passion, viability, and a strong team.',
  },
  {
    id: 'mentorship',
    title: 'Mentorship Programs',
    Icon: Users,
    contentP1: 'Gain access to a network of experienced mentors, industry experts, and successful entrepreneurs. Our tailored mentorship programs cover areas like product development, market strategy, fundraising, and operational excellence to guide you at every step.',
  },
  {
    id: 'funding',
    title: 'Funding Opportunities',
    Icon: DollarSign,
    content: 'RCEOM-TBI provides seed funding for promising startups and facilitates connections with angel investors and venture capital firms. We help you prepare your pitch deck and financial projections to secure the capital needed for growth.',
  },
  {
    id: 'networking',
    title: 'Networking Events',
    Icon: Network,
    content: 'Participate in exclusive networking events, workshops, and demo days. Connect with potential partners, clients, investors, and fellow innovators. Build valuable relationships that can accelerate your startup\'s journey.',
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
      className="py-16 md:py-24 bg-card text-foreground"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={sectionVariants}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="text-center mb-12 md:mb-16" variants={itemVariants}>
          <h2 className="font-orbitron text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-primary">
            Our Program
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground sm:text-xl">
            Discover how RCEOM-TBI can fuel your startup's growth and success.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {programData.map((item) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
              >
                <AccordionItem value={item.id} className="border border-border rounded-lg shadow-md hover:shadow-primary/20 transition-shadow bg-background">
                  <AccordionTrigger className="p-6 text-lg font-poppins font-medium hover:no-underline text-left">
                    <div className="flex items-center">
                      <item.Icon className="h-6 w-6 mr-3 text-primary" />
                      {item.title}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-6 pt-0 text-muted-foreground">
                    {item.id === 'mentorship' ? (
                      <>
                        <p className="mb-4">{item.contentP1}</p>
                        <Button asChild variant="default" size="lg" className="group">
                          <Link href="/mentors">
                            See Our Mentors
                            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                          </Link>
                        </Button>
                      </>
                    ) : (
                      item.content
                    )}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </div>
    </motion.section>
  );
}
