import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc } from 'firebase/firestore';

interface MigrationResult {
  success: boolean;
  message: string;
  updatedCount: number;
  errors: any[];
}

export async function migrateContactSubmissionsSchema(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: false,
    message: '',
    updatedCount: 0,
    errors: []
  };

  try {
    const submissionsRef = collection(db, 'contactSubmissions');
    const snapshot = await getDocs(submissionsRef);
    
    for (const doc of snapshot.docs) {
      try {
        // Only update documents that don't have the new fields
        const data = doc.data();
        if (!data.phone || !data.inquiryType || !data.companyEmail) {
          await updateDoc(doc.ref, {
            // Set default values for new required fields
            phone: data.phone || '',
            inquiryType: data.inquiryType || 'Incubation',
            companyEmail: data.companyEmail || data.email || '', // Use existing email as fallback
            founders: data.founders || [data.name || ''], // Use existing name as first founder
            founderBio: data.founderBio || '',
            linkedinUrl: data.linkedinUrl || '',
            teamInfo: data.teamInfo || '',
            ideaDescription: data.ideaDescription || data.idea || '', // Use existing idea as fallback
            targetAudience: data.targetAudience || '',
            problemStatement: data.problemStatement || '',
            uniqueValueProp: data.uniqueValueProp || '',
            currentStage: data.currentStage || 'Ideation',
            supportingFile: data.supportingFile || null
          });
          result.updatedCount++;
        }
      } catch (err) {
        console.error(`Error updating document ${doc.id}:`, err);
        result.errors.push({ docId: doc.id, error: err });
      }
    }

    result.success = true;
    result.message = `Successfully migrated ${result.updatedCount} documents${result.errors.length > 0 ? ` with ${result.errors.length} errors` : ''}`;
  } catch (err) {
    result.success = false;
    result.message = `Migration failed: ${err instanceof Error ? err.message : 'Unknown error'}`;
  }

  return result;
}

// Field-to-Column Mapping Type Reference:
/*
{
  // Original fields
  name: string               // VARCHAR     Required
  email: string             // VARCHAR     Required
  companyName: string       // VARCHAR     Optional
  idea: string              // TEXT        Required
  
  // New fields
  phone: string             // VARCHAR     Required
  inquiryType: string       // VARCHAR     Required (Enum: Incubation, Startup Idea, General Question)
  companyEmail: string      // VARCHAR     Required
  founders: string[]        // JSONB       Required
  founderBio: string        // TEXT        Optional
  linkedinUrl: string       // VARCHAR     Required
  teamInfo: string          // TEXT        Optional
  ideaDescription: string   // TEXT        Required
  targetAudience: string    // TEXT        Required
  problemStatement: string  // TEXT        Optional
  uniqueValueProp: string   // TEXT        Required
  currentStage: string      // VARCHAR     Optional (Enum: Ideation, MVP, Early Revenue, Scaling)
  supportingFile: string    // VARCHAR     Required (URL)

  // Metadata fields
  submittedAt: Timestamp
  campusStatus: string      // VARCHAR     Optional (Enum: campus, off-campus)
  status: string           // VARCHAR     Required (Enum: pending, accepted, rejected)
}
*/
