// src/app/mentor/dashboard/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { useUser } from '@/contexts/user-context';

const statusColors: { [key: string]: string } = {
  admin_approved: 'bg-blue-100 text-blue-800 border-blue-200',
  mentor_approved: 'bg-green-100 text-green-800 border-green-200',
  mentor_rejected: 'bg-gray-100 text-gray-800 border-gray-200',
};

const statusLabels: { [key: string]: string } = {
  admin_approved: 'Awaiting Your Response',
  mentor_approved: 'Approved',
  mentor_rejected: 'Declined',
};

export default function MentorDashboardPage() {
  const { user } = useUser();
  const [requests, setRequests] = useState<MentorRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchMentorRequests = async () => {
    if (!user || !user.email) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
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
        } as MentorRequest;
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
  }, [user]);

  const getStatusIcon = (status: MentorRequest['status']) => {
    switch (status) {
      case 'admin_approved': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'mentor_approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <XCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'admin_approved');
  const approvedRequests = requests.filter(r => r.status === 'mentor_approved');
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Mentor Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome back, {user?.name || 'Mentor'}!</p>
            </div>
            <Button onClick={fetchMentorRequests} variant="ghost" size="sm" disabled={isLoading} className="text-gray-500 hover:bg-gray-100 hover:text-gray-900">
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
            </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Response</CardTitle>
              <MessageSquare className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingRequests.length}</div>
              <p className="text-xs text-gray-500">requests need your attention</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Mentees</CardTitle>
              <Users className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedRequests.length}</div>
              <p className="text-xs text-gray-500">active mentorships</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white border border-gray-200 shadow-sm">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
               <Users className="h-5 w-5 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{requests.length}</div>
               <p className="text-xs text-gray-500">received in total</p>
            </CardContent>
          </Card>
        </div>

        <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Action Required
            </h2>
            {pendingRequests.length > 0 ? (
                <div className="space-y-4">
                    {pendingRequests.map(request => (
                        <RequestCard key={request.id} request={request} />
                    ))}
                </div>
            ) : (
                <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardContent className="p-6 text-center text-gray-500">
                        <CheckCircle className="h-10 w-10 mx-auto mb-3 text-green-500"/>
                        <p>All caught up! No requests are waiting for your response.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    </div>
  );
}

function RequestCard({ request }: { request: MentorRequest }) {
  return (
    <Card className="bg-white hover:shadow-lg transition-shadow border-l-4 border-blue-500">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback>{request.userName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-gray-900">{request.userName}</h3>
            <p className="text-sm text-gray-500 flex items-center">
              <Calendar className="mr-1.5 h-3 w-3" />
              Requested on {format(request.createdAt, 'MMM dd, yyyy')}
            </p>
          </div>
        </div>
        <Button asChild size="sm">
            <Link href={`/mentor/requests/${request.id}`}>
                View & Respond <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
