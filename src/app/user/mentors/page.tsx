
// src/app/user/mentors/page.tsx
"use client";

import { useEffect, useState } from 'react';
import MentorCard, { type Mentor as PublicMentor } from '@/components/ui/mentor-card';
import MentorRequestDialog from '@/components/ui/mentor-request-dialog';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';
import { Loader2, AlertCircle, Users, Lock } from 'lucide-react';
import { processImageUrl } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useUser } from '@/contexts/user-context';

// This is the structure of mentor data stored in Firestore (from admin side)
interface FirestoreMentor {
  id: string;
  name: string;
  designation: string;
  expertise: string;
  description: string;
  profilePictureUrl?: string;
  linkedinUrl?: string;
  email: string;
  createdAt?: Timestamp;
}

const pageTitleVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const gridVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const cardItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function UserMentorsPage() {
  const [mentors, setMentors] = useState<PublicMentor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMentor, setSelectedMentor] = useState<PublicMentor | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user, isLoading: userLoading } = useUser();
  const { toast } = useToast();

  const handleSelectMentor = (mentorId: string) => {
    const mentor = mentors.find(m => m.id === mentorId);
    if (mentor) {
      setSelectedMentor(mentor);
      setIsDialogOpen(true);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedMentor(null);
  };

  useEffect(() => {
    const fetchMentors = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const mentorsCollection = collection(db, "mentors");
        const q = query(mentorsCollection, orderBy("createdAt", "desc")); // Assuming createdAt exists
        const querySnapshot = await getDocs(q);
        const fetchedMentors: PublicMentor[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as Omit<FirestoreMentor, 'id'>;
          fetchedMentors.push({
            id: doc.id,
            name: data.name,
            designation: data.designation,
            description: data.description,
            areaOfMentorship: data.expertise,
            email: data.email,
            avatarUrl: data.profilePictureUrl || `https://placehold.co/100x100/7DF9FF/121212.png?text=${encodeURIComponent(data.name.substring(0, 2))}`,
            backgroundImageUrl: `https://placehold.co/400x600/121212/1E1E1E.png?text=${encodeURIComponent(data.name.substring(0, 1))}`,
            dataAiHintAvatar: `professional ${data.name.split(' ')[0].toLowerCase()}`,
            dataAiHintBackground: 'abstract tech design',
            linkedinUrl: data.linkedinUrl,
          });
        });
        setMentors(fetchedMentors);
      } catch (err: any) {
        console.error("Error fetching mentors for user page: ", err);
        let detailedError = "Failed to load mentors. Please try again later.";
        if (err.code === 'permission-denied' || (err.message && (err.message.toLowerCase().includes('permission-denied') || err.message.toLowerCase().includes('insufficient permissions')))) {
          detailedError = "Failed to load mentors: Firestore permission issue.";
        } else if (err.message) {
          detailedError += ` ${err.message}`;
        }
        setError(detailedError);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMentors();
  }, []);

  // Show loading state while checking user authentication
  if (userLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-400" />
      </div>
    );
  }

  // Show authentication required message if user is not logged in
  if (!user) {
    return (
      <div className="text-center py-20">
        <Lock className="mx-auto h-12 w-12 text-neutral-500 mb-4" />
        <h2 className="text-2xl font-semibold text-white mb-2">Authentication Required</h2>
        <p className="text-neutral-400 text-lg">
          Please log in to view and select mentors.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        className="text-left mb-8"
        initial="hidden"
        animate="visible"
        variants={pageTitleVariants}
      >
        <h1 className="font-montserrat text-3xl font-bold tracking-tight text-white">
          Our Mentors
        </h1>
        <motion.p
          className="mt-2 max-w-2xl text-lg text-neutral-400"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2, ease: "easeOut" } }}
        >
          Connect with experienced professionals to guide your startup journey.
        </motion.p>
      </motion.div>

      {userLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-400" />
        </div>
      ) : !user ? (
        <div className="text-center py-10 bg-amber-900/20 border border-amber-500/30 rounded-lg p-6">
          <Lock className="mx-auto h-10 w-10 mb-3 text-amber-400" />
          <p className="text-xl font-semibold text-amber-300">Authentication Required</p>
          <p className="text-neutral-400">Please log in to view and select mentors.</p>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-400" />
        </div>
      ) : error ? (
        <div className="text-center py-10 bg-rose-900/20 border border-rose-500/30 rounded-lg p-6 text-rose-300">
          <AlertCircle className="mx-auto h-10 w-10 mb-3 text-rose-400" />
          <p className="text-xl font-semibold">Could not load mentors</p>
          <p className="text-neutral-400">{error}</p>
        </div>
      ) : mentors.length === 0 ? (
        <div className="text-center py-10 bg-neutral-800/30 rounded-lg border border-dashed border-neutral-700">
          <Users className="mx-auto h-12 w-12 text-neutral-500 mb-4" />
          <p className="text-neutral-400 text-lg">
            No mentors are currently listed. Please check back later.
          </p>
        </div>
      ) : (
        <>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={gridVariants}
          >
            {mentors.map((mentor) => (
              <motion.div key={mentor.id} variants={cardItemVariants}>
                <MentorCard
                  mentor={mentor}
                  showSelectButton={true}
                  onSelectMentor={handleSelectMentor}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Mentor Request Dialog */}
          {selectedMentor && user && (
            <MentorRequestDialog
              isOpen={isDialogOpen}
              onClose={handleCloseDialog}
              mentor={selectedMentor}
              userId={user.uid}
              userEmail={user.email}
              userName={user.name}
            />
          )}
        </>
      )}
    </div>
  );
}
