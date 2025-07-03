"use client";

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, Trophy, Target, Rocket, Globe, BookOpen, Zap, CheckCircle } from 'lucide-react';
import AnimatedCounter from '@/components/ui/animated-counter';

const stats = [
  { 
    icon: <Building2 className="h-6 w-6" />, 
    value: 100, 
    label: 'Startups Incubated', 
    suffix: '+',
    description: 'Successful companies launched'
  },
  { 
    icon: <Users className="h-6 w-6" />, 
    value: 50, 
    label: 'Expert Mentors', 
    suffix: '+',
    description: 'Industry veterans guiding startups'
  },
  { 
    icon: <Trophy className="h-6 w-6" />, 
    value: 50, 
    label: 'Funding Raised', 
    prefix: '₹',
    suffix: 'Cr+',
    description: 'Total investment secured'
  },
  { 
    icon: <Target className="h-6 w-6" />, 
    value: 85, 
    label: 'Success Rate', 
    suffix: '%',
    description: 'Startups achieving market fit'
  }
];

const features = [
  {
    icon: <Rocket className="h-5 w-5" />,
    title: "State-of-the-Art Infrastructure",
    description: "Modern co-working spaces, advanced labs, and cutting-edge technology infrastructure."
  },
  {
    icon: <Globe className="h-5 w-5" />,
    title: "Industry Partnerships",
    description: "Strong connections with leading corporations and government bodies."
  },
  {
    icon: <BookOpen className="h-5 w-5" />,
    title: "Academic Excellence",
    description: "Leveraging RCOEM's 30+ years of engineering education excellence."
  },
  {
    icon: <Zap className="h-5 w-5" />,
    title: "Innovation Ecosystem",
    description: "Comprehensive support from ideation to market launch."
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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export default function RcoemAboutSection() {
  return (
    <section id="about" className="py-24 bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-800/50 dark:to-gray-900"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            About RCOEM-TBI
          </Badge>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Empowering the Next Generation of{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Innovators
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
            RCOEM Technology Business Incubator is a premier innovation hub established to foster 
            entrepreneurship and transform groundbreaking ideas into successful ventures.
          </p>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-24"
        >
          {stats.map((stat, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-800 group">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                    {stat.icon}
                  </div>
                  <div className="mb-2">
                    <AnimatedCounter
                      targetValue={stat.value}
                      className="text-3xl font-bold text-gray-900 dark:text-white"
                      suffix={stat.suffix}
                      prefix={stat.prefix}
                    />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    {stat.label}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
          
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* About Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Leading Innovation Since 1989
              </h3>
              <div className="space-y-6 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                <p>
                  Ramdeobaba College of Engineering and Management (RCOEM) has been at the forefront of 
                  technical education for over three decades. Our Technology Business Incubator builds 
                  upon this rich legacy to create a thriving ecosystem for startup innovation.
                </p>
                <p>
                  We provide comprehensive support including seed funding, mentorship, infrastructure, 
                  legal guidance, and market connections to help startups scale from ideation to 
                  successful market presence.
                </p>
              </div>
            </motion.div>
            
            {/* Features Grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Our Key Strengths</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <motion.div 
                    key={index}
                    variants={itemVariants}
                    className="flex items-start space-x-4 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white">
                      {feature.icon}
                    </div>
                    <div>
                      <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {feature.title}
                      </h5>
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Vision Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="lg:sticky lg:top-8"
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white overflow-hidden">
              <CardContent className="p-8 relative">
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-6">
                    <Target className="h-8 w-8" />
                  </div>
                  <h4 className="text-2xl font-bold mb-4">Our Vision</h4>
                  <p className="text-blue-100 mb-8 leading-relaxed">
                    To be recognized as a world-class technology business incubator that nurtures 
                    innovative startups and contributes to India's economic growth through technological 
                    advancement and entrepreneurial excellence.
                  </p>
                  
                  {/* Mission Points */}
                  <div className="space-y-4">
                    {[
                      "Foster Innovation Culture",
                      "Support Startup Ecosystem", 
                      "Drive Economic Growth",
                      "Create Global Impact"
                    ].map((point, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-300" />
                        <span className="text-blue-100 text-sm">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Background Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-400/10 rounded-full translate-y-12 -translate-x-12"></div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
