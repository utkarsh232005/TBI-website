// src/app/mentor/my-mentees/[userId]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/contexts/user-context';
import { getMenteeProfile } from '@/app/actions/mentor-request-actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Linkedin,
  ArrowLeft,
  Loader2,
  FileText
} from "lucide-react";
import { motion } from "framer-motion";

interface MenteeProfileData {
  uid: string;
  name: string;
  email: string;
  status: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  linkedin?: string;
  submittedAt?: any;
  companyName?: string;
  idea?: string;
}

export default function MenteeProfilePage() {
  const { user } = useUser();
  const router = useRouter();
  const params = useParams();
  const menteeId = params.userId as string;

  const [profileData, setProfileData] = useState<MenteeProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.email || !menteeId) {
        setError("Authentication error or missing user ID.");
        setIsLoading(false);
        return;
      }

      try {
        const result = await getMenteeProfile(menteeId, user.email);
        if (result.success && result.data) {
          setProfileData(result.data);
        } else {
          setError(result.message || "Failed to load profile. You may not have permission to view this page.");
        }
      } catch (error) {
        setError("An unexpected error occurred while fetching the profile.");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchProfileData();
    }
  }, [user, menteeId]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Not available";
    try {
      const date = typeof timestamp === 'string' ? new Date(timestamp) : (timestamp.toDate ? timestamp.toDate() : new Date(timestamp));
      return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    } catch {
      return "Invalid date";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        <p>{error}</p>
        <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
      </div>
    );
  }

  if (!profileData) {
    return <div className="text-center">Profile not found.</div>;
  }
  
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Mentees
      </Button>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="h-8 w-8 text-gray-600" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {profileData.firstName && profileData.lastName 
                    ? `${profileData.firstName} ${profileData.lastName}`
                    : profileData.name}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {profileData.email}
                </CardDescription>
                <div className="mt-2">
                  <Badge className="bg-green-100 text-green-800 border-green-200">Mentee</Badge>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-white border-gray-200">
            <CardHeader><CardTitle className="flex items-center text-gray-800"><User className="h-5 w-5 mr-2 text-blue-600" />Personal Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm text-gray-500">First Name</label><p className="font-medium text-gray-800">{profileData.firstName || "N/A"}</p></div>
                <div><label className="text-sm text-gray-500">Last Name</label><p className="font-medium text-gray-800">{profileData.lastName || "N/A"}</p></div>
              </div>
              <div><label className="text-sm text-gray-500 flex items-center"><Mail className="h-4 w-4 mr-1" />Email</label><p className="font-medium text-gray-800">{profileData.email}</p></div>
              {profileData.phone && <div><label className="text-sm text-gray-500 flex items-center"><Phone className="h-4 w-4 mr-1" />Phone</label><p className="font-medium text-gray-800">{profileData.phone}</p></div>}
              {profileData.bio && <div><label className="text-sm text-gray-500">Bio</label><p className="font-medium text-gray-700">{profileData.bio}</p></div>}
              {profileData.linkedin && <div><label className="text-sm text-gray-500 flex items-center"><Linkedin className="h-4 w-4 mr-1" />LinkedIn</label><a href={profileData.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{profileData.linkedin}</a></div>}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-white border-gray-200">
            <CardHeader><CardTitle className="flex items-center text-gray-800"><Shield className="h-5 w-5 mr-2 text-blue-600" />Account Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><label className="text-sm text-gray-500">User ID</label><p className="font-mono text-xs text-gray-700">{profileData.uid}</p></div>
              <div><label className="text-sm text-gray-500">Account Status</label><div className="mt-1"><Badge className="bg-green-100 text-green-800">{profileData.status}</Badge></div></div>
              {profileData.submittedAt && <div><label className="text-sm text-gray-500 flex items-center"><Calendar className="h-4 w-4 mr-1" />Application Submitted</label><p className="font-medium text-gray-800">{formatDate(profileData.submittedAt)}</p></div>}
            </CardContent>
          </Card>
        </motion.div>
        
        {(profileData.companyName || profileData.idea) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card className="bg-white border-gray-200">
              <CardHeader><CardTitle className="flex items-center text-gray-800"><FileText className="h-5 w-5 mr-2 text-blue-600" />Application Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {profileData.companyName && <div><label className="text-sm text-gray-500">Company/Startup Name</label><p className="font-medium text-gray-800">{profileData.companyName}</p></div>}
                {profileData.idea && <div><label className="text-sm text-gray-500">Business Idea</label><p className="text-gray-700 leading-relaxed">{profileData.idea}</p></div>}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
