
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { CampusStatus } from '@/types/Submission';
import { DOMAIN_OPTIONS, SECTOR_OPTIONS } from '@/lib/validation/dropdown-constants';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Submission received:', body);

    const requiredFields = [
      'fullName', 'natureOfInquiry', 'companyName', 'companyEmail', 
      'founderNames', 'founderBio', 'startupIdea', 'uniqueness', 'domain', 'sector'
    ];
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ message: `Missing required field: ${field}` }, { status: 400 });
      }
    }
    
    if (!DOMAIN_OPTIONS.includes(body.domain)) {
      return NextResponse.json({ message: `Invalid domain value.` }, { status: 400 });
    }
    
    if (!SECTOR_OPTIONS.includes(body.sector)) {
      return NextResponse.json({ message: `Invalid sector value.` }, { status: 400 });
    }

    const campusStatus = body.campusStatus === 'off-campus' ? 'off-campus' : 'campus';
    const collectionName = campusStatus === 'off-campus' ? 'offCampusApplications' : 'contactSubmissions';

    const submission = {
      fullName: body.fullName,
      phone: body.phone || '',
      natureOfInquiry: body.natureOfInquiry,
      companyName: body.companyName,
      companyEmail: body.companyEmail,
      founderNames: body.founderNames,
      founderBio: body.founderBio,
      portfolioUrl: body.portfolioUrl || '',
      teamInfo: body.teamInfo || '',
      startupIdea: body.startupIdea,
      problemSolving: body.problemSolving || '',
      uniqueness: body.uniqueness,
      domain: body.domain,
      sector: body.sector,
      name: body.fullName,
      email: body.companyEmail,
      idea: body.startupIdea,
      campusStatus: campusStatus as CampusStatus,
      submittedAt: serverTimestamp(),
      status: 'pending' as const,
    };

    const docRef = await addDoc(collection(db, collectionName), submission);
    console.log(`Document added to ${collectionName} with ID:`, docRef.id);

    return NextResponse.json({ message: 'Application submitted successfully', id: docRef.id }, { status: 201 });

  } catch (error) {
    console.error('Error creating submission:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ message: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}
