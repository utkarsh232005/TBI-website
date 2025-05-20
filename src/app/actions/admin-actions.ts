
'use server';

import { 
  processApplication,
  type ProcessApplicationInput,
  type ProcessApplicationOutput
} from '@/ai/flows/process-application-flow';
import { revalidatePath } from 'next/cache';

export async function processApplicationAction(
  submissionId: string, 
  action: 'accept' | 'reject',
  applicantName: string,
  applicantEmail: string
): Promise<ProcessApplicationOutput> {
  try {
    const input: ProcessApplicationInput = { submissionId, action, applicantName, applicantEmail };
    const result = await processApplication(input);
    
    if (result.status === 'success') {
      revalidatePath('/admin/dashboard'); // Revalidate to show updated status
    }
    return result;
  } catch (error: any) {
    console.error("Error in processApplicationAction: ", error);
    return {
      status: 'error',
      message: `Server action failed: ${error.message || 'Unknown error'}`,
    };
  }
}
