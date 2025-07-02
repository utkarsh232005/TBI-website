// src/components/ui/startup-modal.tsx
"use client";

import { X, ExternalLink, Mail, Phone, MapPin, Calendar, Building2, Trophy, Globe, Sparkles, TrendingUp, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Startup } from '@/types/startup';
import { processImageUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'graduated':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'incubating':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-5xl max-h-[95vh] overflow-hidden bg-gradient-to-br from-background via-background/95 to-accent/5 border border-border/50 rounded-3xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background Elements */}
            <div className="absolute inset-0 bg-grid-small-black/[0.02] dark:bg-grid-small-white/[0.02] pointer-events-none" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-3xl opacity-30" />

            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border/50">
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-accent/5 border-2 border-accent/20 flex items-center justify-center overflow-hidden">
                      <img
                        src={processImageUrl(startup.logoUrl, startup.name)}
                        alt={`${startup.name} logo`}
                        className="w-12 h-12 object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://placehold.co/300x150/1A1A1A/FFFFFF.png?text=${encodeURIComponent(startup.name.substring(0, 3))}`;
                        }}
                      />
                    </div>
                    <div className="absolute -top-1 -right-1">
                      <Sparkles className="w-5 h-5 text-accent" />
                    </div>
                  </div>

                  <div>
                    <h2 className="text-3xl font-bold text-foreground">{startup.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`${getStatusColor(startup.status)} text-xs font-medium`}>
                        {startup.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">Featured Startup</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-accent/10 transition-colors"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(95vh-140px)]">
              <div className="p-6 space-y-8">
                {/* Hero Section */}
                <div className="relative rounded-2xl bg-gradient-to-r from-accent/5 via-primary/5 to-accent/5 border border-border/30 p-6 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent" />
                  <div className="relative">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      <div className="flex-shrink-0">
                        <Card className="w-64 h-40 bg-background/80 border border-border/50 overflow-hidden">
                          <CardContent className="p-4 flex items-center justify-center h-full">
                            <img
                              src={processImageUrl(startup.logoUrl, startup.name)}
                              alt={`${startup.name} logo`}
                              className="max-w-full max-h-full object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `https://placehold.co/300x150/1A1A1A/FFFFFF.png?text=${encodeURIComponent(startup.name.substring(0, 3))}`;
                              }}
                            />
                          </CardContent>
                        </Card>
                      </div>

                      <div className="flex-1 space-y-4">
                        <div>
                          <h3 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-accent" />
                            About the Company
                          </h3>
                          <p className="text-muted-foreground leading-relaxed text-lg">
                            {startup.description}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          {startup.websiteUrl && (
                            <Button asChild variant="default" className="group">
                              <a
                                href={startup.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Globe className="w-4 h-4 mr-2" />
                                Visit Website
                                <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                              </a>
                            </Button>
                          )}
                          <Button variant="outline" className="group">
                            <Users className="w-4 h-4 mr-2" />
                            Connect
                            <TrendingUp className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Incubation Journey */}
                  <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-foreground">
                        <Calendar className="w-5 h-5 text-accent" />
                        Incubation Journey
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Session</p>
                          <p className="font-semibold text-foreground">{startup.session}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Started</p>
                          <p className="font-semibold text-foreground">{startup.monthYearOfIncubation}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Source</p>
                          <p className="font-semibold text-foreground">{startup.funnelSource}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Legal Status</p>
                          <p className="font-semibold text-foreground">{startup.legalStatus}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Contact Information */}
                  <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-foreground">
                        <Phone className="w-5 h-5 text-accent" />
                        Contact Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/30">
                          <Mail className="w-4 h-4 text-accent flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground">Primary Email</p>
                            <a
                              href={`mailto:${startup.emailId}`}
                              className="font-medium text-foreground hover:text-accent transition-colors text-sm truncate block"
                            >
                              {startup.emailId}
                            </a>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/30">
                          <Phone className="w-4 h-4 text-accent flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground">Mobile</p>
                            <a
                              href={`tel:${startup.mobileNumber}`}
                              className="font-medium text-foreground hover:text-accent transition-colors text-sm"
                            >
                              {startup.mobileNumber}
                            </a>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/30">
                          <Building2 className="w-4 h-4 text-accent flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground">RKNEC Email</p>
                            <a
                              href={`mailto:${startup.rknecEmailId}`}
                              className="font-medium text-foreground hover:text-accent transition-colors text-sm truncate block"
                            >
                              {startup.rknecEmailId}
                            </a>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Bottom Badge */}
                <div className="flex items-center justify-center pt-6">
                  <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent/10 via-primary/10 to-accent/10 border border-accent/20 text-accent rounded-full">
                    <Trophy className="w-5 h-5" />
                    <span className="font-semibold">RCOEM-TBI Featured Startup</span>
                    <Sparkles className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
