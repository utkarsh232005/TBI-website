
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
import type { Submission } from '@/types/Submission';

export async function processApplicationAction(
  submissionId: string, 
  action: 'accept' | 'reject',
  applicantName: string,
  applicantEmail: string,
  campusStatus: Submission['campusStatus']
): Promise<ProcessApplicationOutput> {
  try {
    const input: ProcessApplicationInput = { submissionId, action, applicantName, applicantEmail, campusStatus };
    const result = await processApplication(input);
    
    console.log("[AdminActions] Result from processApplication flow:", JSON.stringify(result, null, 2));

    if (result.status === 'success') {
      revalidatePath('/admin/dashboard');
      revalidatePath('/admin/submissions');
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

    const spreadsheetId = '1wPgY5n0Ytj0GjnTIWqktGbnG3OEEK20QLRxihxj8DuI';
    const range = 'Sheet1!A:Z'; // Assuming data is on Sheet1

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return { success: false, message: 'No data found in the spreadsheet.' };
    }

    const dataRows = rows.slice(1); // Skip header row
    let importedCount = 0;
    const importErrors: any[] = [];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      try {
        const submissionData = {
          fullName: row[1] || 'Unknown Name',
          phone: row[2] || '',
          natureOfInquiry: row[3] || 'General',
          companyName: row[4] || (row[1] ? `${row[1]}'s Startup` : 'Startup'),
          companyEmail: row[5] || '',
          founderNames: row[6] || row[1] || 'Unknown Founder',
          founderBio: row[7] || '',
          linkedinUrl: row[8] || '',
          teamInfo: row[9] || '',
          startupIdea: row[10] || '',
          targetAudience: row[11] || '',
          problemSolving: row[12] || '',
          uniqueness: row[13] || '',
          developmentStage: row[14] || '',
          campusStatus: "off-campus" as const,
          email: row[5] || extractEmailFromText(row[2] || ''),
          name: row[1] || 'Unknown Name',
          idea: row[10] || '',
          submittedAt: serverTimestamp(),
          status: "pending" as const,
          sourceRow: i + 2,
          importedAt: serverTimestamp(),
          formSubmittedAt: row[0] || '',
        };
        
        if (!submissionData.email) {
          throw new Error('Could not determine email for row.');
        }
        
        await addDoc(collection(db, "offCampusApplications"), submissionData);
        importedCount++;
      } catch (rowError: any) {
        console.error(`Error processing row ${i + 2}:`, row, rowError);
        importErrors.push({ rowNumber: i + 2, row, error: rowError.message });
      }
    }

    revalidatePath('/admin/submissions');
    revalidatePath('/admin/dashboard');

    if (importErrors.length > 0) {
      return {
        success: importedCount > 0,
        message: `Import completed with ${importedCount} successes and ${importErrors.length} errors.`,
        importedCount,
        errors: importErrors,
      };
    } else {
      return { success: true, message: `Successfully imported ${importedCount} off-campus submissions.`, importedCount };
    }

  } catch (error: any) {
    console.error("Error in importOffCampusSubmissionsFromSheet: ", error);
    return { success: false, message: `Failed to import submissions: ${error.message || 'Unknown error'}.` };
  }
}

function extractEmailFromText(text: string): string {
  if (!text) return '';
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  const matches = text.match(emailRegex);
  return matches ? matches[0] : '';
}
