import { collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Verify cleanup authorization
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CLEANUP_API_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const expiredTokensQuery = query(
      collection(db, 'emailTokens'),
      where('expiresAt', '<', now)
    );
    
    const snapshot = await getDocs(expiredTokensQuery);
    
    if (snapshot.empty) {
      return NextResponse.json({ 
        message: 'No expired tokens to clean up',
        count: 0 
      });
    }

    // Delete expired tokens
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    console.log(`Cleaned up ${snapshot.docs.length} expired email tokens`);
    
    return NextResponse.json({ 
      message: `Successfully cleaned up ${snapshot.docs.length} expired tokens`,
      count: snapshot.docs.length
    });
  } catch (error) {
    console.error('Token cleanup error:', error);
    return NextResponse.json({ 
      error: 'Cleanup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
