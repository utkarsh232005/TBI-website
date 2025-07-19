// src/app/mentor/profile/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { User, Camera, Loader2, Save, Mail, MapPin, Globe, Edit } from "lucide-react";

function getInitials(name: string) {
  if (!name) return "?";
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function MentorProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState({
    fullName: "",
    designation: "",
    expertise: "",
    bio: "",
    email: "",
    password: "",
    profilePicture: "",
    linkedin: "",
  });
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check authentication state and fetch profile
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('Auth state changed:', currentUser ? 'User logged in' : 'No user');
      if (currentUser) {
        setUser(currentUser);
        await fetchMentorProfile(currentUser);
      } else {
        setError("Please log in to view your profile");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Helper to fetch mentor profile
  const fetchMentorProfile = async (user: any) => {
    if (!user) {
      setError("Not logged in");
      setLoading(false);
      return;
    }
    try {
      console.log('🔍 Fetching profile for user:', user.uid);
      
      // First check if mentor exists in main collection
      const mentorRef = doc(db, "mentors", user.uid);
      const mentorSnap = await getDoc(mentorRef);
      
      console.log('📋 Main mentor document exists:', mentorSnap.exists());
      if (mentorSnap.exists()) {
        console.log('📋 Main mentor data:', mentorSnap.data());
      }
      
      if (!mentorSnap.exists()) {
        setError("Mentor not found. Please contact admin.");
        setLoading(false);
        return;
      }
      
      const mentorData = mentorSnap.data();
      
      // Get profile details from subcollection
      const profileRef = doc(db, "mentors", user.uid, "profile", "details");
      const profileSnap = await getDoc(profileRef);
      
      console.log('📂 Profile subcollection exists:', profileSnap.exists());
      
      let profileData = null;
      if (profileSnap.exists()) {
        profileData = profileSnap.data();
        console.log('📂 Profile subcollection data:', profileData);
      } else {
        console.log('📂 No profile subcollection found, checking main document for data');
      }
      
      // Use data from either subcollection or main document (backward compatibility)
      const dataSource = profileData || mentorData;
      console.log('🎯 Using data source:', dataSource);
      
      // Organized field mapping with fallbacks for compatibility
      const newProfile = {
        // Personal Information
        fullName: dataSource.name || dataSource.fullName || mentorData.name || user.displayName || "",
        email: user.email || dataSource.email || "",
        password: "",
        
        // Professional Details
        designation: dataSource.designation || "",
        expertise: dataSource.expertise || "",
        bio: dataSource.description || dataSource.bio || "",
        
        // Social & Media Links
        profilePicture: dataSource.profilePictureUrl || dataSource.profilePicture || "",
        linkedin: dataSource.linkedinUrl || dataSource.linkedin || "",
      };
      
      console.log('✅ Final profile object:', newProfile);
      setProfile(newProfile);
      
    } catch (e) {
      console.error('❌ Error fetching mentor profile:', e);
      setError("Failed to load profile: " + (e as Error).message);
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicFile(e.target.files[0]);
    }
  };

  const handleProfilePicURL = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile((prev) => ({ ...prev, profilePicture: e.target.value }));
    setProfilePicFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      if (!user) {
        setError("Not logged in");
        setSaving(false);
        return;
      }
      
      // Temporarily skip image upload completely
      let profilePicURL = profile.profilePicture;
      if (profilePicFile) {
        setError("Image upload is temporarily disabled. Your profile data will still be saved.");
        // Clear the file input
        setProfilePicFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
      
      const docRef = doc(db, "mentors", user.uid, "profile", "details");
      const data = {
        // Personal Information
        name: profile.fullName,
        email: profile.email,
        
        // Professional Details
        designation: profile.designation,
        expertise: profile.expertise,
        description: profile.bio,
        
        // Social & Media Links
        profilePictureUrl: profilePicURL,
        linkedinUrl: profile.linkedin,
        
        // Metadata
        updatedAt: new Date(),
        lastModified: new Date().toISOString(),
        profileVersion: "2.0"
      };
      
      await setDoc(docRef, data, { merge: true });
      setSuccess("Profile updated successfully!");
      
      // Refetch profile to update UI with latest data
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Organized field mapping with fallbacks for compatibility
        setProfile({
          // Personal Information
          fullName: data.name || data.fullName || "",
          email: profile.email,
          password: "",
          
          // Professional Details
          designation: data.designation || "",
          expertise: data.expertise || "",
          bio: data.description || data.bio || "",
          
          // Social & Media Links
          profilePicture: data.profilePictureUrl || data.profilePicture || "",
          linkedin: data.linkedinUrl || data.linkedin || "",
        });
      }
    } catch (e) {
      console.error('Profile save error:', e);
      setError("Failed to save profile");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Profile Settings
            </h1>
            <p className="text-gray-600 text-lg">
              Manage your mentor profile and information
            </p>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Edit className="h-5 w-5" />
            <span className="text-sm">Edit Mode</span>
          </div>
        </div>
      </div>

      <Card className="border-gray-200 bg-white shadow-sm">
        <CardHeader className="pb-6">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              {profile.profilePicture ? (
                <img
                  src={profile.profilePicture}
                  alt="Profile"
                  className="h-32 w-32 rounded-full object-cover border-4 border-blue-200 shadow-lg"
                />
              ) : (
                <div className="h-32 w-32 rounded-full bg-blue-100 flex items-center justify-center text-4xl font-bold text-blue-700 border-4 border-blue-200 shadow-lg">
                  {getInitials(profile.fullName)}
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg border-2 border-white transition-colors"
              >
                <Camera className="h-4 w-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePicChange}
                className="hidden"
              />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{profile.fullName || "Mentor"}</h2>
              <p className="text-blue-600">{profile.designation || "Mentor"}</p>
              {profile.email && (
                <div className="flex items-center justify-center text-gray-600 mt-2">
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="text-sm">{profile.email}</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm tracking-wide">Full Name</label>
                <Input 
                  name="fullName" 
                  value={profile.fullName} 
                  onChange={handleChange} 
                  placeholder="e.g., Dr. Jane Doe" 
                  required 
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500" 
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm tracking-wide">Designation</label>
                <Input 
                  name="designation" 
                  value={profile.designation} 
                  onChange={handleChange} 
                  placeholder="e.g., Lead Innovator, Acme Corp" 
                  required 
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500" 
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm tracking-wide">Area of Expertise/Mentorship</label>
              <Input 
                name="expertise" 
                value={profile.expertise} 
                onChange={handleChange} 
                placeholder="e.g., AI & Machine Learning" 
                required 
                className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500" 
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm tracking-wide">Description / Bio</label>
              <Textarea 
                name="bio" 
                value={profile.bio} 
                onChange={handleChange} 
                placeholder="Brief description of your background and mentoring experience..." 
                rows={4} 
                required 
                className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 resize-none" 
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm tracking-wide">Email Address</label>
              <Input 
                name="email" 
                value={profile.email} 
                onChange={handleChange} 
                placeholder="mentor@example.com" 
                type="email" 
                required 
                disabled 
                className="bg-gray-100 border-gray-300 text-gray-500 placeholder-gray-400 cursor-not-allowed" 
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed after registration</p>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm tracking-wide">LinkedIn Profile URL (Optional)</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  name="linkedin" 
                  value={profile.linkedin} 
                  onChange={handleChange} 
                  placeholder="https://linkedin.com/in/username" 
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 pl-10" 
                />
              </div>
            </div>

            {/* Error and Success Messages */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Profile
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
