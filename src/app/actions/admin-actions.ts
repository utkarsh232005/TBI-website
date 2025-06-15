'use server';

import { 
  processApplication,
  type ProcessApplicationInput,
  type ProcessApplicationOutput
} from '@/ai/flows/process-application-flow';
import { revalidatePath } from 'next/cache';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function processApplicationAction(
  submissionId: string, 
  action: 'accept' | 'reject',
  applicantName: string,
  applicantEmail: string
): Promise<ProcessApplicationOutput> {
  try {
    const input: ProcessApplicationInput = { submissionId, action, applicantName, applicantEmail };
    const result = await processApplication(input);
    
    // Log the full result from the flow to the server console
    console.log("[AdminActions] Result from processApplication flow:", JSON.stringify(result, null, 2));

    if (result.status === 'success') {
      revalidatePath('/admin/dashboard'); // Revalidate to show updated status
    }
    return result;
  } catch (error: any) {
    console.error("[AdminActions] Error in processApplicationAction: ", error);
    return {
      status: 'error',
      message: `Server action failed: ${error.message || 'Unknown error'}`,
    };
  }
}

interface ImportSubmissionsResponse {
  success: boolean;
  message?: string;
  importedCount?: number;
  errors?: any[];
}

export async function importOffCampusSubmissionsFromSheet(): Promise<ImportSubmissionsResponse> {
  console.log("Attempting to import off-campus submissions from Google Sheet...");
  try {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY_JSON) {
      throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY_JSON environment variable is not set.");
    }

    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_JSON);

    const jwtClient = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    await jwtClient.authorize();

    const sheets = google.sheets({
      version: 'v4',
      auth: jwtClient,
    });

    const spreadsheetId = '1wPgY5n0Ytj0GjnTIWqktGbnG3OEEK20QLRxihxj8DuI'; // Your spreadsheet ID
    const range = 'Sheet1!A:H'; // Assuming data is in Sheet1, columns A to H

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return { success: true, message: "No data found in the spreadsheet.", importedCount: 0 };
    }

    // Assuming the first row is headers, skip it
    const dataRows = rows.slice(1);

    let importedCount = 0;
    const importErrors: any[] = [];

    for (const row of dataRows) {
      try {
        const startupName = row[0] || 'Unknown Startup';
        const contactInfo = row[7] || '';
        const businessCategory = row[6] || 'General';

        // Attempt to extract email from contactInfo, simple regex for demonstration
        const emailMatch = contactInfo.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})/);
        const email = emailMatch ? emailMatch[0] : 'unknown@example.com';

        const submissionData = {
          name: startupName, // Using startup name as applicant name for now
          email: email,
          companyName: startupName,
          idea: `Exploring ${businessCategory} ideas related to ${startupName}.`,
          campusStatus: "off-campus",
          submittedAt: serverTimestamp(),
          status: "pending",
        };

        await addDoc(collection(db, "contactSubmissions"), submissionData);
        importedCount++;
      } catch (rowError) {
        console.error("Error processing row:", row, rowError);
        importErrors.push({ row, error: rowError.message });
      }
    }

    revalidatePath('/admin/submissions');
    revalidatePath('/admin/dashboard'); // Revalidate dashboard as well, as it shows all submissions

    if (importErrors.length > 0) {
      return {
        success: false,
        message: `Import completed with ${importedCount} successful imports and ${importErrors.length} errors.`,
        importedCount,
        errors: importErrors,
      };
    } else {
      return { success: true, message: `Successfully imported ${importedCount} off-campus submissions.`, importedCount };
    }

  } catch (error: any) {
    console.error("Error in importOffCampusSubmissionsFromSheet: ", error);
    let errorMessage = "Failed to import submissions.";
    if (error.message) {
      errorMessage = error.message;
    }
    return { success: false, message: errorMessage };
  }
}

// Placeholder for future actions
// export async function updateStartupAction(startupId: string, values: Partial<StartupFormValues>): Promise<any> {}
// export async function deleteStartupAction(startupId: string): Promise<any> {}

