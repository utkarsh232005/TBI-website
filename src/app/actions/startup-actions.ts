// src/app/actions/startup-actions.ts
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

// Schema matches the form validation schema in the page component
const startupFormSchema = z.object({
  name: z.string().min(3),
  logoUrl: z.string().url().optional().or(z.literal('')),
  logoFile: z.any().optional(), 
  description: z.string().min(10),
  badgeText: z.string().min(2),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  funnelSource: z.string().min(1),
  session: z.string().min(1),
  monthYearOfIncubation: z.string().min(1),
  status: z.string().min(1),
  legalStatus: z.string().min(1),
  rknecEmailId: z.string().email(),
  emailId: z.string().email(),
  mobileNumber: z.string().min(10).max(15),
});

export type StartupFormValues = z.infer<typeof startupFormSchema>;

interface CreateStartupResponse {
  success: boolean;
  message?: string;
  startupId?: string;
}

interface UpdateStartupResponse {
  success: boolean;
  message?: string;
}

interface DeleteStartupResponse {
  success: boolean;
  message?: string;
}

// --- Helper to determine logo URL ---
function determineLogoUrl(name: string, providedLogoUrl?: string, providedLogoFile?: any): string {
  let logoUrlToStore = providedLogoUrl || `https://placehold.co/300x150/1A1A1A/FFFFFF.png?text=${encodeURIComponent(name.substring(0,3))}`;
  if (providedLogoFile) {
    // SIMULATION: In a real app, upload logoFile to Firebase Storage and get its public URL.
    // For this simulation, if a file is provided, we use a specific placeholder.
    logoUrlToStore = `https://placehold.co/300x150/7DF9FF/121212.png?text=${encodeURIComponent(name.substring(0,3))}&file=uploaded`;
    console.log("--- SIMULATING FILE UPLOAD ---");
    console.log("Received logo file:", providedLogoFile.name);
    console.log("Using placeholder URL for 'uploaded' file:", logoUrlToStore);
    console.log("--- END SIMULATION ---");
  }
  return logoUrlToStore;
}

// --- Create Startup Action ---
export async function createStartupAction(values: StartupFormValues): Promise<CreateStartupResponse> {
  try {
    const validatedValues = startupFormSchema.safeParse(values);
    if (!validatedValues.success) {
      console.error("Server-side validation failed for startup creation:", validatedValues.error.flatten().fieldErrors);      return { success: false, message: "Invalid input data for startup. " + JSON.stringify(validatedValues.error.flatten().fieldErrors) };
    }
    const { name, logoUrl, logoFile, description, badgeText, websiteUrl, funnelSource, session, monthYearOfIncubation, status, legalStatus, rknecEmailId, emailId, mobileNumber } = validatedValues.data;
    const finalLogoUrl = determineLogoUrl(name, logoUrl, logoFile);
    
    const startupData = {
      name,
      logoUrl: finalLogoUrl,
      description,
      badgeText,
      websiteUrl: websiteUrl || "",  // Use empty string instead of undefined
      funnelSource,
      session,
      monthYearOfIncubation,
      status,
      legalStatus,
      rknecEmailId,
      emailId,
      mobileNumber,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "startups"), startupData);
    
    revalidatePath('/admin/startups');
    revalidatePath('/'); 

    return { success: true, startupId: docRef.id, message: "Startup added successfully." };

  } catch (error: any) {
    console.error("Error in createStartupAction: ", error);
    let errorMessage = "Failed to add startup.";
    if (error.code === 'permission-denied') {
        errorMessage = "Permission denied. Check Firestore rules for 'startups' collection.";
    } else if (error.message) {
        errorMessage = error.message;
    }
    return { success: false, message: errorMessage };
  }
}

// --- Update Startup Action ---
export async function updateStartupAction(startupId: string, values: StartupFormValues): Promise<UpdateStartupResponse> {
  try {
    const validatedValues = startupFormSchema.safeParse(values);
    if (!validatedValues.success) {
      console.error("Server-side validation failed for startup update:", validatedValues.error.flatten().fieldErrors);
      return { success: false, message: "Invalid input data for startup update. " + JSON.stringify(validatedValues.error.flatten().fieldErrors) };
    }
    const { name, logoUrl, logoFile, description, badgeText, websiteUrl, funnelSource, session, monthYearOfIncubation, status, legalStatus, rknecEmailId, emailId, mobileNumber } = validatedValues.data;
    const startupDocRef = doc(db, "startups", startupId);
    
    // Determine logo URL - needs careful handling to preserve existing if not changed
    // If logoFile is provided, it takes precedence.
    // If logoUrl is provided and logoFile is not, new logoUrl is used.
    // If neither is provided, the existing logoUrl should ideally be kept (this requires fetching current doc or careful form logic).
    // For simplicity here, if logoFile is present, it changes. If logoUrl field is explicitly set, it changes.
    // Otherwise, it might default to placeholder if not handled carefully on the client side before calling update.
    // A robust solution would fetch the doc, compare, and only update logoUrl if new info is provided.
    // Let's assume the client sends the intended final logoUrl (either existing or new one from URL input, or one from file upload simulation).
    // The current form logic will likely send an empty `logoUrl` if it was cleared, or the existing one if not touched, or a new one if typed.
    // The `determineLogoUrl` will handle the file upload simulation.
    
    const updateData: Partial<StartupFormValues & { updatedAt: any, logoUrl?: string }> = {
      name,
      description,
      badgeText,
      websiteUrl: websiteUrl || "",  // Use empty string instead of undefined
      funnelSource,
      session,
      monthYearOfIncubation,
      status,
      legalStatus,
      rknecEmailId,
      emailId,
      mobileNumber,
      updatedAt: serverTimestamp(),
    };

    // Only update logoUrl if a new file is uploaded OR a new logoUrl is provided
    // This means if form.logoUrl is empty and no file, it will use placeholder via determineLogoUrl logic
    // Client should send existing logoUrl if no change is desired
    const finalLogoUrl = determineLogoUrl(name, logoUrl, logoFile);
    updateData.logoUrl = finalLogoUrl;


    await updateDoc(startupDocRef, updateData);

    revalidatePath('/admin/startups');
    revalidatePath('/');

    return { success: true, message: "Startup updated successfully." };

  } catch (error: any) {
    console.error("Error in updateStartupAction: ", error);
    let errorMessage = "Failed to update startup.";
    if (error.code === 'permission-denied') {
        errorMessage = "Permission denied. Check Firestore rules for 'startups' collection.";
    } else if (error.message) {
        errorMessage = error.message;
    }
    return { success: false, message: errorMessage };
  }
}

// --- Delete Startup Action ---
export async function deleteStartupAction(startupId: string): Promise<DeleteStartupResponse> {
  try {
    const startupDocRef = doc(db, "startups", startupId);
    await deleteDoc(startupDocRef);

    revalidatePath('/admin/startups');
    revalidatePath('/');

    return { success: true, message: "Startup deleted successfully." };

  } catch (error: any) {
    console.error("Error in deleteStartupAction: ", error);
    let errorMessage = "Failed to delete startup.";
    if (error.code === 'permission-denied') {
        errorMessage = "Permission denied. Check Firestore rules for 'startups' collection.";
    } else if (error.message) {
        errorMessage = error.message;
    }
    return { success: false, message: errorMessage };
  }
}


export interface ImportStartupsResponse {
  success: boolean;
  message?: string;
  importedCount?: number;
  errors?: any[];
}

export interface StartupRowData {
  "Startup Name": string;
  "Founder Details": string;
  "Incubation Stage": string;
  "Legal Registration Type": string;
  "Funding Support": string;
  "Recognition": string;
  "Business Category & Industry": string;
  "Contact Information": string;
}

export async function importStartupsFromTable(data: StartupRowData[]): Promise<ImportStartupsResponse> {
  console.log("Attempting to import startups from provided table data...");
  let importedCount = 0;
  const importErrors: any[] = [];

  for (const row of data) {
    try {      const name = row["Startup Name"] || "Unknown Startup";
      const badgeText = row["Business Category & Industry"] || "General";
      const description = `Startup: ${row["Startup Name"]}. Founded by: ${row["Founder Details"]}. Incubation Stage: ${row["Incubation Stage"]}. Legal Type: ${row["Legal Registration Type"]}. Funding: ${row["Funding Support"]}. Recognition: ${row["Recognition"]}. Category: ${row["Business Category & Industry"]}. Contact: ${row["Contact Information"]}.`;
      
      const logoUrl = `https://placehold.co/300x150/1A1A1A/FFFFFF.png?text=${encodeURIComponent(name.substring(0,3))}`;
      const websiteUrl = ""; // No direct mapping, leave empty

      // Map new required fields with defaults or extracted data
      const funnelSource = "Direct Application"; // Default value
      const session = "2024-25"; // Default current session
      const monthYearOfIncubation = "January 2024"; // Default value
      const status = row["Incubation Stage"] || "Active"; // Map from existing data
      const legalStatus = row["Legal Registration Type"] || "Not Registered"; // Map from existing data
      const rknecEmailId = "contact@rknec.edu"; // Default institutional email
      const emailId = row["Contact Information"] || "contact@startup.com"; // Extract from contact info or default
      const mobileNumber = "9876543210"; // Default mobile number

      const startupData = {
        name,
        logoUrl,
        description,
        badgeText,
        websiteUrl,
        funnelSource,
        session,
        monthYearOfIncubation,
        status,
        legalStatus,
        rknecEmailId,
        emailId,
        mobileNumber,
      };

      // Validate against the existing schema
      const validatedData = startupFormSchema.safeParse(startupData);
      if (!validatedData.success) {
        console.error("Validation failed for imported startup:", validatedData.error.flatten().fieldErrors);
        importErrors.push({ row, error: "Validation failed: " + JSON.stringify(validatedData.error.flatten().fieldErrors) });
        continue; 
      }
      
      const dataToSave = {
        ...validatedData.data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      // Remove logoFile if present, as it's not for DB storage
      if ('logoFile' in dataToSave) {
        delete (dataToSave as any).logoFile;
      }


      await addDoc(collection(db, "startups"), dataToSave);
      importedCount++;
    } catch (rowError: any) {
      console.error("Error processing startup row:", row, rowError);
      importErrors.push({ row, error: rowError.message });
    }
  }

  revalidatePath('/admin/startups');
  revalidatePath('/');

  if (importErrors.length > 0) {
    return {
      success: false,
      message: `Import completed with ${importedCount} successful imports and ${importErrors.length} errors.`,
      importedCount,
      errors: importErrors,
    };
  } else {
    return { success: true, message: `Successfully imported ${importedCount} startups.`, importedCount };
  }
}
