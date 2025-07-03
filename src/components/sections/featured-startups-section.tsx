"use client";

import { Rocket, Loader2, AlertCircle, Building2, ExternalLink, Users, TrendingUp, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { processImageUrl } from '@/lib/utils';
import StartupModal from '@/components/ui/startup-modal';
import { Startup } from '@/types/startup';

interface StartupDoc {
  id: string;
  name: string;
  logoUrl: string;
  description: string;
  websiteUrl?: string;
  dataAiHint?: string;
  createdAt: Timestamp;
  funnelSource: string;
  session: string;
  monthYearOfIncubation: string;
  status: string;
  legalStatus: string;
  rknecEmailId: string;
  emailId: string;
  mobileNumber: string;
  updatedAt?: Timestamp;
}

// Professional startup logo component
const StartupCard = ({ startup, onClick, index }: {
  startup: StartupDoc;
  onClick: () => void;
  index: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{
        y: -4,
        scale: 1.1,
        transition: { type: "spring", stiffness: 400, damping: 25 }
      }}
      className="group cursor-pointer relative"
      onClick={onClick}
    >
      {/* Logo Image Only */}
      <div className="relative w-full aspect-square">
        <img
          src={processImageUrl(startup.logoUrl, startup.name)}
          alt={`${startup.name} logo`}
          className="w-full h-full object-contain transition-all duration-300 group-hover:brightness-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://placehold.co/300x300/F8FAFC/64748B.png?text=${encodeURIComponent(startup.name.substring(0, 2))}`;
          }}
        />

        {/* Hover Overlay with Company Name */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center rounded-lg">
          <div className="p-3 text-center">
            <h3 className="text-white font-semibold text-sm mb-1">{startup.name}</h3>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${startup.status.toLowerCase() === 'active'
              ? 'bg-emerald-500 text-white'
              : 'bg-blue-500 text-white'
              }`}>
              {startup.status}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Stats component
const StatsSection = ({ startupCount }: { startupCount: number }) => {
  const stats = [
    { icon: Building2, label: "Featured Startups", value: startupCount, color: "blue" },
    { icon: Users, label: "Active Entrepreneurs", value: "150+", color: "emerald" },
    { icon: TrendingUp, label: "Growth Rate", value: "300%", color: "purple" },
    { icon: Award, label: "Success Stories", value: "25+", color: "orange" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
          className="bg-white rounded-xl border border-gray-200 p-6 text-center hover:shadow-lg transition-all duration-300"
        >
          <div className={`w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center ${stat.color === 'blue' ? 'bg-blue-100' :
            stat.color === 'emerald' ? 'bg-emerald-100' :
              stat.color === 'purple' ? 'bg-purple-100' : 'bg-orange-100'
            }`}>
            <stat.icon className={`w-6 h-6 ${stat.color === 'blue' ? 'text-blue-600' :
              stat.color === 'emerald' ? 'text-emerald-600' :
                stat.color === 'purple' ? 'text-purple-600' : 'text-orange-600'
              }`} />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
          <div className="text-sm text-gray-500">{stat.label}</div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default function FeaturedStartupsSection() {
  const [startups, setStartups] = useState<StartupDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);

  // Fetch startups from Firestore
  useEffect(() => {
    const fetchStartups = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const startupsQuery = query(
          collection(db, 'startups'),
          orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(startupsQuery);
        const startupsData: StartupDoc[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.logoUrl && data.name) {
            startupsData.push({
              id: doc.id,
              ...data,
            } as StartupDoc);
          }
        });

        setStartups(startupsData);
      } catch (err) {
        console.error('Error fetching startups:', err);
        setError('Failed to load startups. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStartups();
  }, []);

  const handleStartupClick = (startup: StartupDoc) => {
    const startupForModal: Startup = {
      id: startup.id,
      name: startup.name,
      logoUrl: startup.logoUrl,
      description: startup.description,
      websiteUrl: startup.websiteUrl,
      dataAiHint: startup.dataAiHint,
      createdAt: startup.createdAt,
      funnelSource: startup.funnelSource,
      session: startup.session,
      monthYearOfIncubation: startup.monthYearOfIncubation,
      status: startup.status,
      legalStatus: startup.legalStatus,
      rknecEmailId: startup.rknecEmailId,
      emailId: startup.emailId,
      mobileNumber: startup.mobileNumber,
      updatedAt: startup.updatedAt,
    };

    setSelectedStartup(startupForModal);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedStartup(null);
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + 12, startups.length));
  };

  return (
    <section
      id="startups"
      className="py-20 bg-gray-50"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* Professional Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6 border border-blue-200"
          >
            <Building2 className="w-4 h-4" />
            Innovation Ecosystem
          </motion.div>

          {/* Main Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
          >
            Featured{' '}
            <span className="relative">
              <span className="relative z-10 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Startups
              </span>
              <div className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-blue-200 to-purple-200 opacity-60 rounded-full transform -rotate-1" />
            </span>
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            viewport={{ once: true }}
          >
            Discover innovative companies transforming industries through the{' '}
            <span className="font-semibold text-blue-700">RCOEM-TBI ecosystem</span>.
            Each startup represents excellence, innovation, and entrepreneurial spirit.
          </motion.p>
        </motion.div>

        {/* Stats Section */}
        {!isLoading && !error && startups.length > 0 && (
          <StatsSection startupCount={startups.length} />
        )}

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full py-16"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-8">
              {Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="aspect-square animate-pulse">
                  <div className="w-full h-full bg-gray-200 rounded-lg" />
                </div>
              ))}
            </div>
            <div className="flex justify-center items-center">
              <div className="bg-white px-6 py-3 rounded-full shadow-md border border-gray-200">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <span className="text-gray-700 font-medium">Loading featured startups...</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="bg-red-50 border border-red-200 rounded-2xl p-12 max-w-lg mx-auto">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-red-800 mb-3">Unable to Load Startups</h3>
              <p className="text-red-600 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        )}

        {/* Startups Grid */}
        {!isLoading && !error && startups.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {startups.slice(0, visibleCount).map((startup, index) => (
                <StartupCard
                  key={startup.id}
                  startup={startup}
                  index={index}
                  onClick={() => handleStartupClick(startup)}
                />
              ))}
            </div>

            {/* Load More Button */}
            {visibleCount < startups.length && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center"
              >
                <button
                  onClick={handleLoadMore}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                >
                  Load More Startups
                  <TrendingUp className="w-4 h-4" />
                </button>
                <p className="text-gray-500 text-sm mt-3">
                  Showing {visibleCount} of {startups.length} startups
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && !error && startups.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="bg-white border border-gray-200 rounded-3xl p-16 max-w-lg mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <Rocket className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Coming Soon</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                We're curating an impressive collection of startups from the RCOEM-TBI ecosystem.{' '}
                <span className="font-medium text-blue-700">Stay tuned for groundbreaking innovations!</span>
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Startup Modal */}
      <StartupModal
        startup={selectedStartup}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </section>
  );
}

