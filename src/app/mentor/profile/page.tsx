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
import { User } from "lucide-react";

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
        name: profile.fullName,           // For existing mentor system compatibility
        fullName: profile.fullName,       // Primary name field
        email: profile.email,
        
        // Professional Details
        designation: profile.designation,
        expertise: profile.expertise,
        description: profile.bio,         // For existing mentor system compatibility
        bio: profile.bio,                 // Primary bio field
        
        // Social & Media Links
        profilePictureUrl: profilePicURL, // For existing mentor system compatibility
        profilePicture: profilePicURL,    // Primary profile picture field
        linkedinUrl: profile.linkedin,    // For existing mentor system compatibility
        linkedin: profile.linkedin,       // Primary LinkedIn field
        
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

  if (loading) return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-40 bg-gray-200 rounded" />
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="h-8 bg-gray-200 rounded w-1/4" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
      <div className="w-full max-w-2xl mx-auto space-y-8 p-4 sm:p-8">
        
        <Card className="bg-white border border-gray-100 shadow-lg rounded-2xl">
          <CardHeader className="flex flex-col items-center gap-2 pb-2">
            <div className="relative flex flex-col items-center w-full">
              {profile.profilePicture ? (
                <img
                  src={profile.profilePicture}
                  alt="Profile"
                  className="h-24 w-24 rounded-full object-cover border-2 border-primary shadow"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-500 border-2 border-primary shadow">
                  {getInitials(profile.fullName)}
                </div>
              )}
              <div className="mt-2 text-xl font-semibold text-gray-900">{profile.fullName || "Mentor"}</div>
              <div className="text-sm text-gray-500">{profile.designation}</div>
            </div>
          </CardHeader>
          <CardContent>
            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-base tracking-wide">Full Name</label>
                  <Input name="fullName" value={profile.fullName} onChange={handleChange} placeholder="e.g., Dr. Jane Doe" required className="bg-gray-100 border border-gray-200 rounded-lg placeholder-gray-400 text-gray-800" />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-base tracking-wide">Designation</label>
                  <Input name="designation" value={profile.designation} onChange={handleChange} placeholder="e.g., Lead Innovator, Acme Corp" required className="bg-gray-100 border border-gray-200 rounded-lg placeholder-gray-400 text-gray-800" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-gray-700 font-semibold mb-2 text-base tracking-wide">Area of Expertise/Mentorship</label>
                  <Input name="expertise" value={profile.expertise} onChange={handleChange} placeholder="e.g., AI & Machine Learning" required className="bg-gray-100 border border-gray-200 rounded-lg placeholder-gray-400 text-gray-800" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-gray-700 font-semibold mb-2 text-base tracking-wide">Description / Bio</label>
                  <Textarea name="bio" value={profile.bio} onChange={handleChange} placeholder="Brief description of the mentor's background and experience..." rows={4} required className="bg-gray-100 border border-gray-200 rounded-lg placeholder-gray-400 text-gray-800" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-gray-700 font-semibold mb-2 text-base tracking-wide">Email Address (for login)</label>
                  <Input name="email" value={profile.email} onChange={handleChange} placeholder="mentor@example.com" type="email" required disabled className="bg-gray-100 border border-gray-200 rounded-lg placeholder-gray-400 text-gray-800 cursor-not-allowed" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-gray-700 font-semibold mb-2 text-base tracking-wide">Profile Picture</label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/gif"
                      onChange={handleProfilePicChange}
                      ref={fileInputRef}
                      className="hidden"
                      id="profilePicInput"
                    />
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                      className="bg-blue-400 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-500 focus:bg-blue-500 active:bg-blue-600 transition border border-blue-400 hover:border-blue-500 focus:border-blue-500 active:border-blue-600"
                      style={{ backgroundColor: '#60a5fa', borderColor: '#60a5fa' }}
                    >
                      Choose File
                    </Button>
                    <span className="text-xs text-gray-500">
                      {profilePicFile ? profilePicFile.name : "PNG, JPG, GIF up to 3MB"}
                    </span>
                  </div>
                  <p className="text-xs text-amber-600 mt-2">
                    Note: Image uploads are temporarily unavailable while Firebase Storage is being configured. Profile data will still be saved.
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-gray-700 font-semibold mb-2 text-base tracking-wide">LinkedIn Profile URL (Optional)</label>
                  <Input name="linkedin" value={profile.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/username" className="bg-gray-100 border border-gray-200 rounded-lg placeholder-gray-400 text-gray-800" />
                </div>
              </div>
              {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
              {success && <div className="text-green-600 text-sm mt-2">{success}</div>}
              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-2 text-base font-semibold bg-blue-400 text-white rounded-lg shadow hover:bg-blue-500 focus:bg-blue-500 active:bg-blue-600 transition border border-blue-400 hover:border-blue-500 focus:border-blue-500 active:border-blue-600"
                  style={{ backgroundColor: '#60a5fa', borderColor: '#60a5fa' }}
                >
                  {saving ? (
                    <span className="flex items-center gap-2"><span className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full"></span>Saving...</span>
                  ) : (
                    "Save Profile"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
