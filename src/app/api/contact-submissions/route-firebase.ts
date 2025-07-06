
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { CampusStatus } from '@/types/Submission';
import { DOMAIN_OPTIONS, SECTOR_OPTIONS } from '@/lib/validation/dropdown-constants';

export async function POST(request: NextRequest) {
  try {
    console.log('POST request received at /api/contact-submissions');
    
    const body = await request.json();
    console.log('Request body received:', Object.keys(body));
    
    // Validate required fields
    const requiredFields = [
      'fullName', 'natureOfInquiry', 'companyName', 'companyEmail', 
      'founderNames', 'founderBio', 'startupIdea', 'uniqueness', 'domain', 'sector'
    ];
    
    console.log('Starting field validation...');
    for (const field of requiredFields) {
      if (!body[field]) {
        console.log(`Missing required field: ${field}`);
        return NextResponse.json(
          { message: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    console.log('Field validation passed');
    
    // Validate dropdown values
    if (!DOMAIN_OPTIONS.includes(body.domain)) {
      console.log(`Invalid domain: ${body.domain}`);
      return NextResponse.json(
        { message: `Invalid domain value. Must be one of: ${DOMAIN_OPTIONS.join(', ')}` },
        { status: 400 }
      );
    }
    
    if (!SECTOR_OPTIONS.includes(body.sector)) {
      console.log(`Invalid sector: ${body.sector}`);
      return NextResponse.json(
        { message: `Invalid sector value. Must be one of: ${SECTOR_OPTIONS.join(', ')}` },
        { status: 400 }
      );
    }
    
    console.log('Dropdown validation passed');
    console.log('Saving to Firebase Firestore...');

    const submission = {
      // New comprehensive fields
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
      
      // New dropdown fields
      domain: body.domain,
      sector: body.sector,
      
      // Add dummy data for removed fields
      targetAudience: body.targetAudience || 'Not provided',
      currentStage: body.currentStage || 'Ideation',
      legalStatus: body.legalStatus || 'Not registered',
      attachmentBase64: body.attachmentBase64 || '',
      attachmentName: body.attachmentName || '',
      
      // Legacy field mappings for backward compatibility
      name: body.fullName, // Map fullName to name for admin display
      email: body.companyEmail, // Map companyEmail to email for admin display
      idea: body.startupIdea, // Map startupIdea to idea for admin display
      campusStatus: 'campus' as CampusStatus,
      
      submittedAt: serverTimestamp(),
      status: 'pending'
    };

    console.log('Adding document to Firestore...');
    const docRef = await addDoc(collection(db, 'ContactSubmission'), submission);
    console.log('Document added successfully with ID:', docRef.id);

    return NextResponse.json(
      { 
        message: 'Application submitted successfully',
        id: docRef.id 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating submission:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Provide more specific error messages
    let errorMessage = 'Internal server error';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('Firebase')) {
        errorMessage = 'Database connection failed. Please check your Firebase configuration.';
      } else if (error.message.includes('permission')) {
        errorMessage = 'Database permission denied. Please check Firestore rules.';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection.';
      }
    }
    
    return NextResponse.json(
      { 
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
      },
      { status: statusCode }
    );
  }
}
