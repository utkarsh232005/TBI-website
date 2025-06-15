
"use client";

import { InfiniteMovingCards } from '@/components/ui/infinite-moving-cards';
import { motion } from 'framer-motion';
import { AuroraText } from "@/components/magicui/aurora-text";

const testimonialsData = [
  {
    id: '1',
    quote: 'RCEOM-TBI provided us with unparalleled mentorship and resources. Their network was instrumental in our early success and Series A funding.',
    name: 'Dr. Aris Thorne',
    title: 'CEO, QuantumLeap AI',
    avatarUrl: 'https://placehold.co/100x100/7DF9FF/121212.png?text=AT',
    companyLogoUrl: 'https://placehold.co/120x50/FFFFFF/121212.png?text=QAI+Logo',
    dataAiHintAvatar: "scientist portrait",
    dataAiHintLogo: "technology logo"
  },
  {
    id: '2',
    quote: 'The incubation program at RCEOM-TBI was a game-changer. We went from a concept to a market-ready product in record time, thanks to their support.',
    name: 'Lena Hanson',
    title: 'Founder, EcoSynth Solutions',
    avatarUrl: 'https://placehold.co/100x100/32CD32/121212.png?text=LH',
    companyLogoUrl: 'https://placehold.co/120x50/FFFFFF/121212.png?text=ESS+Logo',
    dataAiHintAvatar: "entrepreneur portrait",
    dataAiHintLogo: "eco logo"
  },
  {
    id: '3',
    quote: 'The hands-on guidance and strategic advice we received were invaluable. RCEOM-TBI truly understands the challenges startups face.',
    name: 'Raj Patel',
    title: 'CTO, NovaMed Devices',
    avatarUrl: 'https://placehold.co/100x100/FF2D55/121212.png?text=RP',
    companyLogoUrl: 'https://placehold.co/120x50/FFFFFF/121212.png?text=NMD+Logo',
    dataAiHintAvatar: "developer portrait",
    dataAiHintLogo: "medical tech logo"
  },
];

const sectionTitleVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};


export default function TestimonialsSection() {
  return (
    <motion.section 
      id="testimonials" 
      className="py-16 md:py-24 bg-background text-foreground"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">        <motion.div 
          className="text-center mb-12 md:mb-16"
          variants={sectionTitleVariants}
        >
          <AuroraText>Words From Our Innovators</AuroraText>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground sm:text-xl">
            Hear what founders say about their journey with RCEOM-TBI.
          </p>
        </motion.div>
        
        <motion.div 
          className="relative flex flex-col items-center justify-center overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        >
          <InfiniteMovingCards
            items={testimonialsData}
            direction="right"
            speed="slow"
          />
        </motion.div>
      </div>
    </motion.section>
  );
}
