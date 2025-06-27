
// src/app/user/settings/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Bell, 
  ExternalLink,
  Edit3,
  CheckCircle,
  Clock,
  FileText,
  Linkedin
} from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { getUserData } from "@/app/actions/user-actions";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface UserProfileData {
  uid: string;
  name: string;
  email: string;
  status: string;
  role: string;
  submissionId?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  linkedin?: string;
  notificationPreferences?: {
    emailNotifications: boolean;
    updatedAt?: any;
  };
  onboardingProgress?: {
    passwordChanged?: boolean;
    passwordChangedAt?: any;
    profileCompleted?: boolean;
    profileCompletedAt?: any;
    notificationsConfigured?: boolean;
    notificationsConfiguredAt?: any;
    completed?: boolean;
    completedAt?: any;
  };
  onboardingCompleted?: boolean;
  onboardingCompletedAt?: any;
  passwordUpdatedAt?: any;
  profileUpdatedAt?: any;
  submittedAt?: any;
  companyName?: string;
  idea?: string;
}

export default function UserSettingsPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.uid) {
        setIsLoading(false);
        return;
      }

      try {
        const result = await getUserData(user.uid);
        if (result.success && result.data) {
          setProfileData(result.data as UserProfileData);
        } else {
          toast({
            title: "Error",
            description: result.message,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [user, toast]);
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Not available";
    try {
      // Handle both ISO strings and Firestore timestamps
      const date = typeof timestamp === 'string' ? 
        new Date(timestamp) : 
        (timestamp.toDate ? timestamp.toDate() : new Date(timestamp));
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid date";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return <Badge className="bg-green-500/10 text-green-400 border-green-500/30">Accepted</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/10 text-red-400 border-red-500/30">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-neutral-400">Loading profile data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-8">
        <Card className="bg-neutral-800/50 border-neutral-700/50">
          <CardContent className="py-20 text-center">
            <p className="text-neutral-400">Please log in to view your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border-indigo-500/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-indigo-600 flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-white">
                    {profileData?.firstName && profileData?.lastName 
                      ? `${profileData.firstName} ${profileData.lastName}`
                      : profileData?.name || user.name}
                  </CardTitle>
                  <CardDescription className="text-indigo-300">
                    {profileData?.email || user.email}
                  </CardDescription>
                  <div className="mt-2">
                    {profileData && getStatusBadge(profileData.status)}
                  </div>
                </div>
              </div>
              <Button variant="outline" className="border-indigo-500 text-indigo-300 hover:bg-indigo-500/10">
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Information */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-neutral-800/50 border-neutral-700/50">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <User className="h-5 w-5 mr-2 text-indigo-400" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-neutral-400">First Name</label>
                  <p className="text-white font-medium">
                    {profileData?.firstName || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-neutral-400">Last Name</label>
                  <p className="text-white font-medium">
                    {profileData?.lastName || "Not provided"}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="text-sm text-neutral-400 flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  Email Address
                </label>
                <p className="text-white font-medium">{profileData?.email}</p>
              </div>

              {profileData?.phone && (
                <div>
                  <label className="text-sm text-neutral-400 flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    Phone Number
                  </label>
                  <p className="text-white font-medium">{profileData.phone}</p>
                </div>
              )}

              {profileData?.bio && (
                <div>
                  <label className="text-sm text-neutral-400">Bio</label>
                  <p className="text-white font-medium">{profileData.bio}</p>
                </div>
              )}

              {profileData?.linkedin && (
                <div>
                  <label className="text-sm text-neutral-400 flex items-center">
                    <Linkedin className="h-4 w-4 mr-1" />
                    LinkedIn Profile
                  </label>
                  <a
                    href={profileData.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 flex items-center"
                  >
                    View Profile
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Account Information */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-neutral-800/50 border-neutral-700/50">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Shield className="h-5 w-5 mr-2 text-indigo-400" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileData?.uid && (
                <div>
                  <label className="text-sm text-neutral-400">User ID</label>
                  <p className="text-white font-medium font-mono">
                    {profileData.uid}
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm text-neutral-400">Account Status</label>
                <div className="mt-1">
                  {profileData && getStatusBadge(profileData.status)}
                </div>
              </div>

              {profileData?.submittedAt && (
                <div>
                  <label className="text-sm text-neutral-400 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Application Submitted
                  </label>
                  <p className="text-white font-medium">
                    {formatDate(profileData.submittedAt)}
                  </p>
                </div>
              )}

              {profileData?.onboardingCompletedAt && (
                <div>
                  <label className="text-sm text-neutral-400">Onboarding Completed</label>
                  <p className="text-white font-medium">
                    {formatDate(profileData.onboardingCompletedAt)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Application Details */}
        {(profileData?.companyName || profileData?.idea) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card className="bg-neutral-800/50 border-neutral-700/50">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <FileText className="h-5 w-5 mr-2 text-indigo-400" />
                  Application Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileData?.companyName && (
                  <div>
                    <label className="text-sm text-neutral-400">Company/Startup Name</label>
                    <p className="text-white font-medium">{profileData.companyName}</p>
                  </div>
                )}

                {profileData?.idea && (
                  <div>
                    <label className="text-sm text-neutral-400">Business Idea</label>
                    <p className="text-white font-medium leading-relaxed">
                      {profileData.idea}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Onboarding Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="bg-neutral-800/50 border-neutral-700/50">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <CheckCircle className="h-5 w-5 mr-2 text-indigo-400" />
                Onboarding Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-neutral-700/30">
                  {profileData?.onboardingProgress?.passwordChanged ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : (
                    <Clock className="h-5 w-5 text-neutral-400" />
                  )}
                  <div>
                    <p className="text-white font-medium">Password Setup</p>
                    <p className="text-sm text-neutral-400">
                      {profileData?.onboardingProgress?.passwordChanged ? "Completed" : "Pending"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-lg bg-neutral-700/30">
                  {profileData?.onboardingProgress?.profileCompleted ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : (
                    <Clock className="h-5 w-5 text-neutral-400" />
                  )}
                  <div>
                    <p className="text-white font-medium">Profile Setup</p>
                    <p className="text-sm text-neutral-400">
                      {profileData?.onboardingProgress?.profileCompleted ? "Completed" : "Pending"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-lg bg-neutral-700/30">
                  {profileData?.onboardingProgress?.notificationsConfigured ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : (
                    <Clock className="h-5 w-5 text-neutral-400" />
                  )}
                  <div>
                    <p className="text-white font-medium">Notifications</p>
                    <p className="text-sm text-neutral-400">
                      {profileData?.onboardingProgress?.notificationsConfigured ? "Configured" : "Pending"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notification Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card className="bg-neutral-800/50 border-neutral-700/50">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Bell className="h-5 w-5 mr-2 text-indigo-400" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg bg-neutral-700/30">
                <div>
                  <p className="text-white font-medium">Email Notifications</p>
                  <p className="text-sm text-neutral-400">
                    Receive updates and announcements via email
                  </p>
                </div>
                <Badge variant={profileData?.notificationPreferences?.emailNotifications ? "default" : "outline"}>
                  {profileData?.notificationPreferences?.emailNotifications ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              {profileData?.notificationPreferences?.updatedAt && (
                <p className="text-xs text-neutral-500 mt-2">
                  Last updated: {formatDate(profileData.notificationPreferences.updatedAt)}
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
