// src/components/ui/startup-modal.tsx
"use client";

import { X, ExternalLink, Mail, Phone, MapPin, Calendar, Building2, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Startup } from '@/types/startup';
import { processImageUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface StartupModalProps {
  startup: Startup | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function StartupModal({ startup, isOpen, onClose }: StartupModalProps) {
  if (!startup) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-background border border-border rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with close button */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-background/95 backdrop-blur-sm border-b border-border rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-accent" />
                </div>                <div>
                  <h2 className="text-2xl font-bold text-foreground">{startup.name}</h2>
                  <p className="text-sm text-muted-foreground">Featured Startup</p>
                </div>
              </div>
              <Button
                onClick={onClose}
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-accent/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
              {/* Logo and Basic Info */}
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <div className="w-48 h-32 rounded-xl bg-accent/5 border-2 border-dashed border-accent/20 flex items-center justify-center overflow-hidden">
                    <img
                      src={processImageUrl(startup.logoUrl, startup.name)}
                      alt={`${startup.name} logo`}
                      className="w-full h-full object-contain p-4"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://placehold.co/300x150/1A1A1A/FFFFFF.png?text=${encodeURIComponent(startup.name.substring(0, 3))}`;
                      }}
                    />
                  </div>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">About</h3>
                    <p className="text-muted-foreground leading-relaxed">{startup.description}</p>
                  </div>
                  
                  {startup.websiteUrl && (
                    <div>
                      <a
                        href={startup.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Visit Website</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Incubation Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-accent" />
                    <span>Incubation Details</span>
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Session:</span>
                      <span className="font-medium">{startup.session}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Incubation Month:</span>
                      <span className="font-medium">{startup.monthYearOfIncubation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className={`font-medium px-2 py-1 rounded-full text-xs ${
                        startup.status === 'Active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}>
                        {startup.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Funnel Source:</span>
                      <span className="font-medium">{startup.funnelSource}</span>
                    </div>
                  </div>
                </div>

                {/* Legal & Contact */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
                    <Building2 className="w-5 h-5 text-accent" />
                    <span>Legal & Contact</span>
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Legal Status:</span>
                      <span className="font-medium">{startup.legalStatus}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-accent" />
                      <span className="text-muted-foreground">Email:</span>
                      <a
                        href={`mailto:${startup.emailId}`}
                        className="font-medium text-accent hover:underline"
                      >
                        {startup.emailId}
                      </a>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-accent" />
                      <span className="text-muted-foreground">Mobile:</span>
                      <a
                        href={`tel:${startup.mobileNumber}`}
                        className="font-medium text-accent hover:underline"
                      >
                        {startup.mobileNumber}
                      </a>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-accent" />
                      <span className="text-muted-foreground">RKNEC Email:</span>
                      <a
                        href={`mailto:${startup.rknecEmailId}`}
                        className="font-medium text-accent hover:underline"
                      >
                        {startup.rknecEmailId}
                      </a>
                    </div>
                  </div>
                </div>
              </div>              {/* Category Badge */}
              <div className="flex items-center justify-center pt-6 border-t border-border">
                <div className="flex items-center space-x-2 px-4 py-2 bg-accent/10 text-accent rounded-full">
                  <Trophy className="w-4 h-4" />
                  <span className="font-medium">Featured Startup</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
