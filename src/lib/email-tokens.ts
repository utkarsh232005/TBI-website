// src/lib/email-tokens.ts
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import crypto from 'crypto';

export interface EmailToken {
  id: string;
  requestId: string;
  mentorEmail: string;
  action?: 'approve' | 'reject'; // Made optional since review tokens don't have an action
  createdAt: Date;
  expiresAt: Date;
  used: boolean;
}

// Generate a secure random token
function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Create an email token for mentor actions
export async function createEmailToken(
  requestId: string,
  mentorEmail: string,
  action?: 'approve' | 'reject'
): Promise<string> {
  const tokenId = generateSecureToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days expiry

  const tokenData: any = {
    id: tokenId,
    requestId,
    mentorEmail,
    createdAt: now,
    expiresAt,
    used: false,
  };

  // Only add action field if it's defined (Firestore doesn't allow undefined values)
  if (action) {
    tokenData.action = action;
  }

  await setDoc(doc(db, 'emailTokens', tokenId), tokenData);
  return tokenId;
}

// Verify and consume an email token
export async function verifyEmailToken(
  tokenId: string
): Promise<{ valid: boolean; token?: EmailToken; error?: string }> {
  try {
    const tokenDoc = await getDoc(doc(db, 'emailTokens', tokenId));
    
    if (!tokenDoc.exists()) {
      return { valid: false, error: 'Invalid token' };
    }

    const tokenData = {
      ...tokenDoc.data(),
      createdAt: tokenDoc.data()?.createdAt?.toDate() || new Date(),
      expiresAt: tokenDoc.data()?.expiresAt?.toDate() || new Date(),
    } as EmailToken;
    const now = new Date();

    // Check if token is expired
    if (now > tokenData.expiresAt) {
      await deleteDoc(doc(db, 'emailTokens', tokenId));
      return { valid: false, error: 'Token has expired' };
    }

    // Check if token is already used
    if (tokenData.used) {
      return { valid: false, error: 'Token has already been used' };
    }

    return { valid: true, token: tokenData };
  } catch (error) {
    console.error('Error verifying email token:', error);
    return { valid: false, error: 'Failed to verify token' };
  }
}

// Mark token as used
export async function markTokenAsUsed(tokenId: string): Promise<void> {
  await setDoc(
    doc(db, 'emailTokens', tokenId),
    { used: true },
    { merge: true }
  );
}

// Clean up expired tokens (call this periodically)
export async function cleanupExpiredTokens(): Promise<void> {
  // This would typically be implemented as a Cloud Function
  // For now, tokens are cleaned up when accessed
  console.log('Token cleanup should be implemented as a Cloud Function');
}
