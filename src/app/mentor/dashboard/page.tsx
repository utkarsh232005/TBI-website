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
  RefreshCw,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
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

  const [refreshing, setRefreshing] = useState(false);

  // Real-time listener for mentor requests
  useEffect(() => {
    if (!user || !user.email) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    // Set up real-time listener
    const q = query(
      collection(db, 'mentorRequests'),
      where('mentorEmail', '==', user.email)
    );
    
    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        try {
          const mentorRequests: MentorRequest[] = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
            } as MentorRequest;
          });
          
          // Sort manually since we removed orderBy
          mentorRequests.sort((a, b) => {
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bTime - aTime;
          });
          
          setRequests(mentorRequests);
          setIsLoading(false);
          
          // Show toast for new requests (only after initial load)
          if (!isLoading && mentorRequests.some(req => req.status === 'admin_approved')) {
            const newApprovedRequests = mentorRequests.filter(req => req.status === 'admin_approved');
            if (newApprovedRequests.length > 0) {
              console.log('New mentor requests detected:', newApprovedRequests.length);
            }
          }
        } catch (error) {
          console.error('Error processing mentor requests:', error);
          toast({
            title: "Error",
            description: "Failed to load your mentorship requests",
            variant: "destructive",
          });
          setIsLoading(false);
        }
      },
      (error) => {
        console.error('Error with real-time listener:', error);
        toast({
          title: "Connection Error", 
          description: "Failed to maintain real-time connection. Please refresh the page.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [user?.email]);

  // Manual refresh function
  const handleRefresh = async () => {
    setRefreshing(true);
    // The real-time listener will automatically update the data
    // Just show visual feedback
    setTimeout(() => {
      setRefreshing(false);
      toast({
        title: "Refreshed",
        description: "Dashboard data has been updated",
      });
    }, 1000);
  };

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
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Mentor Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back, {user?.name || 'Mentor'}! 
              <span className="ml-2 inline-flex items-center text-sm text-green-600">
                <Activity className="h-4 w-4 mr-1" />
                Live Updates Active
              </span>
            </p>
          </div>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm" 
            disabled={refreshing}
            className="text-gray-600 hover:text-gray-900"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className={`${pendingRequests.length > 0 ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'} shadow-sm hover:shadow-md transition-shadow`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Pending Response</CardTitle>
            <div className="relative">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              {pendingRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700 mb-1">{pendingRequests.length}</div>
            <div className="flex items-center text-xs text-gray-500">
              <span>{pendingRequests.length === 1 ? 'request needs' : 'requests need'} your attention</span>
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full ml-2 animate-pulse" title="Live updates"></span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Active Mentees</CardTitle>
            <Users className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700 mb-1">{approvedRequests.length}</div>
            <div className="flex items-center text-xs text-gray-500">
              <span>active mentorships</span>
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full ml-2 animate-pulse" title="Live updates"></span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Requests</CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700 mb-1">{requests.length}</div>
            <div className="flex items-center text-xs text-gray-500">
              <span>received in total</span>
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full ml-2 animate-pulse" title="Live updates"></span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Required Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-6 w-1 bg-blue-600 rounded-full" />
          <h2 className="text-xl font-semibold text-gray-900">
            Action Required
          </h2>
          {pendingRequests.length > 0 && (
            <Badge className="bg-red-100 text-red-800 border-red-200">
              {pendingRequests.length} pending
            </Badge>
          )}
        </div>
        
        {pendingRequests.length > 0 ? (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        ) : (
          <Card className="border-gray-200 bg-white shadow-sm">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4"/>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">All Caught Up!</h3>
              <p className="text-gray-600">No requests are waiting for your response.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function RequestCard({ request }: { request: MentorRequest }) {
  // Check if request is recent (within last 5 minutes)
  const isRecent = request.createdAt && (new Date().getTime() - new Date(request.createdAt).getTime()) < 5 * 60 * 1000;
  
  return (
    <Card className={`border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 ${isRecent ? 'border-blue-300 shadow-md' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="h-14 w-14 border-2 border-gray-200">
                <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                  {request.userName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isRecent && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full animate-pulse" />
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-gray-900 text-lg">{request.userName}</h3>
                {isRecent && (
                  <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
                    NEW
                  </Badge>
                )}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="mr-2 h-4 w-4" />
                Requested on {format(request.createdAt, 'MMM dd, yyyy')}
              </div>
            </div>
          </div>
          <Button 
            asChild 
            size="sm" 
            className={`${isRecent ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
          >
            <Link href={`/mentor/requests/${request.id}`} className="flex items-center gap-2">
              View & Respond 
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
