
// src/components/ui/mentor-card.tsx
"use client";

import { cn } from "@/lib/utils";
import Image from 'next/image';
import Link from 'next/link';
import { Mail, UserCircle, Briefcase, Brain, Linkedin } from 'lucide-react';
import { motion } from 'framer-motion';

export interface Mentor {
  id: string;
  name: string;
  designation: string;
  description: string;
  areaOfMentorship: string; 
  email: string;
  avatarUrl: string; 
  backgroundImageUrl: string; 
  dataAiHintAvatar: string;
  dataAiHintBackground: string;
  linkedinUrl?: string; 
}

interface MentorCardProps {
  mentor: Mentor;
}

export default function MentorCard({ mentor }: MentorCardProps) {
  return (
    <motion.div 
      className="w-full group/card max-w-sm mx-auto"
      whileHover={{ scale: 1.03, y: -5 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
    >
      <div
        className={cn(
          "cursor-pointer overflow-hidden relative card h-[480px] rounded-2xl shadow-xl flex flex-col justify-between p-5 border border-border hover:border-accent/50 transition-all duration-300",
        )}
        style={{ 
          backgroundImage: `url(${mentor.backgroundImageUrl || 'https://placehold.co/400x600/121212/1A1A1A.png'})`, 
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
        data-ai-hint={mentor.dataAiHintBackground || "abstract texture"}
      >
        <div className="absolute w-full h-full top-0 left-0 transition duration-300 group-hover/card:bg-black/70 bg-black/60"></div>

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex flex-row items-center space-x-3 mb-4">
            <Image
              height={48}
              width={48}
              alt={`${mentor.name} - Avatar`}
              src={mentor.avatarUrl || `https://placehold.co/100x100/7DF9FF/121212.png?text=${mentor.name.substring(0,2)}`}
              className="h-12 w-12 rounded-full border-2 border-foreground object-cover" /* Border to white */
              data-ai-hint={mentor.dataAiHintAvatar || "professional portrait"}
            />
            <div className="flex flex-col">
              <p className="font-orbitron text-lg font-semibold text-foreground line-clamp-1"> {/* Name to white */}
                {mentor.name}
              </p>
              <p className="text-xs text-slate-300 group-hover/card:text-slate-100 flex items-center line-clamp-1">
                 <Briefcase size={12} className="mr-1.5 opacity-70 flex-shrink-0" /> {mentor.designation}
              </p>
            </div>
          </div>

          <div className="flex-grow overflow-hidden mb-3">
            <p className="font-poppins text-sm text-slate-200 group-hover/card:text-slate-50 my-2 line-clamp-6">
              {mentor.description}
            </p>
          </div>
           <div className="mb-3">
             <p className="font-poppins text-xs font-semibold text-foreground flex items-center bg-foreground/10 px-2 py-1 rounded-md"> {/* Area of Mentorship text to white */}
                <Brain size={14} className="mr-2 flex-shrink-0" /> Area: {mentor.areaOfMentorship}
              </p>
           </div>

          <div className="mt-auto flex items-center justify-between">
            <Link
              href={`mailto:${mentor.email}`}
              className="font-poppins text-xs text-accent hover:text-accent/80 transition-colors duration-200 flex items-center group/email" /* Email link to accent */
            >
              <Mail size={14} className="mr-1.5 group-hover/email:text-accent/80 transition-colors flex-shrink-0" /> Contact
            </Link>
            {mentor.linkedinUrl && (
              <a
                href={mentor.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-poppins text-xs text-accent hover:text-accent/80 transition-colors duration-200 flex items-center group/linkedin" /* LinkedIn link to accent */
                aria-label={`${mentor.name} LinkedIn Profile`}
              >
                <Linkedin size={14} className="mr-1.5 group-hover/linkedin:text-accent/80 transition-colors flex-shrink-0" /> LinkedIn
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
