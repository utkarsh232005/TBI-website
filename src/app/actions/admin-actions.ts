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

    const spreadsheetId = '1wPgY5n0Ytj0GjnTIWqktGbnG3OEEK20QLRxihxj8DuI';
    
    // First, let's try to get the spreadsheet metadata to understand its structure
    let sheetName = 'Sheet1';
    try {
      const metadata = await sheets.spreadsheets.get({
        spreadsheetId,
      });
      
      console.log("Spreadsheet metadata:", JSON.stringify(metadata.data, null, 2));
      
      // Get the first sheet name
      if (metadata.data.sheets && metadata.data.sheets.length > 0) {
        sheetName = metadata.data.sheets[0].properties?.title || 'Sheet1';
        console.log("Using sheet name:", sheetName);
      }
    } catch (metadataError) {
      console.warn("Could not get spreadsheet metadata, using default sheet name:", metadataError);
    }

    // Try different range formats
    const possibleRanges = [
      `${sheetName}!A:Z`, // Extended range to capture more columns
      `${sheetName}!A1:Z1000`, // Specific range with row limits
      `${sheetName}`, // Just the sheet name
      `A:Z`, // Simple range without sheet name
    ];

    let rows: any[][] | null = null;
    let usedRange = '';

    for (const range of possibleRanges) {
      try {
        console.log(`Trying range: ${range}`);
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range,
        });
        
        if (response.data.values && response.data.values.length > 0) {
          rows = response.data.values;
          usedRange = range;
          console.log(`Successfully fetched data with range: ${range}`);
          console.log(`Found ${rows.length} rows with first row:`, rows[0]);
          break;
        }
      } catch (rangeError: any) {
        console.warn(`Range ${range} failed:`, rangeError.message);
        continue;
      }
    }

    if (!rows || rows.length === 0) {
      return { 
        success: false, 
        message: `No data found in the spreadsheet. Tried ranges: ${possibleRanges.join(', ')}` 
      };
    }

    console.log(`Processing ${rows.length} rows from range: ${usedRange}`);
    console.log("Headers (first row):", rows[0]);
    
    // Skip the header row if it exists
    const dataRows = rows.length > 1 ? rows.slice(1) : rows;
    
    let importedCount = 0;
    const importErrors: any[] = [];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      try {
        // Map columns based on the actual spreadsheet structure
        // Column indices (0-based):
        // 0: Form Response (timestamp)
        // 1: Full Name
        // 2: Phone Number
        // 3: Nature of Inquiry
        // 4: Company name
        // 5: Company Email
        // 6: Founder Name(s)
        // 7: Founder Bio
        // 8: LinkedIn or Portfolio URL
        // 9: Team Information
        // 10: Describe Your Startup Idea
        // 11: Target Audience
        // 12: What Problem Are You Solving?
        // 13: What Makes Your Startup Unique?
        // 14: Current Stage of Development

        const formTimestamp = row[0] || '';
        const fullName = row[1] || 'Unknown Name';
        const phoneNumber = row[2] || '';
        const natureOfInquiry = row[3] || 'General';
        const companyName = row[4] || fullName + "'s Startup";
        const companyEmail = row[5] || '';
        const founderNames = row[6] || fullName;
        const founderBio = row[7] || '';
        const linkedinUrl = row[8] || '';
        const teamInfo = row[9] || '';
        const startupIdeaDescription = row[10] || '';
        const targetAudience = row[11] || '';
        const problemSolving = row[12] || '';
        const uniqueness = row[13] || '';
        const developmentStage = row[14] || '';

        // Use company email first, then extract from phone/contact info if needed
        let email = companyEmail || extractEmailFromText(phoneNumber + ' ' + founderBio);
        
        // If still no email found, create a placeholder but log the issue
        if (!email) {
          const cleanName = fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
          email = `${cleanName.substring(0, 10)}@placeholder.com`;
          console.warn(`No email found for row ${i + 2}, using placeholder: ${email}`);
        }
        
        // Validate that we have minimal required data
        if (!fullName && !companyName) {
          throw new Error('Missing both full name and company name');
        }
        
        // Create comprehensive startup idea from multiple fields
        const ideaParts = [
          startupIdeaDescription,
          problemSolving ? `Problem: ${problemSolving}` : '',
          uniqueness ? `Unique Value: ${uniqueness}` : '',
          targetAudience ? `Target: ${targetAudience}` : '',
          developmentStage ? `Stage: ${developmentStage}` : ''
        ].filter(part => part.trim()).join('\n\n');

        const startupIdea = ideaParts || `${natureOfInquiry} startup by ${founderNames}`;

        const submissionData = {
          name: founderNames,
          fullName: fullName,
          email: email,
          phone: phoneNumber,
          companyName: companyName,
          companyEmail: companyEmail,
          idea: startupIdea,
          startupIdea: startupIdeaDescription,
          problemSolving: problemSolving,
          uniqueness: uniqueness,
          targetAudience: targetAudience,
          domain: natureOfInquiry,
          businessCategory: natureOfInquiry,
          founderBio: founderBio,
          linkedinUrl: linkedinUrl,
          teamInfo: teamInfo,
          developmentStage: developmentStage,
          contactInfo: `Phone: ${phoneNumber}, LinkedIn: ${linkedinUrl}`,
          campusStatus: "off-campus" as const,
          submittedAt: serverTimestamp(),
          status: "pending" as const,
          // Add metadata for tracking
          sourceRow: i + 2, // +2 because we skipped header and arrays are 0-indexed
          importedAt: serverTimestamp(),
          formSubmittedAt: formTimestamp,
        };

        console.log(`Processing row ${i + 2}:`, submissionData);

        await addDoc(collection(db, "contactSubmissions"), submissionData);
        importedCount++;
      } catch (rowError: any) {
        console.error(`Error processing row ${i + 2}:`, row, rowError);
        importErrors.push({ 
          rowNumber: i + 2, 
          row: row, 
          error: rowError.message 
        });
      }
    }

    revalidatePath('/admin/submissions');
    revalidatePath('/admin/dashboard');

    if (importErrors.length > 0) {
      return {
        success: importedCount > 0, // Partial success if some rows were imported
        message: `Import completed with ${importedCount} successful imports and ${importErrors.length} errors. Used range: ${usedRange}`,
        importedCount,
        errors: importErrors,
      };
    } else {
      return { 
        success: true, 
        message: `Successfully imported ${importedCount} off-campus submissions from range: ${usedRange}`, 
        importedCount 
      };
    }

  } catch (error: any) {
    console.error("Error in importOffCampusSubmissionsFromSheet: ", error);
    return { 
      success: false, 
      message: `Failed to import submissions: ${error.message || 'Unknown error'}. Please check console for details.` 
    };
  }
}

// Helper function to extract email from text
function extractEmailFromText(text: string): string {
  if (!text) return '';
  
  // Multiple email regex patterns to catch different formats
  const emailPatterns = [
    /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})/g, // Standard email
    /([a-zA-Z0-9._%+-]+\s*@\s*[a-zA-Z0-9.-]+\s*\.\s*[a-zA-Z]{2,6})/g, // Email with spaces
    /([a-zA-Z0-9._%+-]+\[at\][a-zA-Z0-9.-]+\[dot\][a-zA-Z]{2,6})/g, // [at] and [dot] format
  ];
  
  for (const pattern of emailPatterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      // Clean up the email (remove spaces, replace [at] and [dot])
      return matches[0]
        .replace(/\s+/g, '')
        .replace(/\[at\]/g, '@')
        .replace(/\[dot\]/g, '.');
    }
  }
  
  return '';
}

// Placeholder for future actions
// export async function updateStartupAction(startupId: string, values: Partial<StartupFormValues>): Promise<any> {}
// export async function deleteStartupAction(startupId: string): Promise<any> {}

