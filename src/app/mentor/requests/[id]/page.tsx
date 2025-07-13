// src/app/mentor/requests/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/contexts/user-context';
import { useToast } from "@/hooks/use-toast";
import { getMentorRequestForMentor, processMentorDecision } from '@/app/actions/mentor-request-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, ArrowLeft, Check, X, User, Mail, Calendar, Linkedin, Briefcase, MessageSquare, Send } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import type { MentorRequest } from '@/types/mentor-request';

type UserDetails = {
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  linkedinUrl?: string;
};

export default function MentorRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();

  const [request, setRequest] = useState<MentorRequest | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const requestId = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    const fetchRequest = async () => {
      if (!requestId || !user?.email) {
        setIsLoading(false);
        setError("Invalid request or user not authenticated.");
        return;
      }
      try {
        const result = await getMentorRequestForMentor(requestId, user.email);
        if (result.success && result.request) {
          setRequest(result.request);
          setUserDetails(result.userDetails);
        } else {
          setError(result.error || "Failed to fetch request details.");
        }
      } catch (e) {
        setError("An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    if(user) {
        fetchRequest();
    }
  }, [requestId, user]);

  const handleDecision = async (action: 'approve' | 'reject') => {
    if (!request || !user?.email) return;

    setIsProcessing(true);
    try {
      const result = await processMentorDecision({
        requestId: request.id,
        action,
        notes,
      }, user.email);

      if (result.success) {
        toast({ title: "Success", description: result.message });
        router.push('/mentor/requests');
      } else {
        toast({ title: "Error", description: result.message, variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to process decision.", variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!request) {
    return <div className="text-center text-gray-500">Request not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Requests
      </Button>
      
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-2xl">{userDetails?.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">{userDetails?.name}</CardTitle>
              <CardDescription className="flex items-center gap-4 mt-1">
                <span className="flex items-center"><Mail className="mr-1.5 h-4 w-4" />{userDetails?.email}</span>
                {userDetails?.phone && <span className="flex items-center"><User className="mr-1.5 h-4 w-4" />{userDetails.phone}</span>}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {userDetails?.linkedinUrl && (
            <div className="flex items-center gap-2">
              <Linkedin className="h-4 w-4 text-blue-700" />
              <a href={userDetails.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline text-sm font-medium">
                View LinkedIn Profile
              </a>
            </div>
          )}
          {userDetails?.bio && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-1">About the Applicant</h3>
              <p className="text-gray-700">{userDetails.bio}</p>
            </div>
          )}
          <div>
             <h3 className="text-sm font-semibold text-gray-500 mb-1 flex items-center"><MessageSquare className="mr-1.5 h-4 w-4"/>Request Message</h3>
             <blockquote className="border-l-4 border-gray-200 pl-4 py-2 bg-gray-50 rounded-r-md">
                <p className="text-gray-800 italic">{request.requestMessage}</p>
             </blockquote>
          </div>
        </CardContent>
      </Card>
      
      {request.status === 'admin_approved' && (
        <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
                <CardTitle>Your Response</CardTitle>
                <CardDescription>Approve or decline this mentorship request. You can add optional notes.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <Label htmlFor="mentor-notes">Notes for the applicant (optional)</Label>
                    <Textarea 
                        id="mentor-notes"
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="e.g., I'd be happy to connect, let's set up a call next week."
                        className="min-h-[100px]"
                    />
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button variant="destructive" onClick={() => handleDecision('reject')} disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin"/> : <X className="mr-2 h-4 w-4"/>}
                    Decline
                </Button>
                <Button onClick={() => handleDecision('approve')} disabled={isProcessing} className="bg-green-600 hover:bg-green-700">
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin"/> : <Check className="mr-2 h-4 w-4"/>}
                    Approve
                </Button>
            </CardFooter>
        </Card>
      )}

      {request.status !== 'admin_approved' && (
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6 text-center text-gray-500">
            This request has already been processed on {format(request.updatedAt, 'MMM dd, yyyy')}.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
