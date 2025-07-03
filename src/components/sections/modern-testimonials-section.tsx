"use client";

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Quote } from 'lucide-react';
import { useState } from 'react';

const testimonials = [
  {
    name: "FAJAR",
    role: "Founder & CEO",
    company: "Euphoriya",
    image: "/api/placeholder/80/80",
    content: "Holisticly empower leveraged ROI whereas effective web-readiness. Completely enable emerging meta-services with cross-platform web services. Quickly initiate inexpensive total linkage rather than extensible scenarios. The incubation program transformed our vision into reality.",
    rating: 5,
    tags: ["Leadership", "Innovation", "Growth"],
    featured: true
  },
  {
    name: "Rahul Mehta",
    role: "Founder & CEO",
    company: "TechFlow Solutions",
    image: "/api/placeholder/80/80",
    content: "TBI transformed our startup journey. The mentorship and resources provided helped us scale from a 2-person team to 50+ employees in just 18 months. The funding connections were invaluable for our growth trajectory.",
    rating: 5,
    tags: ["Funding", "Scaling", "Mentorship"]
  },
  {
    name: "Sneha Patel",
    role: "Co-founder",
    company: "EcoInnovate",
    image: "/api/placeholder/80/80",
    content: "The legal and compliance support saved us months of bureaucratic hassles. TBI's network opened doors we didn't even know existed. Best decision we made for our sustainability startup.",
    rating: 5,
    tags: ["Legal Support", "Network", "Sustainability"]
  },
  {
    name: "Arjun Singh",
    role: "CTO",
    company: "AI Dynamics",
    image: "/api/placeholder/80/80",
    content: "From prototype to product, TBI's technical expertise and infrastructure support was crucial. The AI lab access and cloud credits helped us build our MVP without burning through capital.",
    rating: 5,
    tags: ["Technology", "Infrastructure", "AI"]
  },
  {
    name: "Kavya Sharma",
    role: "Founder",
    company: "HealthTech Pro",
    image: "/api/placeholder/80/80",
    content: "The healthcare industry connections and regulatory guidance from TBI were game-changers. We successfully launched our telemedicine platform with their comprehensive support.",
    rating: 5,
    tags: ["Healthcare", "Regulatory", "Platform"]
  },
  {
    name: "Vikram Joshi",
    role: "CEO",
    company: "FinNext",
    image: "/api/placeholder/80/80",
    content: "TBI's fintech expertise and investor network helped us secure Series A funding. The pitch preparation sessions and market analysis were comprehensive and spot-on.",
    rating: 5,
    tags: ["Fintech", "Series A", "Investment"]
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
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

export default function ModernTestimonialsSection() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const featuredTestimonial = testimonials.find(t => t.featured);
  const regularTestimonials = testimonials.filter(t => !t.featured);

  return (
    <section className="py-20 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-6 py-2 text-sm font-medium text-green-700 dark:text-green-300 ring-1 ring-green-200 dark:ring-green-800 mb-4">
            Success Stories
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            What Our{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
              Founders Say
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Don't just take our word for it. Here's what successful founders who have been through 
            our incubation program have to say about their experience.
          </p>
        </motion.div>

        {/* Featured Testimonial */}
        {featuredTestimonial && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <Card className="max-w-4xl mx-auto border-0 shadow-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  {featuredTestimonial.name.charAt(0)}
                </div>
                <h3 className="text-3xl font-bold mb-2">{featuredTestimonial.name}</h3>
                <p className="text-blue-100 mb-6">{featuredTestimonial.company}</p>
                <blockquote className="text-xl leading-relaxed mb-8 italic">
                  "{featuredTestimonial.content}"
                </blockquote>
                <div className="flex items-center justify-center space-x-1">
                  {[...Array(featuredTestimonial.rating)].map((_, starIndex) => (
                    <Star key={starIndex} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {regularTestimonials.map((testimonial, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 hover:scale-105 group">
                <CardContent className="p-8 relative">
                  <div className="absolute top-4 right-4 text-gray-200 dark:text-gray-700">
                    <Quote className="h-8 w-8" />
                  </div>
                  
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, starIndex) => (
                      <Star key={starIndex} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 text-lg">
                    "{testimonial.content}"
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {testimonial.tags.map((tag, tagIndex) => (
                      <Badge 
                        key={tagIndex} 
                        variant="secondary"
                        className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg mr-4">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {testimonial.role} at {testimonial.company}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white">
            <h3 className="text-3xl font-bold mb-4">Ready to Join These Success Stories?</h3>
            <p className="text-xl mb-8 text-blue-100">
              Start your journey with India's premier technology business incubator today.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-blue-600 font-semibold px-8 py-4 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Apply for Incubation
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
