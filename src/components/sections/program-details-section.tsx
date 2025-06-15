"use client";

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle2, Users,FileText, DollarSign, HandCoins, IndianRupee, Lightbulb, Landmark, CalendarDays, Network, ArrowRight, Rocket, Star, CreditCard, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { AuroraText } from "@/components/magicui/aurora-text";
import { AnimatedBeam } from "@/components/magicui/animated-beam";
import { useRef, useEffect } from 'react';

const programFeatures = [
  {
    id: 'application',
    Icon: FileText,
    title: 'Streamlined Application',
    description: 'Our application process is straightforward. Submit your idea, business plan, and team profile. We value passion, viability, and strong teams.',
    color: "text-sky-400",
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
    title: 'Funding Opportunities',
    Icon: IndianRupee,
    content: 'RCEOM-TBI provides seed funding for promising startups and facilitates connections with angel investors and venture capital firms. We help you prepare your pitch deck and financial projections to secure the capital needed for growth.',
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
  const containerRef = useRef<HTMLDivElement>(null);
  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);
  // Refs for networking animation
  const networkingContainerRef = useRef<HTMLDivElement>(null);
  const networkingFromRef = useRef<HTMLDivElement>(null);
  const networkingCenterRef = useRef<HTMLDivElement>(null);
  const networkingTo1Ref = useRef<HTMLDivElement>(null);
  const networkingTo2Ref = useRef<HTMLDivElement>(null);
  const networkingTo3Ref = useRef<HTMLDivElement>(null);
  const networkingTo4Ref = useRef<HTMLDivElement>(null);
  // Refs for mentorship animation
  const mentorshipContainerRef = useRef<HTMLDivElement>(null);
  const mentorshipUserRef = useRef<HTMLDivElement>(null);
  const mentorshipMentorRef = useRef<HTMLDivElement>(null);

  // Refs for funding animation
  const fundingContainerRef = useRef<HTMLDivElement>(null);
  const fundingCenterRef = useRef<HTMLDivElement>(null);
  const fundingFrom1Ref = useRef<HTMLDivElement>(null);
  const fundingFrom2Ref = useRef<HTMLDivElement>(null);
  const fundingFrom3Ref = useRef<HTMLDivElement>(null);
  const fundingFrom4Ref = useRef<HTMLDivElement>(null);
  const fundingFrom5Ref = useRef<HTMLDivElement>(null);
  const fundingToRef = useRef<HTMLDivElement>(null);

  // Function to add glow effect
  const addGlowEffect = (ref: React.RefObject<HTMLDivElement>, isCenter = false) => {
    if (ref.current) {
      ref.current.classList.add(isCenter ? 'node-glow-center' : 'node-glow');
      // Remove the class after animation completes to allow re-triggering
      setTimeout(() => {
        if (ref.current) {
          ref.current.classList.remove(isCenter ? 'node-glow-center' : 'node-glow');
        }
      }, 1000);
    }
  };
  // Effect to trigger glow animations based on beam timings
  useEffect(() => {
    let timers: NodeJS.Timeout[] = [];

    const triggerAnimations = () => {
      // Clear any existing timers
      timers.forEach(timer => clearTimeout(timer));
      timers = [];

      // Application Process - beam reaches destination after 3 seconds
      timers.push(setTimeout(() => addGlowEffect(toRef), 3000));

      // Mentorship - bidirectional beams
      timers.push(setTimeout(() => addGlowEffect(mentorshipMentorRef), 2500));
      timers.push(setTimeout(() => addGlowEffect(mentorshipUserRef), 4000)); // reverse beam

      // Networking - beam reaches center first, then branches
      timers.push(setTimeout(() => addGlowEffect(networkingCenterRef, true), 2000));
      timers.push(setTimeout(() => addGlowEffect(networkingTo1Ref), 3000));
      timers.push(setTimeout(() => addGlowEffect(networkingTo2Ref), 3600));
      timers.push(setTimeout(() => addGlowEffect(networkingTo3Ref), 4300));
      timers.push(setTimeout(() => addGlowEffect(networkingTo4Ref), 4900));

      // Funding - sources to center, then center to destination
      timers.push(setTimeout(() => addGlowEffect(fundingCenterRef, true), 2800));
      timers.push(setTimeout(() => addGlowEffect(fundingToRef), 4500));
    };

    // Set up intersection observer to trigger animations when section comes into view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Delay to allow the AnimatedBeam components to start
            setTimeout(triggerAnimations, 100);
          }
        });
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById('program');
    if (section) {
      observer.observe(section);
    }

    // Cleanup
    return () => {
      timers.forEach(timer => clearTimeout(timer));
      observer.disconnect();
    };
  }, []);

  return (
    <>      <style jsx>{`
        @keyframes glowBurst {
          0% {
            box-shadow: 0 0 5px rgba(139, 69, 19, 0.3);
          }
          50% {
            box-shadow: 0 0 30px var(--glow-color, rgba(139, 69, 19, 0.8)), 
                        0 0 50px var(--glow-color, rgba(139, 69, 19, 0.6)),
                        0 0 70px var(--glow-color, rgba(139, 69, 19, 0.4));
            transform: scale(1.05);
          }
          100% {
            box-shadow: 0 0 10px var(--glow-color, rgba(139, 69, 19, 0.4));
            transform: scale(1);
          }
        }
        
        .node-glow {
          animation: glowBurst 1s ease-out forwards;
          --glow-color: rgba(139, 69, 19, 0.6);
        }
        
        .node-glow-center {
          animation: glowBurst 1s ease-out forwards;
          --glow-color: rgba(139, 69, 19, 0.8);
        }
      `}</style>
      <motion.section
        id="program"
        className="py-16 md:py-24 bg-card text-foreground"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={sectionVariants}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">        <motion.div className="text-center mb-12 md:mb-16" variants={itemVariants}>
          <AuroraText>Our Program</AuroraText>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground sm:text-xl">
            Discover how RCEOM-TBI fuels your startup's growth and success with these key features.
          </p>
        </motion.div>        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {programFeatures.map((item) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                className="h-full"
              >
                <Card className="h-full bg-card border-0 shadow-xl hover:shadow-accent/30 transition-all duration-500 rounded-2xl backdrop-blur-sm bg-gradient-to-br from-card/90 to-card/70 hover:scale-105 group">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-4 mb-2">
                      <div className="p-3 rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-colors duration-300">
                        <item.Icon className="h-8 w-8 text-accent" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground font-montserrat">
                        {item.title}
                      </h3>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-grow">
                    {item.id === 'application' ? (
                      <div className="space-y-6">
                        <p className="text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                        <div className="relative flex h-32 w-full items-center justify-center overflow-hidden p-8" ref={containerRef}>
                          {/* From element - representing submission */}
                          <div
                            ref={fromRef}
                            className="z-20 flex size-12 items-center justify-center rounded-full bg-background/90 backdrop-blur-md shadow-lg"
                          >
                            <CheckCircle2 className="h-6 w-6 text-accent" />
                          </div>
                          {/* To element - representing approval */}
                          <div
                            ref={toRef}
                            className="z-20 flex size-12 items-center justify-center rounded-full bg-background/90 backdrop-blur-md shadow-lg ml-auto"
                          >
                            <Users className="h-6 w-6 text-accent" />
                          </div>

                          {/* Animated beam connecting the two */}
                          <AnimatedBeam
                            containerRef={containerRef}
                            fromRef={fromRef}
                            toRef={toRef}
                            className="opacity-75"
                            duration={3}
                          />
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">
                            Submit → Review → Approval
                          </p>
                        </div>
                      </div>
                    ) : item.id === 'mentorship' ? (
                      <div className="space-y-6">
                        <p className="text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                        <div className="relative flex w-full max-w-[900px] items-center justify-center overflow-hidden p-24 mx-auto" ref={mentorshipContainerRef}>
                          {/* User Circle - Positioned at far left */}
                          <div
                            ref={mentorshipUserRef}
                            className="z-10 flex size-12 items-center justify-center rounded-full  bg-background/90 backdrop-blur-md p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)] absolute left-8"
                          >
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="text-accent"
                            >
                              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                          </div>
                          {/* Mentor Circle - Positioned at far right */}
                          <div
                            ref={mentorshipMentorRef}
                            className="z-10 flex size-12 items-center justify-center rounded-full  bg-background/90 backdrop-blur-md p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)] absolute right-8"
                          >
                            <Users className="h-6 w-6 text-accent" />
                          </div>

                          {/* Bi-directional animated beams with curvature */}
                          <AnimatedBeam
                            containerRef={mentorshipContainerRef}
                            fromRef={mentorshipUserRef}
                            toRef={mentorshipMentorRef}
                            startYOffset={10}
                            endYOffset={10}
                            curvature={-20}
                            className="opacity-75"
                            duration={2.5}
                            delay={0}
                          />
                          <AnimatedBeam
                            containerRef={mentorshipContainerRef}
                            fromRef={mentorshipUserRef}
                            toRef={mentorshipMentorRef}
                            startYOffset={-10}
                            endYOffset={-10}
                            curvature={20}
                            reverse
                            className="opacity-60"
                            duration={2.8}
                            delay={1.2}
                          />
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">
                            Startup ⇄ Mentor
                          </p>
                        </div>
                      </div>
                    ) : item.id === 'networking' ? (
                      <div className="space-y-6">
                        <p className="text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                        <div className="relative flex h-56 w-full items-center justify-center overflow-hidden p-4" ref={networkingContainerRef}>
                          {/* Left side - People icon (source) */}
                          <div
                            ref={networkingFromRef}
                            className="z-20 flex size-12 items-center justify-center rounded-full bg-background/90 backdrop-blur-md shadow-lg absolute left-4"
                          >
                            <Users className="h-6 w-6 text-accent" />
                          </div>

                          {/* Center - Main networking hub */}
                          <div
                            ref={networkingCenterRef}
                            className="z-20 flex size-16 items-center justify-center rounded-full bg-background/90 backdrop-blur-md shadow-lg"
                          >
                            <Network className="h-8 w-8 text-accent" />
                          </div>

                          {/* Tree structure - Multiple branches extending from center */}
                          {/* Top right branch - Events */}
                          <div
                            ref={networkingTo1Ref}
                            className="z-20 flex size-12 items-center justify-center rounded-full bg-background/90 backdrop-blur-md shadow-lg absolute top-6 right-6"
                          >
                            <CalendarDays className="h-5 w-5 text-accent" />
                          </div>
                          {/* Middle right branch - Investors */}
                          <div
                            ref={networkingTo2Ref}
                            className="z-20 flex size-12 items-center justify-center rounded-full bg-background/90 backdrop-blur-md shadow-lg absolute right-4"
                          >
                            <IndianRupee className="h-5 w-5 text-accent" />
                          </div>
                          {/* Bottom right branch - Network */}
                          <div
                            ref={networkingTo3Ref}
                            className="z-20 flex size-12 items-center justify-center rounded-full bg-background/90 backdrop-blur-md shadow-lg absolute bottom-6 right-6"
                          >
                            <Network className="h-5 w-5 text-accent" />
                          </div>
                          {/* Extended bottom branch - Partners */}
                          <div
                            ref={networkingTo4Ref}
                            className="z-20 flex size-12 items-center justify-center rounded-full bg-background/90 backdrop-blur-md shadow-lg absolute bottom-2 left-3/4 transform -translate-x-1/2"
                          >
                            <Users className="h-5 w-5 text-accent" />
                          </div>

                          {/* Multiple animated beams */}
                          {/* From left source to center hub */}
                          <AnimatedBeam
                            containerRef={networkingContainerRef}
                            fromRef={networkingFromRef}
                            toRef={networkingCenterRef}
                            className="opacity-75"
                            duration={2}
                            delay={0}
                          />
                          {/* From center hub to tree branches */}
                          <AnimatedBeam
                            containerRef={networkingContainerRef}
                            fromRef={networkingCenterRef}
                            toRef={networkingTo1Ref}
                            className="opacity-75"
                            duration={2.5}
                            delay={0.5}
                          />
                          <AnimatedBeam
                            containerRef={networkingContainerRef}
                            fromRef={networkingCenterRef}
                            toRef={networkingTo2Ref}
                            className="opacity-75"
                            duration={2.8}
                            delay={0.8}
                          />
                          <AnimatedBeam
                            containerRef={networkingContainerRef}
                            fromRef={networkingCenterRef}
                            toRef={networkingTo3Ref}
                            className="opacity-75"
                            duration={3.2}
                            delay={1.1}
                          />
                          <AnimatedBeam
                            containerRef={networkingContainerRef}
                            fromRef={networkingCenterRef}
                            toRef={networkingTo4Ref}
                            className="opacity-75"
                            duration={3.5}
                            delay={1.4}
                          />
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">
                            People → Events → Investors → Network → Partners
                          </p>
                        </div>
                      </div>
                    ) : item.id === 'funding' ? (
                      <div className="space-y-6">
                        <p className="text-muted-foreground leading-relaxed">
                          RCEOM-TBI provides seed funding for promising startups and facilitates connections with angel investors and venture capital firms. We help you prepare your pitch deck and financial projections to secure the capital needed for growth.
                        </p>
                        <div className="relative flex h-56 w-full items-center justify-center overflow-hidden p-4" ref={fundingContainerRef}>
                          {/* Center - Main funding hub */}
                          <div
                            ref={fundingCenterRef}
                            className="z-20 flex size-16 items-center justify-center rounded-full bg-background/90 backdrop-blur-md shadow-lg"
                          >
                            <IndianRupee className="h-8 w-8 text-accent" />
                          </div>

                          {/* Multiple funding sources */}
                          {/* Grants - Top source */}
                          <div
                            ref={fundingFrom1Ref}
                            className="z-20 flex size-12 items-center justify-center rounded-full bg-background/90 backdrop-blur-md shadow-lg absolute top-2"
                          >
                            <Lightbulb className="h-5 w-5 text-accent" />
                          </div>
                          {/* Angel Investors - Top left source */}
                          <div
                            ref={fundingFrom2Ref}
                            className="z-20 flex size-12 items-center justify-center rounded-full bg-background/90 backdrop-blur-md shadow-lg absolute top-4 left-8"
                          >
                            <Users className="h-5 w-5 text-accent" />
                          </div>
                          {/* Crowdfunding - Left source */}
                          <div
                            ref={fundingFrom3Ref}
                            className="z-20 flex size-12 items-center justify-center rounded-full bg-background/90 backdrop-blur-md shadow-lg absolute left-4"
                          >
                            <HandCoins className="h-5 w-5 text-accent" />
                          </div>
                          {/* VCs - Bottom left source */}
                          <div
                            ref={fundingFrom4Ref}
                            className="z-20 flex size-12 items-center justify-center rounded-full bg-background/90 backdrop-blur-md shadow-lg absolute bottom-4 left-8"
                          >
                            <Landmark className="h-5 w-5 text-accent" />
                          </div>
                          {/* Bank Loans - Bottom source */}
                          <div
                            ref={fundingFrom5Ref}
                            className="z-20 flex size-12 items-center justify-center rounded-full bg-background/90 backdrop-blur-md shadow-lg absolute bottom-2"
                          >
                            <Building2 className="h-5 w-5 text-accent" />
                          </div>

                          {/* Output - Startup/Entrepreneur */}
                          <div
                            ref={fundingToRef}
                            className="z-20 flex size-12 items-center justify-center rounded-full bg-background/90 backdrop-blur-md shadow-lg absolute right-6"
                          >
                            <Rocket className="h-5 w-5 text-accent" />
                          </div>

                          {/* Animated beams from sources to center */}
                          <AnimatedBeam
                            containerRef={fundingContainerRef}
                            fromRef={fundingFrom1Ref}
                            toRef={fundingCenterRef}
                            className="opacity-75"
                            duration={2}
                            delay={0}
                          />
                          <AnimatedBeam
                            containerRef={fundingContainerRef}
                            fromRef={fundingFrom2Ref}
                            toRef={fundingCenterRef}
                            className="opacity-75"
                            duration={2.2}
                            delay={0.3}
                          />
                          <AnimatedBeam
                            containerRef={fundingContainerRef}
                            fromRef={fundingFrom3Ref}
                            toRef={fundingCenterRef}
                            className="opacity-75"
                            duration={2.4}
                            delay={0.6}
                          />
                          <AnimatedBeam
                            containerRef={fundingContainerRef}
                            fromRef={fundingFrom4Ref}
                            toRef={fundingCenterRef}
                            className="opacity-75"
                            duration={2.6}
                            delay={0.9}
                          />
                          <AnimatedBeam
                            containerRef={fundingContainerRef}
                            fromRef={fundingFrom5Ref}
                            toRef={fundingCenterRef}
                            className="opacity-75"
                            duration={2.8}
                            delay={1.2}
                          />

                          {/* Animated beam from center to destination */}
                          <AnimatedBeam
                            containerRef={fundingContainerRef}
                            fromRef={fundingCenterRef}
                            toRef={fundingToRef}
                            className="opacity-75"
                            duration={3}
                            delay={1.5}
                          />
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">
                            Grants → Angel Investors → Crowdfunding → VCs → Bank Loans → Strategic Investors
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}</div>
        </div>
      </motion.section>
    </>
  );
}
