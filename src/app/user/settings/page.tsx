// src/app/user/settings/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Loader2,
  Save,
  Mail,
  Linkedin,
  Rocket,
  Users,
  FileText,
  Award,
  UploadCloud,
  X,
  Phone,
  Globe,
} from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { getUserData, updateUserProfile } from "@/app/actions/user-actions";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { UserProfileData, UpdateUserProfileFormValues } from "@/types/user";
import { Label } from "@/components/ui/label";

export default function UserSettingsPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePictureFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (profileData) {
          setProfileData({ ...profileData, profilePicture: event.target?.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfilePicture = () => {
    setProfilePictureFile(null);
    if (profileData) {
      setProfileData({ ...profileData, profilePicture: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !profileData) return;

    setIsSaving(true);
    try {
      // In a real implementation, you would upload the profilePictureFile if it exists
      // and get a URL to save. For this demo, we'll save the base64 or existing URL.

      const valuesToSave: UpdateUserProfileFormValues = {
        uid: user.uid,
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        phone: profileData.phone || '',
        bio: profileData.bio || '',
        linkedin: profileData.linkedin || '',
        profilePicture: profileData.profilePicture || '',
        startupName: profileData.startupName || '',
        startupDescription: profileData.startupDescription || '',
        startupWebsite: profileData.startupWebsite || '',
        teamInfo: profileData.teamInfo || '',
      };

      const result = await updateUserProfile(valuesToSave);

      if (result.success) {
        toast({ title: "Success", description: "Profile updated successfully!" });
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!profileData) {
    return <div className="text-center">Could not load profile data.</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">Manage your personal and startup information.</p>
      </motion.div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><User className="mr-2" /> Personal Information</CardTitle>
          <CardDescription>Update your personal details and profile picture.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                {profileData.profilePicture ? (
                  <img src={profileData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              <Button type="button" size="icon" variant="outline" className="absolute bottom-0 right-0 rounded-full h-8 w-8" onClick={() => fileInputRef.current?.click()}>
                <UploadCloud className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" value={profileData.firstName || ''} onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" value={profileData.lastName || ''} onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })} />
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" value={profileData.bio || ''} onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })} placeholder="Tell us a bit about yourself" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input id="phone" type="tel" value={profileData.phone || ''} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} className="pl-10" />
              </div>
            </div>
            <div>
              <Label htmlFor="linkedin">LinkedIn</Label>
              <div className="relative">
                <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input id="linkedin" type="url" value={profileData.linkedin || ''} onChange={(e) => setProfileData({ ...profileData, linkedin: e.target.value })} placeholder="https://linkedin.com/in/..." className="pl-10" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Startup Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Rocket className="mr-2" /> Startup Information</CardTitle>
          <CardDescription>Provide details about your venture.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="startupName">Startup Name</Label>
            <Input id="startupName" value={profileData.startupName || ''} onChange={(e) => setProfileData({ ...profileData, startupName: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="startupDescription">Startup Description</Label>
            <Textarea id="startupDescription" value={profileData.startupDescription || ''} onChange={(e) => setProfileData({ ...profileData, startupDescription: e.target.value })} placeholder="What does your startup do?" />
          </div>
          <div>
            <Label htmlFor="startupWebsite">Website</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input id="startupWebsite" type="url" value={profileData.startupWebsite || ''} onChange={(e) => setProfileData({ ...profileData, startupWebsite: e.target.value })} placeholder="https://example.com" className="pl-10" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Users className="mr-2" /> Team Information</CardTitle>
          <CardDescription>Tell us about your team.</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="teamInfo">Founders, Co-founders, and Team members</Label>
            <Textarea id="teamInfo" value={profileData.teamInfo || ''} onChange={(e) => setProfileData({ ...profileData, teamInfo: e.target.value })} placeholder="List your team members and their roles." />
          </div>
        </CardContent>
      </Card>

      {/* Document Uploads */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><FileText className="mr-2" /> Documents</CardTitle>
          <CardDescription>Upload your pitch deck, business plan, etc.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 border-2 border-dashed rounded-lg text-center">
            <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">Drag and drop files here, or click to browse.</p>
            <p className="text-xs text-gray-500 mt-1">PDF, DOCX, PPTX up to 10MB</p>
            <Button type="button" variant="outline" className="mt-4">
              Upload Files
            </Button>
          </div>
          {/* We can list uploaded files here in the future */}
        </CardContent>
      </Card>

      {/* Milestones & Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Award className="mr-2" /> Milestones & Achievements</CardTitle>
          <CardDescription>Badges awarded by your mentors.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Badge className="text-lg py-2 px-4 bg-yellow-100 text-yellow-800 border-yellow-200">First Pitch Completed</Badge>
            <Badge className="text-lg py-2 px-4 bg-green-100 text-green-800 border-green-200">Prototype Developed</Badge>
            <Badge className="text-lg py-2 px-4 bg-blue-100 text-blue-800 border-blue-200">Seed Funding Ready</Badge>
            {/* More badges can be added dynamically here */}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Profile
        </Button>
      </div>
    </form>
  );
}
