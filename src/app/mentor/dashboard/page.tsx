// src/app/mentor/dashboard/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Clock,
  Mail,
  Calendar,
  ArrowRight,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { MentorRequest } from '@/types/mentor-request';
import { format } from 'date-fns';
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
  admin_rejected: 'Not Approved',
  mentor_approved: 'Approved',
  mentor_rejected: 'Declined',
};

interface MentorDashboardPageProps {
  mentorEmail?: string;
}

export default function MentorDashboardPage({ mentorEmail = "mentor@example.com" }: MentorDashboardPageProps) {
  const [requests, setRequests] = useState<MentorRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchMentorRequests = async () => {
    try {
      setIsLoading(true);
      const q = query(
        collection(db, 'mentorRequests'),
        where('mentorEmail', '==', mentorEmail),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const mentorRequests: MentorRequest[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        mentorRequests.push({
          id: doc.id,
          ...data,
          // Convert Firestore Timestamps to Date objects for Next.js compatibility
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          adminProcessedAt: data.adminProcessedAt?.toDate() || undefined,
          mentorProcessedAt: data.mentorProcessedAt?.toDate() || undefined,
        } as MentorRequest);
      });
      
      setRequests(mentorRequests);
    } catch (error) {
      console.error('Error fetching mentor requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your mentorship requests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMentorRequests();
  }, [mentorEmail]);

  const getStatusIcon = (status: MentorRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'admin_approved':
        return <ArrowRight className="h-4 w-4 text-blue-600" />;
      case 'admin_rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'mentor_approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'mentor_rejected':
        return <XCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'admin_approved');
  const approvedRequests = requests.filter(r => r.status === 'mentor_approved');
  const processedRequests = requests.filter(r => ['mentor_rejected', 'admin_rejected'].includes(r.status));

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading your mentorship requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <Users className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Mentor Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your mentorship requests and connections
          </p>
          <Button 
            onClick={fetchMentorRequests} 
            variant="outline" 
            className="mt-4"
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Response</p>
                  <p className="text-2xl font-bold text-blue-600">{pendingRequests.length}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Mentees</p>
                  <p className="text-2xl font-bold text-green-600">{approvedRequests.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                  <p className="text-2xl font-bold">{requests.length}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {requests.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Mentorship Requests</h3>
              <p className="text-muted-foreground">
                You haven't received any mentorship requests yet. Students will find you through our platform!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-blue-600" />
                  Requests Awaiting Your Response ({pendingRequests.length})
                </h2>
                <div className="grid gap-4">
                  {pendingRequests.map((request) => (
                    <RequestCard key={request.id} request={request} />
                  ))}
                </div>
              </div>
            )}

            {/* Active Mentorships */}
            {approvedRequests.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                  Active Mentorships ({approvedRequests.length})
                </h2>
                <div className="grid gap-4">
                  {approvedRequests.map((request) => (
                    <RequestCard key={request.id} request={request} />
                  ))}
                </div>
              </div>
            )}

            {/* Processed Requests */}
            {processedRequests.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <XCircle className="mr-2 h-5 w-5 text-gray-600" />
                  Past Requests ({processedRequests.length})
                </h2>
                <div className="grid gap-4">
                  {processedRequests.map((request) => (
                    <RequestCard key={request.id} request={request} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function RequestCard({ request }: { request: MentorRequest }) {
  const getStatusIcon = (status: MentorRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'admin_approved':
        return <ArrowRight className="h-4 w-4 text-blue-600" />;
      case 'admin_rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'mentor_approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'mentor_rejected':
        return <XCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
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
                <Link href={`/mentor/requests?token=${request.id}`}>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Respond Now
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Request:</strong> {request.requestMessage || 'No message provided'}
          </p>
        </div>
        
        {request.mentorNotes && (
          <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-800">
              <strong>Your Response:</strong> {request.mentorNotes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
