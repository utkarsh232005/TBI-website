
// src/app/mentor/requests/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  Loader2,
  RefreshCw,
  User,
  Mail,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { MentorRequest } from '@/types/mentor-request';
import { format } from 'date-fns';
import { useUser } from '@/contexts/user-context';
import Link from 'next/link';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  admin_approved: 'bg-blue-100 text-blue-800',
  admin_rejected: 'bg-red-100 text-red-800',
  mentor_approved: 'bg-green-100 text-green-800',
  mentor_rejected: 'bg-gray-100 text-gray-800',
};

const statusLabels = {
  pending: 'Under Review',
  admin_approved: 'Awaiting Your Response',
  admin_rejected: 'Not Approved by Admin',
  mentor_approved: 'Approved',
  mentor_rejected: 'Declined by You',
};

export default function MentorRequestsPage() {
  const [requests, setRequests] = useState<MentorRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useUser();

  const fetchMentorRequests = async () => {
    if (!user || !user.email) {
      toast({ title: "Authentication Error", description: "Please log in to view requests.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const q = query(
        collection(db, 'mentorRequests'),
        where('mentorEmail', '==', user.email),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const mentorRequests: MentorRequest[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          adminProcessedAt: data.adminProcessedAt?.toDate(),
          mentorProcessedAt: data.mentorProcessedAt?.toDate(),
        } as MentorRequest;
      });
      
      setRequests(mentorRequests);
    } catch (error) {
      console.error('Error fetching mentor requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your mentorship requests.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMentorRequests();
  }, [user]);

  const getStatusIcon = (status: MentorRequest['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'admin_approved': return <ArrowRight className="h-4 w-4 text-blue-600" />;
      case 'admin_rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'mentor_approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'mentor_rejected': return <XCircle className="h-4 w-4 text-gray-600" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
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
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Mentorship Requests</h1>
          <p className="text-muted-foreground mt-2">
            Review and respond to requests from aspiring mentees.
          </p>
        </div>
        <Button onClick={fetchMentorRequests} variant="outline" size="sm" disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Mentorship Requests</h3>
            <p className="text-muted-foreground">
              You haven't received any mentorship requests yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {requests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {request.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{request.userName}</h3>
                      <p className="text-muted-foreground flex items-center mt-1">
                        <Mail className="mr-1 h-3 w-3" />
                        {request.userEmail}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center mt-1">
                        <Calendar className="mr-1 h-3 w-3" />
                        {format(request.createdAt, 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      className={`${statusColors[request.status]} mb-2`}
                      variant="secondary"
                    >
                      <span className="mr-1">{getStatusIcon(request.status)}</span>
                      {statusLabels[request.status]}
                    </Badge>
                    {request.status === 'admin_approved' && (
                      <div>
                        <Button asChild size="sm">
                          <Link href={`/mentor/requests/${request.id}`}>Respond Now</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Request:</strong> {request.requestMessage || 'No message provided'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
