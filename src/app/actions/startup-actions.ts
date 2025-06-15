// src/app/actions/startup-actions.ts
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

// Schema matches the form validation schema in the page component
// Note: For actual file uploads, the schema and handling would be different (e.g., using FormData)
const startupFormSchema = z.object({
  name: z.string().min(3),
  logoUrl: z.string().url().optional().or(z.literal('')),
  logoFile: z.any().optional(), // Accept any file type for now, specific validation on client
  description: z.string().min(10),
  badgeText: z.string().min(2),
  websiteUrl: z.string().url().optional().or(z.literal('')),
});

export type StartupFormValues = z.infer<typeof startupFormSchema>;

interface CreateStartupResponse {
  success: boolean;
  message?: string;
  startupId?: string;
}

export async function createStartupAction(values: StartupFormValues): Promise<CreateStartupResponse> {
  try {
    const validatedValues = startupFormSchema.safeParse(values);
    if (!validatedValues.success) {
      console.error("Server-side validation failed for startup:", validatedValues.error.flatten().fieldErrors);
      return { success: false, message: "Invalid input data for startup. " + JSON.stringify(validatedValues.error.flatten().fieldErrors) };
    }
    
    const { name, logoUrl, logoFile, description, badgeText, websiteUrl } = validatedValues.data;

    let logoUrlToStore = logoUrl || `https://placehold.co/300x150/1A1A1A/FFFFFF.png?text=${encodeURIComponent(name.substring(0,3))}`;

    if (logoFile) {
      // THIS IS A SIMULATION. In a real app, you would upload logoFile to Firebase Storage
      // and get back a public URL to store in Firestore.
      console.log("--- SIMULATING FILE UPLOAD ---");
      console.log("Received logo file:", logoFile.name, `(${(logoFile.size / 1024).toFixed(2)} KB)`);
      // For now, we'll still prefer logoUrl if explicitly given, or use a placeholder.
      // In a real scenario, the uploaded file's URL would replace logoUrlToStore.
      // Example: logoUrlToStore = await uploadToFirebaseStorage(logoFile);
      // For this simulation, if a file is provided, we might just indicate it was processed by slightly changing the placeholder.
      logoUrlToStore = `https://placehold.co/300x150/7DF9FF/121212.png?text=${encodeURIComponent(name.substring(0,3))}&file=uploaded`;
      console.log("Using placeholder URL for 'uploaded' file:", logoUrlToStore);
      console.log("--- END SIMULATION ---");
    }


    const startupData = {
      name,
      logoUrl: logoUrlToStore,
      description,
      badgeText,
      websiteUrl: websiteUrl || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "startups"), startupData);
    
    revalidatePath('/admin/startups');
    revalidatePath('/'); // Revalidate homepage where featured startups are shown

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

// Placeholder for future actions
// export async function updateStartupAction(startupId: string, values: Partial<StartupFormValues>): Promise<any> {}
// export async function deleteStartupAction(startupId: string): Promise<any> {}

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
    try {
      const name = row["Startup Name"] || "Unknown Startup";
      const badgeText = row["Business Category & Industry"] || "General";
      const description = `Startup: ${row["Startup Name"]}. Founded by: ${row["Founder Details"]}. Incubation Stage: ${row["Incubation Stage"]}. Legal Type: ${row["Legal Registration Type"]}. Funding: ${row["Funding Support"]}. Recognition: ${row["Recognition"]}. Category: ${row["Business Category & Industry"]}. Contact: ${row["Contact Information"]}.`;
      
      const logoUrl = `https://placehold.co/300x150/1A1A1A/FFFFFF.png?text=${encodeURIComponent(name.substring(0,3))}`;
      const websiteUrl = ""; // No direct mapping, leave empty

      const startupData = {
        name,
        logoUrl,
        description,
        badgeText,
        websiteUrl,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Validate against the existing schema (optional, but good practice)
      const validatedData = startupFormSchema.safeParse(startupData);
      if (!validatedData.success) {
        console.error("Validation failed for imported startup:", validatedData.error.flatten().fieldErrors);
        throw new Error("Validation failed for imported startup.");
      }

      await addDoc(collection(db, "startups"), validatedData.data);
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
