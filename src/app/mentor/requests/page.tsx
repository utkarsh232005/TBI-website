// src/app/mentor/requests/page.tsx
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  CheckCircle,
  XCircle,
  MessageSquare,
  Loader2,
  User,
  Mail,
  Calendar,
  Heart,
  HandHeart
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import {
  processMentorDecision,
  processMentorDecisionWithToken,
  getMentorRequestByToken
} from '@/app/actions/mentor-request-actions';
import { doc, getDoc, query, where, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { MentorRequest } from '@/types/mentor-request';
import { format } from 'date-fns';

// Loading component for Suspense fallback
function LoadingPage() {
  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading mentor request...</p>
      </div>
    </div>
  );
}

// Main component that uses useSearchParams
function MentorRequestsContent() {
  const [request, setRequest] = useState<MentorRequest | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [notes, setNotes] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const directAction = searchParams.get('action') as 'approve' | 'reject' | null;

    if (token) {
      fetchRequest(token, directAction);
    } else {
      setError('Invalid or missing token');
      setIsLoading(false);
    }
  }, [searchParams]);

  // Helper function to get detailed user profile information
  const getUserProfileDetails = async (userId: string) => {
    try {
      // Try to get from users collection first
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          name: userData.name || 'N/A',
          email: userData.email || 'N/A',
          phone: userData.phone,
          college: userData.college,
          course: userData.course,
          yearOfStudy: userData.yearOfStudy,
          skills: userData.skills,
          bio: userData.bio,
          linkedinUrl: userData.linkedinUrl,
          portfolioUrl: userData.portfolioUrl,
        };
      }

      // If not found in users collection, try submissions (onboarding data)
      const submissionsQuery = query(
        collection(db, 'submissions'),
        where('uid', '==', userId)
      );
      const submissionsSnapshot = await getDocs(submissionsQuery);

      if (!submissionsSnapshot.empty) {
        const submissionData = submissionsSnapshot.docs[0].data();
        return {
          name: submissionData.personalInfo?.fullName || submissionData.name || 'N/A',
          email: submissionData.personalInfo?.email || submissionData.email || 'N/A',
          phone: submissionData.personalInfo?.phoneNumber,
          college: submissionData.personalInfo?.collegeName,
          course: submissionData.personalInfo?.course,
          yearOfStudy: submissionData.personalInfo?.yearOfStudy,
          skills: submissionData.technicalInfo?.technicalSkills,
          bio: submissionData.personalInfo?.aboutYourself,
          linkedinUrl: submissionData.personalInfo?.linkedinProfile,
          portfolioUrl: submissionData.personalInfo?.portfolioWebsite,
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching user profile details:', error);
      return null;
    }
  };

  const fetchRequest = async (tokenId: string, directAction?: 'approve' | 'reject' | null) => {
    try {
      const result = await getMentorRequestByToken(tokenId);

      if (!result.success || !result.request) {
        setError(result.error || 'Request not found');
        return;
      }

      setRequest(result.request);
      setUserDetails(result.userDetails);

      // If there's a direct action from email link, open the appropriate dialog
      if (directAction) {
        setTimeout(() => {
          handleAction(directAction);
        }, 500);
      }
    } catch (error) {
      console.error('Error fetching request:', error);
      setError('Failed to load request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (action: 'approve' | 'reject') => {
    setActionType(action);
    setNotes('');
    setIsDialogOpen(true);
  };

  const confirmAction = () => {
    setIsDialogOpen(false);
    setIsConfirmDialogOpen(true);
  };

  const processDecision = async () => {
    if (!request || !actionType) return;

    const token = searchParams.get('token');
    if (!token) {
      toast({
        title: "Error",
        description: "Invalid token",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setIsConfirmDialogOpen(false);

    try {
      const result = await processMentorDecisionWithToken(
        token,
        actionType,
        notes
      );

      if (result.success) {
        toast({
          title: "Decision Recorded",
          description: result.message,
        });

        // Update the request status locally
        setRequest(prev => prev ? {
          ...prev,
          status: actionType === 'approve' ? 'mentor_approved' : 'mentor_rejected',
          mentorNotes: notes,
        } : null);
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process decision",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setActionType(null);
      setNotes('');
    }
  };

  const closeDialogs = () => {
    setIsDialogOpen(false);
    setIsConfirmDialogOpen(false);
    setActionType(null);
    setNotes('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading mentorship request...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Unable to Load Request</h2>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Request Found</h2>
            <p className="text-muted-foreground">The mentorship request could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isProcessed = request.status === 'mentor_approved' || request.status === 'mentor_rejected';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <HandHeart className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Mentorship Request</h1>
          <p className="text-muted-foreground">
            A student would like you to be their mentor
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Student Information</span>
              <Badge
                variant={request.status === 'mentor_approved' ? 'default' :
                  request.status === 'mentor_rejected' ? 'destructive' : 'secondary'}
              >
                {request.status === 'admin_approved' ? 'Awaiting Your Response' :
                  request.status === 'mentor_approved' ? 'Approved' :
                    request.status === 'mentor_rejected' ? 'Declined' : 'Processed'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-6">
              <Avatar className="h-16 w-16">
                <AvatarFallback>
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{request.userName}</h3>
                <p className="text-muted-foreground flex items-center mt-1">
                  <Mail className="mr-2 h-4 w-4" />
                  {request.userEmail}
                </p>
                <p className="text-sm text-muted-foreground flex items-center mt-1">
                  <Calendar className="mr-2 h-4 w-4" />
                  Requested on {format(request.createdAt, 'PPP')}
                </p>
              </div>
            </div>

            {/* Detailed User Information */}
            {userDetails && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
                <h4 className="col-span-full font-semibold text-lg mb-2">Student Details</h4>

                {userDetails.phone && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-muted-foreground min-w-[80px]">Phone:</span>
                    <span className="text-sm">{userDetails.phone}</span>
                  </div>
                )}

                {userDetails.college && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-muted-foreground min-w-[80px]">College:</span>
                    <span className="text-sm">{userDetails.college}</span>
                  </div>
                )}

                {userDetails.course && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-muted-foreground min-w-[80px]">Course:</span>
                    <span className="text-sm">{userDetails.course}</span>
                  </div>
                )}

                {userDetails.yearOfStudy && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-muted-foreground min-w-[80px]">Year:</span>
                    <span className="text-sm">{userDetails.yearOfStudy}</span>
                  </div>
                )}

                {userDetails.linkedinUrl && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-muted-foreground min-w-[80px]">LinkedIn:</span>
                    <a
                      href={userDetails.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline truncate"
                    >
                      View Profile
                    </a>
                  </div>
                )}

                {userDetails.portfolioUrl && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-muted-foreground min-w-[80px]">Portfolio:</span>
                    <a
                      href={userDetails.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline truncate"
                    >
                      View Portfolio
                    </a>
                  </div>
                )}

                {userDetails.skills && userDetails.skills.length > 0 && (
                  <div className="col-span-full">
                    <span className="text-sm font-medium text-muted-foreground block mb-2">Skills:</span>
                    <div className="flex flex-wrap gap-1">
                      {userDetails.skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {userDetails.bio && (
                  <div className="col-span-full">
                    <span className="text-sm font-medium text-muted-foreground block mb-2">About:</span>
                    <p className="text-sm text-muted-foreground leading-relaxed bg-background p-3 rounded border">
                      {userDetails.bio}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center">
                <MessageSquare className="mr-2 h-4 w-4" />
                Why they want you as their mentor:
              </h4>
              <p className="text-sm leading-relaxed">{request.requestMessage}</p>
            </div>

            {request.adminNotes && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium mb-2 text-blue-800">Admin Notes:</h4>
                <p className="text-sm text-blue-700">{request.adminNotes}</p>
              </div>
            )}

            {request.mentorNotes && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-medium mb-2">Your Response:</h4>
                <p className="text-sm">{request.mentorNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {!isProcessed ? (
          <Card>
            <CardHeader>
              <CardTitle>Your Decision</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Would you like to mentor {request.userName}? Your decision will be final and
                the student will be notified of your response.
              </p>

              <div className="flex space-x-4">
                <Button
                  onClick={() => handleAction('approve')}
                  disabled={isProcessing}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Accept Mentorship
                </Button>
                <Button
                  onClick={() => handleAction('reject')}
                  disabled={isProcessing}
                  variant="destructive"
                  className="flex-1"
                  size="lg"
                >
                  <XCircle className="mr-2 h-5 w-5" />
                  Decline Request
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              {request.status === 'mentor_approved' ? (
                <div className="text-green-600">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Mentorship Accepted!</h3>
                  <p className="text-muted-foreground">
                    You've accepted {request.userName} as your mentee. They have been notified
                    and can now contact you directly.
                  </p>
                </div>
              ) : (
                <div className="text-gray-600">
                  <XCircle className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Request Declined</h3>
                  <p className="text-muted-foreground">
                    You've declined this mentorship request. The student has been notified.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Action Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={closeDialogs}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionType === 'approve' ? 'Accept Mentorship' : 'Decline Request'}
              </DialogTitle>
              <DialogDescription>
                {actionType === 'approve'
                  ? 'By accepting, you agree to mentor this student. They will be given your contact information.'
                  : 'The student will be notified that you are unable to take them on as a mentee at this time.'
                }
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p><strong>Student:</strong> {request.userName}</p>
                <p className="mt-2 text-sm">{request.requestMessage}</p>
              </div>

              <div>
                <label className="text-sm font-medium">
                  {actionType === 'approve' ? 'Welcome message (optional)' : 'Reason for declining (optional)'}
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    actionType === 'approve'
                      ? 'Welcome! I look forward to working with you...'
                      : 'I appreciate your interest, but I am currently unable to take on new mentees...'
                  }
                  className="mt-2"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={closeDialogs}>
                Cancel
              </Button>
              <Button
                onClick={confirmAction}
                variant={actionType === 'approve' ? 'default' : 'destructive'}
              >
                {actionType === 'approve' ? 'Accept Mentorship' : 'Decline Request'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirmation Dialog */}
        <AlertDialog open={isConfirmDialogOpen} onOpenChange={closeDialogs}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Your Decision</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to {actionType} this mentorship request?
                This action cannot be undone and the student will be notified immediately.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={processDecision}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function MentorRequestsPage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <MentorRequestsContent />
    </Suspense>
  );
}
