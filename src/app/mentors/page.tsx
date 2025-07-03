// src/app/mentors/page.tsx
"use client";

import { useEffect, useState } from 'react';
import MentorCard, { type Mentor as PublicMentor } from '@/components/ui/mentor-card';
import MainNavbar from '@/components/ui/main-navbar';
import Footer from '@/components/ui/footer';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';
import { Loader2, AlertCircle, Users } from 'lucide-react';
import { AuroraText } from "@/components/magicui/aurora-text";
import { processImageUrl } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

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

// This is the structure of mentor data stored in Firestore
export interface FirestoreMentor {
  id: string;
  name: string;
  designation: string;
  expertise: string; // "Area of Mentorship" from form
  description: string;
  profilePictureUrl?: string; // "avatarUrl" from form
  linkedinUrl?: string;
  email: string;
  createdAt?: Timestamp; // For ordering
  // Other fields like backgroundImageUrl are not directly from Firestore for now
}

export default function MentorsPage() {
  const [mentors, setMentors] = useState<PublicMentor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMentors = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const mentorsCollection = collection(db, "mentors");
        const q = query(mentorsCollection, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedMentors: PublicMentor[] = []; querySnapshot.forEach((doc) => {
          const data = doc.data() as Omit<FirestoreMentor, 'id'>; // Cast to known Firestore structure
          fetchedMentors.push({
            id: doc.id,
            name: data.name,
            designation: data.designation,
            description: data.description,
            areaOfMentorship: data.expertise, // Map expertise to areaOfMentorship
            email: data.email,
            avatarUrl: processImageUrl(data.profilePictureUrl || '', data.name.substring(0, 2)),
            // Using a default placeholder for background, as this is not in Firestore
            backgroundImageUrl: processImageUrl(
              '',
              data.name.substring(0, 1)
            ),
            dataAiHintAvatar: `professional ${data.name.split(' ')[0].toLowerCase()}`,
            dataAiHintBackground: 'abstract tech design',
            linkedinUrl: data.linkedinUrl,
          });
        });
        setMentors(fetchedMentors);
      } catch (err: any) {
        console.error("Error fetching mentors for public page: ", err);
        let detailedError = "Failed to load mentors. Please try again later.";
        if (err.code === 'permission-denied' || (err.message && (err.message.toLowerCase().includes('permission-denied') || err.message.toLowerCase().includes('insufficient permissions')))) {
          detailedError = "Failed to load mentors: Missing or insufficient Firestore permissions. Please check your Firestore security rules for the 'mentors' collection to allow reads.";
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

  return (
    <div className="flex flex-col min-h-screen bg-background font-poppins">
      <MainNavbar />
      <main className="flex-grow py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">          <motion.div
          className="text-center mb-12 md:mb-16"
          initial="hidden"
          animate="visible"
          variants={pageTitleVariants}
        >
          <AuroraText>Meet Our Mentors</AuroraText>
          <motion.p
            className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground sm:text-xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2, ease: "easeOut" } }}
          >
            Guiding visionaries to success with expert mentorship and industry insights.
          </motion.p>
        </motion.div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-20 text-destructive">
              <AlertCircle className="mx-auto h-12 w-12 mb-4" />
              <p className="text-xl font-semibold">Could not load mentors</p>
              <p className="text-muted-foreground">{error}</p>
            </div>
          ) : mentors.length === 0 ? (
            <div className="text-center py-20">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">
                No mentors to display at the moment. Check back soon or add them via the admin panel.
              </p>
            </div>
          ) : (
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
                    showSelectButton={false}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
