// src/app/user/mentor-requests/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  Loader2,
  RefreshCw,
  User,
  Mail,
  Calendar,
  Users,
  ArrowRight
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getUserMentorRequests } from '@/app/actions/mentor-request-actions';
import type { MentorRequest } from '@/types/mentor-request';
import { format } from 'date-fns';
import Link from 'next/link';
import { useUser } from '@/contexts/user-context';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  admin_approved: 'bg-blue-100 text-blue-800',
  admin_rejected: 'bg-red-100 text-red-800',
  mentor_approved: 'bg-green-100 text-green-800',
  mentor_rejected: 'bg-gray-100 text-gray-800',
};

const statusLabels = {
  pending: 'Under Admin Review',
  admin_approved: 'Sent to Mentor',
  admin_rejected: 'Not Approved',
  mentor_approved: 'Approved!',
  mentor_rejected: 'Mentor Declined',
};

const statusDescriptions = {
  pending: 'Your request is being reviewed by our admin team',
  admin_approved: 'Admin approved your request and forwarded it to the mentor',
  admin_rejected: 'Your request was not approved by the admin team',
  mentor_approved: 'Congratulations! Your mentor has accepted your request',
  mentor_rejected: 'Your mentor was unable to take on new mentees at this time',
};

export default function UserMentorRequestsPage() {
  const [requests, setRequests] = useState<MentorRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useUser();

  const fetchRequests = async () => {
    if (!user?.uid) {
      setIsLoading(false);
      return;
    }
    
    try {
      const fetchedRequests = await getUserMentorRequests(user.uid);
      setRequests(fetchedRequests);
    } catch (error) {
      console.error('Error fetching mentor requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your mentor requests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const getStatusIcon = (status: MentorRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'admin_approved':
        return <ArrowRight className="h-5 w-5 text-blue-600" />;
      case 'admin_rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'mentor_approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'mentor_rejected':
        return <XCircle className="h-5 w-5 text-gray-600" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Mentor Requests</h1>
          <p className="text-muted-foreground mt-2">
            Track the status of your mentor selection requests
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={fetchRequests} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/mentors">
              <Users className="mr-2 h-4 w-4" />
              Browse Mentors
            </Link>
          </Button>
        </div>
      </div>

      {requests.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No mentor requests yet</h3>
            <p className="text-muted-foreground mb-6">
              Start by browsing our mentors and selecting one that matches your goals.
            </p>
            <Button asChild>
              <Link href="/mentors">
                Browse Available Mentors
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {requests.map((request) => (
            <Card key={request.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {getStatusIcon(request.status)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{request.mentorName}</CardTitle>
                      <p className="text-sm text-muted-foreground flex items-center mt-1">
                        <Mail className="mr-1 h-3 w-3" />
                        {request.mentorEmail}
                      </p>
                    </div>
                  </div>
                  <Badge className={statusColors[request.status]}>
                    {statusLabels[request.status]}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="grid md:grid-cols-3 gap-4">
                  {/* Request Details */}
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Your Request Message:</h4>
                      <div className="bg-muted/50 p-3 rounded-lg text-sm">
                        {request.requestMessage}
                      </div>
                    </div>

                    {request.adminNotes && (
                      <div>
                        <h4 className="font-medium mb-2">Admin Notes:</h4>
                        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm text-blue-800">
                          {request.adminNotes}
                        </div>
                      </div>
                    )}

                    {request.mentorNotes && (
                      <div>
                        <h4 className="font-medium mb-2">Mentor's Response:</h4>
                        <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-sm text-green-800">
                          {request.mentorNotes}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status & Timeline */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Status</h4>
                      <div className="text-sm text-muted-foreground">
                        {statusDescriptions[request.status]}
                      </div>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        <span className="text-muted-foreground">
                          Requested: {format(
                            request.createdAt instanceof Date 
                              ? request.createdAt 
                              : (request.createdAt as any).toDate(), 
                            'MMM d, yyyy'
                          )}
                        </span>
                      </div>
                      
                      {request.adminProcessedAt && (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-3 w-3 flex-shrink-0 text-blue-500" />
                          <span className="text-muted-foreground">
                            Admin reviewed: {format(request.adminProcessedAt, 'MMM d, yyyy')}
                          </span>
                        </div>
                      )}
                      
                      {request.mentorProcessedAt && (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-3 w-3 flex-shrink-0 text-green-500" />
                          <span className="text-muted-foreground">
                            Mentor responded: {format(request.mentorProcessedAt, 'MMM d, yyyy')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action buttons for completed requests */}
                    {request.status === 'mentor_approved' && (
                      <div className="pt-2">
                        <Button size="sm" className="w-full" asChild>
                          <Link href={`mailto:${request.mentorEmail}`}>
                            <Mail className="mr-2 h-3 w-3" />
                            Contact Mentor
                          </Link>
                        </Button>
                      </div>
                    )}

                    {(request.status === 'admin_rejected' || request.status === 'mentor_rejected') && (
                      <div className="pt-2">
                        <Button size="sm" variant="outline" className="w-full" asChild>
                          <Link href="/mentors">
                            Find Another Mentor
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
