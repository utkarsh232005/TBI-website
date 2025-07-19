// API route for deleting Firebase Auth users (Admin only)
// This requires Firebase Admin SDK and proper authentication

import { NextRequest, NextResponse } from 'next/server';
import { deleteFirebaseAuthUser } from '@/lib/firebase-admin';

export async function DELETE(request: NextRequest) {
  try {
    // Get the UID from the request
    const { uid } = await request.json();
    
    if (!uid) {
      return NextResponse.json(
        { success: false, message: 'UID is required' },
        { status: 400 }
      );
    }

    // TODO: Add admin authentication check here
    // You should verify that the requesting user is an admin
    
    const result = await deleteFirebaseAuthUser(uid);
    
    return NextResponse.json(result, {
      status: result.success ? 200 : 500
    });
    
  } catch (error: any) {
    console.error('Error in delete auth user API:', error);
    return NextResponse.json(
      { success: false, message: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
}

// Optional: GET method to check if user exists
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Use DELETE method to delete Firebase Auth users',
    note: 'This endpoint requires Firebase Admin SDK setup and admin authentication'
  });
}
