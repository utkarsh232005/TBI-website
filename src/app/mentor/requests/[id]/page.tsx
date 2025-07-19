// src/app/mentor/requests/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/contexts/user-context';
import { useToast } from "@/hooks/use-toast";
import { getMentorRequestForMentor, processMentorDecision } from '@/app/actions/mentor-request-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, ArrowLeft, Check, X, User, Mail, Calendar, Linkedin, Briefcase, MessageSquare, Send, Clock } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import type { MentorRequest } from '@/types/mentor-request';
import { motion } from "framer-motion";

type UserDetails = {
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  linkedinUrl?: string;
};

export default function MentorRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();

  const [request, setRequest] = useState<MentorRequest | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const requestId = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    const fetchRequest = async () => {
      if (!requestId || !user?.email) {
        setIsLoading(false);
        setError("Invalid request or user not authenticated.");
        return;
      }
      try {
        const result = await getMentorRequestForMentor(requestId, user.email);
        if (result.success && result.request) {
          setRequest(result.request);
          setUserDetails(result.userDetails);
        } else {
          setError(result.error || "Failed to fetch request details.");
        }
      } catch (e) {
        setError("An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    if(user) {
        fetchRequest();
    }
  }, [requestId, user]);

  const handleDecision = async (action: 'approve' | 'reject') => {
    if (!request || !user?.email) return;

    setIsProcessing(true);
    try {
      const result = await processMentorDecision({
        requestId: request.id,
        action,
        notes,
      }, user.email);

      if (result.success) {
        toast({ title: "Success", description: result.message });
        router.push('/mentor/requests');
      } else {
        toast({ title: "Error", description: result.message, variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to process decision.", variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center">
        <div className="text-center">
          <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={() => router.back()} variant="ghost" className="text-gray-400 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">Request not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button 
            variant="ghost" 
            onClick={() => router.back()} 
            className="text-gray-400 hover:text-white hover:bg-gray-800/50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Requests
          </Button>
        </motion.div>
        
        {/* Header Section */}
        <motion.div 
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative">
            <div className="flex items-center space-x-6">
              <Avatar className="h-20 w-20 border-4 border-white/20">
                <AvatarFallback className="text-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold">
                  {userDetails?.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">{userDetails?.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-indigo-200">
                  <div className="flex items-center">
                    <Mail className="mr-2 h-4 w-4" />
                    <span>{userDetails?.email}</span>
                  </div>
                  {userDetails?.phone && (
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>{userDetails.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Requested {format(request.createdAt, 'MMM dd, yyyy')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-gray-800/70 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-white flex items-center">
                <User className="mr-2 h-5 w-5 text-indigo-400" />
                Applicant Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {userDetails?.linkedinUrl && (
                <div className="flex items-center gap-3 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                  <Linkedin className="h-5 w-5 text-blue-400" />
                  <a 
                    href={userDetails.linkedinUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    View LinkedIn Profile
                  </a>
                </div>
              )}
              
              {userDetails?.bio && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-300 flex items-center">
                    <Briefcase className="mr-2 h-4 w-4" />
                    About the Applicant
                  </h3>
                  <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                    <p className="text-gray-300 leading-relaxed">{userDetails.bio}</p>
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-300 flex items-center">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Request Message
                </h3>
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                  <blockquote className="ml-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                    <p className="text-gray-300 italic leading-relaxed">{request.requestMessage}</p>
                  </blockquote>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Action Section */}
        {request.status === 'admin_approved' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="bg-gray-800/70 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white flex items-center">
                  <Send className="mr-2 h-5 w-5 text-indigo-400" />
                  Your Response
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Approve or decline this mentorship request. You can add optional notes for the applicant.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="mentor-notes" className="text-gray-300 font-medium">
                    Notes for the applicant (optional)
                  </Label>
                  <Textarea 
                    id="mentor-notes"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="e.g., I'd be happy to connect! Let's set up a call next week to discuss your goals and how I can help you succeed."
                    className="mt-2 min-h-[120px] bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500/20 resize-none"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-3">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    variant="destructive" 
                    onClick={() => handleDecision('reject')} 
                    disabled={isProcessing}
                    className="bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30"
                  >
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin"/> : <X className="mr-2 h-4 w-4"/>}
                    Decline
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    onClick={() => handleDecision('approve')} 
                    disabled={isProcessing} 
                    className="bg-green-500 hover:bg-green-600 text-white border-0"
                  >
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin"/> : <Check className="mr-2 h-4 w-4"/>}
                    Approve
                  </Button>
                </motion.div>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {/* Already Processed */}
        {request.status !== 'admin_approved' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="bg-gray-800/70 backdrop-blur-sm border-gray-700">
              <CardContent className="p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mb-4">
                  <Clock className="h-8 w-8 text-gray-400"/>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Request Already Processed</h3>
                <p className="text-gray-400">
                  This request has already been processed on {format(request.updatedAt, 'MMM dd, yyyy')}.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
