// src/app/actions/settings-actions.ts
'use server';

import { 
  performFlowUpdateAdminCredentials,
  type UpdateAdminCredentialsInput,
  type UpdateAdminCredentialsOutput,
} from '@/ai/flows/admin-settings-flow';

export async function performUpdateAdminCredentials(
  newEmail: string,
  newPassword: string
): Promise<UpdateAdminCredentialsOutput> {
  try {
    const input: UpdateAdminCredentialsInput = { newEmail, newPassword };
    const result = await performFlowUpdateAdminCredentials(input);
    
    console.log("[SettingsActions] Result from updateAdminCredentialsFlow:", JSON.stringify(result, null, 2));
    return result;

  } catch (error: any) {
    console.error("[SettingsActions] Error in performUpdateAdminCredentials: ", error);
    return {
      success: false,
      message: `Server action failed: ${error.message || 'Unknown error'}`,
    };
  }
}
