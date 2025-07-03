"use client";

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Lightbulb, 
  Users, 
  TrendingUp, 
  Shield, 
  Zap, 
  Target,
  Rocket,
  Heart
} from 'lucide-react';

const features = [
  {
    icon: <Lightbulb className="h-8 w-8" />,
    title: "Innovation Lab",
    description: "State-of-the-art R&D facilities with cutting-edge technology, prototyping equipment, and collaborative workspaces designed to bring your breakthrough ideas to life."
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: "Expert Mentorship",
    description: "Access to 50+ industry veterans, successful entrepreneurs, and domain experts who provide personalized guidance, strategic insights, and real-world experience."
  },
  {
    icon: <TrendingUp className="h-8 w-8" />,
    title: "Funding Support",
    description: "Direct access to seed funding, investor networks, and pitch opportunities. We've helped startups raise over ₹50 crores in total funding across various sectors."
  },
  {
    icon: <Shield className="h-8 w-8" />,
    title: "Legal & Compliance",
    description: "Complete legal support including IP protection, compliance guidance, contract reviews, and incorporation assistance to secure your business foundation."
  },
  {
    icon: <Zap className="h-8 w-8" />,
    title: "Rapid Prototyping",
    description: "Fast-track your product development with our prototyping labs, 3D printing facilities, and technical resources to validate and iterate your solutions quickly."
  },
  {
    icon: <Target className="h-8 w-8" />,
    title: "Market Access",
    description: "Leverage our industry partnerships and corporate connections for pilot opportunities, customer validation, and strategic market entry across multiple sectors."
  },
  {
    icon: <Rocket className="h-8 w-8" />,
    title: "Acceleration Program",
    description: "Intensive 6-month structured program with weekly milestones, regular investor pitches, and dedicated support to accelerate your startup's growth trajectory."
  },
  {
    icon: <Heart className="h-8 w-8" />,
    title: "Startup Ecosystem",
    description: "Join a vibrant community of 100+ alumni startups, peer entrepreneurs, and ecosystem partners fostering collaboration, knowledge sharing, and mutual growth."
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
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

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-900/30 px-6 py-2 text-sm font-medium text-purple-700 dark:text-purple-300 ring-1 ring-purple-200 dark:ring-purple-800 mb-4">
            Why Choose TBI
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Everything You Need to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              Succeed
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Our comprehensive incubation program provides all the tools, resources, and support 
            you need to transform your innovative ideas into successful businesses.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:scale-105 group">
                <CardContent className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
