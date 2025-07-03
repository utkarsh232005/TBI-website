"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Linkedin, Twitter, Globe } from 'lucide-react';

const teamMembers = [
  {
    name: "DR. RAJESH KUMAR",
    role: "CEO & Director",
    image: "/api/placeholder/300/300",
    bio: "Visionary leader with 20+ years in technology entrepreneurship and academia. Former CTO at leading tech companies, passionate about nurturing the next generation of innovators.",
    expertise: ["Leadership", "Technology Strategy", "Entrepreneurship"],
    social: {
      linkedin: "#",
      twitter: "#",
      website: "#"
    }
  },
  {
    name: "PRIYA SHARMA",
    role: "Head of Incubation",
    image: "/api/placeholder/300/300",
    bio: "Startup ecosystem expert with deep experience in mentoring early-stage companies. Successfully guided 50+ startups from ideation to market readiness and funding.",
    expertise: ["Startup Mentoring", "Business Development", "Market Strategy"],
    social: {
      linkedin: "#",
      twitter: "#"
    }
  },
  {
    name: "VIKRAM SINGH",
    role: "Investment Manager",
    image: "/api/placeholder/300/300",
    bio: "Former investment banker and venture capital professional. Expertise in funding strategies, financial modeling, and connecting startups with the right investors.",
    expertise: ["Investment", "Financial Strategy", "Due Diligence"],
    social: {
      linkedin: "#",
      website: "#"
    }
  },
  {
    name: "DR. ANITA PATEL",
    role: "Technology Advisor",
    image: "/api/placeholder/300/300",
    bio: "AI/ML researcher and innovation expert with PhD in Computer Science. Specializes in deep tech startups, emerging technologies, and IP strategy.",
    expertise: ["AI/ML", "Deep Tech", "Research & Development"],
    social: {
      linkedin: "#",
      twitter: "#"
    }
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

export default function TeamSection() {
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-6 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-800 mb-4">
            Our Team
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Meet the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Visionaries
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Our experienced team of entrepreneurs, investors, and technology experts 
            are dedicated to helping you build the next generation of innovative companies.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {teamMembers.map((member, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 hover:scale-105 group overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden">
                    <div className="w-full h-64 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                      <div className="flex space-x-3">
                        {member.social.linkedin && (
                          <a href={member.social.linkedin} className="text-white hover:text-blue-300 transition-colors">
                            <Linkedin className="h-5 w-5" />
                          </a>
                        )}
                        {member.social.twitter && (
                          <a href={member.social.twitter} className="text-white hover:text-blue-300 transition-colors">
                            <Twitter className="h-5 w-5" />
                          </a>
                        )}
                        {member.social.website && (
                          <a href={member.social.website} className="text-white hover:text-blue-300 transition-colors">
                            <Globe className="h-5 w-5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                      {member.name}
                    </h3>
                    <p className="text-blue-600 dark:text-blue-400 font-medium mb-3">
                      {member.role}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
                      {member.bio}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {member.expertise.map((skill, skillIndex) => (
                        <Badge 
                          key={skillIndex} 
                          variant="secondary"
                          className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
