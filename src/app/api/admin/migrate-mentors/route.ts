// API endpoint to run mentor migration to subcollections
// Call this endpoint to migrate existing mentors to the new structure

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting migration of mentors to subcollection structure...');
    
    const mentorsCollection = collection(db, "mentors");
    const querySnapshot = await getDocs(mentorsCollection);
    
    let migratedCount = 0;
    let skippedCount = 0;
    const results = [];
    
    for (const mentorDoc of querySnapshot.docs) {
      const mentorData = mentorDoc.data();
      const mentorId = mentorDoc.id;
      
      // Check if profile subcollection already exists
      const profileRef = doc(db, "mentors", mentorId, "profile", "details");
      const profileSnap = await getDoc(profileRef);
      
      if (profileSnap.exists()) {
        console.log(`Skipping ${mentorData.name} - profile subcollection already exists`);
        skippedCount++;
        results.push({ name: mentorData.name, status: 'skipped', reason: 'profile already exists' });
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
      results.push({ name: mentorData.name, status: 'migrated' });
    }
    
    const summary = {
      success: true,
      message: `Migration completed successfully!`,
      migratedCount,
      skippedCount,
      totalProcessed: migratedCount + skippedCount,
      results
    };
    
    console.log('Migration completed:', summary);
    return NextResponse.json(summary);
    
  } catch (error: any) {
    console.error('Migration failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: `Migration failed: ${error.message}`,
        error: error.toString()
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Mentor Migration API',
    description: 'Use POST method to run the migration from old mentor structure to new subcollection structure',
    endpoints: {
      'POST /api/admin/migrate-mentors': 'Run the migration'
    }
  });
}
