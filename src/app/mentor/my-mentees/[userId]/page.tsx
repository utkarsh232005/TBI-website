// src/app/mentor/my-mentees/[userId]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/contexts/user-context';
import { getMenteeProfile } from '@/app/actions/mentor-request-actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Linkedin,
  ArrowLeft,
  Loader2,
  FileText,
  ExternalLink,
  Clock,
  Star,
  MessageSquare,
  Building,
  Lightbulb,
  Globe,
  CheckCircle,
  Activity
} from "lucide-react";

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
      return date.toLocaleDateString("en-US", { 
        year: "numeric", 
        month: "long", 
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "Invalid date";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 py-8">
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading mentee profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
              <p className="text-red-600 mb-4">{error}</p>
              <Button 
                onClick={() => router.back()} 
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-gray-600">Profile not found.</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.back()} 
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> 
            Back to My Mentees
          </Button>
        </div>
        
        {/* Profile Header */}
        <div className="mb-8">
          <Card className="bg-white border-gray-200 overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 h-24"></div>
            <CardContent className="relative pt-0 pb-8">
              <div className="flex flex-col lg:flex-row lg:items-end gap-6 -mt-12">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xl font-bold">
                      {getInitials(profileData.firstName && profileData.lastName 
                        ? `${profileData.firstName} ${profileData.lastName}`
                        : profileData.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {profileData.firstName && profileData.lastName 
                          ? `${profileData.firstName} ${profileData.lastName}`
                          : profileData.name}
                      </h1>
                      <p className="text-gray-600 flex items-center gap-2 mb-3">
                        <Mail className="w-4 h-4" />
                        {profileData.email}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          <Activity className="w-3 h-3 mr-1" />
                          Active Mentee
                        </Badge>
                        <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                          <Star className="w-3 h-3 mr-1" />
                          Member
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule Session
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Personal & Contact Info */}
          <div className="xl:col-span-1 space-y-6">
            {/* Personal Information */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider">First Name</label>
                    <p className="font-medium text-gray-900 mt-1">{profileData.firstName || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider">Last Name</label>
                    <p className="font-medium text-gray-900 mt-1">{profileData.lastName || "N/A"}</p>
                  </div>
                </div>
                
                <Separator className="bg-gray-200" />
                
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider flex items-center">
                    <Mail className="h-3 w-3 mr-1" />
                    Email Address
                  </label>
                  <p className="font-medium text-gray-900 mt-1 break-all">{profileData.email}</p>
                </div>
                
                {profileData.phone && (
                  <>
                    <Separator className="bg-gray-200" />
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wider flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        Phone Number
                      </label>
                      <p className="font-medium text-gray-900 mt-1">{profileData.phone}</p>
                    </div>
                  </>
                )}
                
                {profileData.linkedin && (
                  <>
                    <Separator className="bg-gray-200" />
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wider flex items-center">
                        <Linkedin className="h-3 w-3 mr-1" />
                        LinkedIn Profile
                      </label>
                      <a 
                        href={profileData.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:text-blue-700 transition-colors mt-1 flex items-center gap-1"
                      >
                        View Profile
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900">
                  <Shield className="h-5 w-5 mr-2 text-blue-600" />
                  Account Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">User ID</label>
                  <p className="font-mono text-xs text-gray-600 mt-1 break-all">{profileData.uid}</p>
                </div>
                
                <Separator className="bg-gray-200" />
                
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Account Status</label>
                  <div className="mt-2">
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      {profileData.status}
                    </Badge>
                  </div>
                </div>
                
                {profileData.submittedAt && (
                  <>
                    <Separator className="bg-gray-200" />
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wider flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Application Submitted
                      </label>
                      <p className="text-gray-900 mt-1 text-sm">{formatDate(profileData.submittedAt)}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Bio and Application Details */}
          <div className="xl:col-span-2 space-y-6">
            {/* Bio Section */}
            {profileData.bio && (
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-900">
                    <User className="h-5 w-5 mr-2 text-blue-600" />
                    About
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{profileData.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Application Details */}
            {(profileData.companyName || profileData.idea) && (
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-900">
                    <FileText className="h-5 w-5 mr-2 text-blue-600" />
                    Application Details
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Information from their initial application submission
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {profileData.companyName && (
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wider flex items-center mb-2">
                        <Building className="h-3 w-3 mr-1" />
                        Company/Startup Name
                      </label>
                      <div className="bg-gray-50 rounded-lg p-4 border">
                        <p className="font-medium text-gray-900">{profileData.companyName}</p>
                      </div>
                    </div>
                  )}
                  
                  {profileData.idea && (
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wider flex items-center mb-2">
                        <Lightbulb className="h-3 w-3 mr-1" />
                        Business Idea
                      </label>
                      <div className="bg-gray-50 rounded-lg p-4 border">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{profileData.idea}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Activity Timeline Placeholder */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900">
                  <Activity className="h-5 w-5 mr-2 text-blue-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Activity tracking coming soon</p>
                  <p className="text-gray-500 text-sm">Session history and progress will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
