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

  // Helper to fetch mentor profile
  const fetchMentorProfile = async (user: any) => {
    if (!user) {
      setError("Not logged in");
      setLoading(false);
      return;
    }
    try {
      const docRef = doc(db, "mentors", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile({
          fullName: data.fullName || "",
          designation: data.designation || "",
          expertise: data.expertise || "",
          bio: data.bio || "",
          email: user.email || "",
          password: "",
          profilePicture: data.profilePicture || "",
          linkedin: data.linkedin || "",
        });
      } else {
        // Create a default mentor document if it doesn't exist
        const defaultProfile = {
          fullName: user.displayName || "",
          designation: "",
          expertise: "",
          bio: "",
          email: user.email || "",
          password: "",
          profilePicture: user.photoURL || "",
          linkedin: "",
          createdAt: new Date(),
        };
        await setDoc(docRef, defaultProfile, { merge: true });
        setProfile(defaultProfile);
      }
    } catch (e) {
      setError("Failed to load profile");
    }
    setLoading(false);
  };

  // Listen for auth state changes
  useEffect(() => {
    setLoading(true);
    setError("");
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      fetchMentorProfile(user);
    });
    return () => unsubscribe();
  }, []);

  // If already logged in, fetch profile immediately on mount
  useEffect(() => {
    const auth = getAuth();
    if (auth.currentUser) {
      setLoading(true);
      setError("");
      fetchMentorProfile(auth.currentUser);
    }
  }, []);

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
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        setError("Not logged in");
        setSaving(false);
        return;
      }
      let profilePicURL = profile.profilePicture;
      if (profilePicFile) {
        // Upload to Firebase Storage
        const storageRef = ref(storage, `mentor-profile-pics/${user.uid}`);
        await uploadBytes(storageRef, profilePicFile);
        profilePicURL = await getDownloadURL(storageRef);
      }
      const docRef = doc(db, "mentors", user.uid);
      const data = {
        fullName: profile.fullName,
        designation: profile.designation,
        expertise: profile.expertise,
        bio: profile.bio,
        profilePicture: profilePicURL,
        linkedin: profile.linkedin,
        email: profile.email,
        updatedAt: new Date(),
      };
      await setDoc(docRef, data, { merge: true });
      setSuccess("Profile updated successfully!");
      // Refetch profile to update UI with latest data
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile({
          fullName: data.fullName || "",
          designation: data.designation || "",
          expertise: data.expertise || "",
          bio: data.bio || "",
          email: profile.email,
          password: "",
          profilePicture: data.profilePicture || "",
          linkedin: data.linkedin || "",
        });
      }
    } catch (e) {
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
