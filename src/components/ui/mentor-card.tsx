// src/components/ui/mentor-card.tsx
"use client";

import { cn } from "@/lib/utils";
import { processImageUrl } from "@/lib/utils";
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Briefcase, Brain, Linkedin, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";

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
  onSelectMentor?: (mentorId: string) => void;
  showSelectButton?: boolean;
}

export default function MentorCard({ mentor, onSelectMentor, showSelectButton = false }: MentorCardProps) {
  return (
    <motion.div
      className="w-full group/card max-w-sm mx-auto h-full"
      whileHover={{ scale: 1.03, y: -5 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
    >
      <div
        className={cn(
          "cursor-pointer overflow-hidden relative card h-full rounded-2xl shadow-lg flex flex-col justify-between p-5 border border-gray-200 bg-white transition-all duration-300",
        )}
      >
        <div className="absolute w-full h-24 top-0 left-0 transition duration-300 bg-gray-50 group-hover/card:bg-gray-100"></div>

        <div className="relative z-10 flex flex-col h-full items-center text-center">          
          <div className="h-24 w-24 rounded-full border-4 border-white overflow-hidden bg-gray-100 mb-4 -mt-16 shadow-md">              
            <Image
              height={96}
              width={96}
              alt={`${mentor.name} - Avatar`}
              src={processImageUrl(mentor.avatarUrl, mentor.name.substring(0, 2))}
              className="h-full w-full object-cover"
              data-ai-hint={mentor.dataAiHintAvatar || "professional portrait"}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://placehold.co/100x100/E0E7FF/4F46E5.png?text=${mentor.name.substring(0, 2)}`;
              }}
            />
          </div>
          <div className="flex flex-col items-center">
            <p className="font-orbitron text-lg font-semibold text-gray-900 line-clamp-1">
              {mentor.name}
            </p>
            <p className="text-xs text-blue-600 group-hover/card:text-blue-700 flex items-center line-clamp-1 font-medium">
              <Briefcase size={12} className="mr-1.5 opacity-70 flex-shrink-0" /> {mentor.designation}
            </p>
          </div>

          <div className="flex-grow overflow-hidden my-4">
            <p className="font-poppins text-sm text-gray-600 my-2 line-clamp-4">
              {mentor.description}
            </p>
          </div>
          <div className="mb-4 w-full">
            <p className="font-poppins text-xs font-semibold text-gray-800 flex items-center bg-gray-100 px-2 py-1 rounded-md">
              <Brain size={14} className="mr-2 flex-shrink-0 text-blue-600" /> Area: {mentor.areaOfMentorship}
            </p>
          </div>

          <div className="mt-auto w-full">
            {showSelectButton && onSelectMentor && (
              <div className="mb-3">
                <Button
                  onClick={() => onSelectMentor(mentor.id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-poppins text-sm py-2 rounded-lg transition-colors duration-200 flex items-center justify-center group/select"
                  size="sm"
                >
                  <UserPlus size={16} className="mr-2 group-hover/select:scale-110 transition-transform flex-shrink-0" />
                  Select as Mentor
                </Button>
              </div>
            )}
            <div className="flex items-center justify-center space-x-4">
              <Link
                href={`mailto:${mentor.email}`}
                className="font-poppins text-xs text-gray-500 hover:text-blue-600 transition-colors duration-200 flex items-center group/email"
              >
                <Mail size={14} className="mr-1.5 transition-colors flex-shrink-0" /> Contact
              </Link>
              {mentor.linkedinUrl && (
                <a
                  href={mentor.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-poppins text-xs text-gray-500 hover:text-blue-600 transition-colors duration-200 flex items-center group/linkedin"
                  aria-label={`${mentor.name} LinkedIn Profile`}
                >
                  <Linkedin size={14} className="mr-1.5 transition-colors flex-shrink-0" /> LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
