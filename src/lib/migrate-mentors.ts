// Migration utility to convert existing mentor structure to new subcollection structure
// Run this script to migrate existing mentors to the new format

import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Use existing Firebase instance

interface MigrationResult {
  success: boolean;
  migrated?: number;
  skipped?: number;
  error?: string;
}

export async function migrateMentorsToSubcollections(): Promise<MigrationResult> {
  console.log('Starting migration of mentors to subcollection structure...');
  
  try {
    const mentorsCollection = collection(db, "mentors");
    const querySnapshot = await getDocs(mentorsCollection);
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const mentorDoc of querySnapshot.docs) {
      const mentorData = mentorDoc.data();
      const mentorId = mentorDoc.id;
      
      // Check if profile subcollection already exists
      const profileRef = doc(db, "mentors", mentorId, "profile", "details");
      const profileSnap = await getDoc(profileRef);
      
      if (profileSnap.exists()) {
        console.log(`Skipping ${mentorData.name} - profile subcollection already exists`);
        skippedCount++;
        continue;
      }
      
      // Create profile subcollection from existing mentor data
      const profileData = {
        // Personal Information
        name: mentorData.name || "",
        email: mentorData.email || "",
        
        // Professional Details
        designation: mentorData.designation || "",
        expertise: mentorData.expertise || "",
        description: mentorData.description || "",
        
        // Social & Media Links
        profilePictureUrl: mentorData.profilePictureUrl || "",
        linkedinUrl: mentorData.linkedinUrl || "",
        
        // Metadata
        createdAt: mentorData.createdAt || new Date(),
        updatedAt: new Date(),
        lastModified: new Date().toISOString(),
        profileVersion: "2.0",
        isActive: true,
      };
      
      // Update main mentor document to new structure (minimal data)
      const newMentorData = {
        uid: mentorData.uid || mentorId,
        name: mentorData.name || "",
        email: mentorData.email || "",
        role: 'mentor',
        status: 'active',
        createdAt: mentorData.createdAt || new Date(),
        updatedAt: new Date(),
      };
      
      // Save both documents
      await setDoc(doc(db, "mentors", mentorId), newMentorData, { merge: true });
      await setDoc(profileRef, profileData);
      
      console.log(`Migrated ${mentorData.name} successfully`);
      migratedCount++;
    }
    
    console.log(`Migration completed! Migrated: ${migratedCount}, Skipped: ${skippedCount}`);
    return { success: true, migrated: migratedCount, skipped: skippedCount };
    
  } catch (error: any) {
    console.error('Migration failed:', error);
    return { success: false, error: error?.message || 'Unknown error occurred' };
  }
}

// Manual migration function for admin
export async function runMigration() {
  const result = await migrateMentorsToSubcollections();
  
  if (result.success) {
    alert(`Migration completed successfully!\nMigrated: ${result.migrated} mentors\nSkipped: ${result.skipped} mentors`);
  } else {
    alert(`Migration failed: ${result.error}`);
  }
  
  return result;
}

// Call this function from browser console or create a button to trigger it
// window.runMigration = runMigration;
