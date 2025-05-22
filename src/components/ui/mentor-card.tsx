
"use client";

import { cn } from "@/lib/utils";
import Image from 'next/image';
import Link from 'next/link';
import { Mail, UserCircle, Briefcase, Brain } from 'lucide-react'; // Added icons

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
}

interface MentorCardProps {
  mentor: Mentor;
}

export default function MentorCard({ mentor }: MentorCardProps) {
  return (
    <div className="w-full group/card max-w-sm mx-auto">
      <div
        className={cn(
          "cursor-pointer overflow-hidden relative card h-[450px] rounded-2xl shadow-xl flex flex-col justify-between p-5 border border-border hover:border-primary/50 transition-all duration-300",
        )}
        style={{ 
          backgroundImage: `url(${mentor.backgroundImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Overlay */}
        <div className="absolute w-full h-full top-0 left-0 transition duration-300 group-hover/card:bg-black/70 bg-black/50"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Top section: Avatar and Name */}
          <div className="flex flex-row items-center space-x-3 mb-4">
            <Image
              height={48}
              width={48}
              alt={`${mentor.name} - Avatar`}
              src={mentor.avatarUrl}
              className="h-12 w-12 rounded-full border-2 border-primary object-cover"
              data-ai-hint={mentor.dataAiHintAvatar}
            />
            <div className="flex flex-col">
              <p className="font-orbitron text-lg font-semibold text-primary">
                {mentor.name}
              </p>
              <p className="text-xs text-slate-300 group-hover/card:text-slate-100 flex items-center">
                 <Briefcase size={12} className="mr-1.5 opacity-70" /> {mentor.designation}
              </p>
            </div>
          </div>

          {/* Middle section: Description and Area of Mentorship */}
          <div className="flex-grow overflow-hidden mb-3">
            <p className="font-poppins text-sm text-slate-200 group-hover/card:text-slate-50 my-2 line-clamp-5">
              {mentor.description}
            </p>
          </div>
           <div className="mb-3">
             <p className="font-poppins text-xs font-semibold text-primary flex items-center bg-primary/10 px-2 py-1 rounded-md">
                <Brain size={14} className="mr-2" /> Area: {mentor.areaOfMentorship}
              </p>
           </div>


          {/* Bottom section: Email */}
          <div className="mt-auto">
            <Link
              href={`mailto:${mentor.email}`}
              className="font-poppins text-xs text-accent hover:text-primary transition-colors duration-200 flex items-center group"
            >
              <Mail size={14} className="mr-1.5 group-hover:text-primary transition-colors" /> Contact Mentor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
