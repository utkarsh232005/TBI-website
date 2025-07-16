// src/app/mentor/requests/page.tsx
"use client";

import * as React from "react";
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { MentorRequest } from '@/types/mentor-request';
import { format } from 'date-fns';
import { useUser } from '@/contexts/user-context';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const statusConfig: { [key: string]: { label: string; color: string; icon: React.ReactElement } } = {
  pending: { label: 'Under Review', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: <Clock className="h-3 w-3" /> },
  admin_approved: { label: 'Awaiting Your Response', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: <ArrowRight className="h-3 w-3" /> },
  admin_rejected: { label: 'Not Approved by Admin', color: 'bg-red-100 text-red-800 border-red-200', icon: <XCircle className="h-3 w-3" /> },
  mentor_approved: { label: 'Approved', color: 'bg-green-100 text-green-800 border-green-200', icon: <CheckCircle className="h-3 w-3" /> },
  mentor_rejected: { label: 'Declined by You', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: <XCircle className="h-3 w-3" /> },
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
      // Temporary: Remove orderBy while index is building
      const q = query(
        collection(db, 'mentorRequests'),
        where('mentorEmail', '==', user.email)
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
      
      // Sort manually since we removed orderBy
      mentorRequests.sort((a, b) => {
        // Since we already converted to Date objects above, we can directly compare
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
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
    if (user) {
      fetchMentorRequests();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mentorship Requests</h1>
          <p className="text-gray-600 mt-1">
            Review and respond to requests from aspiring mentees.
          </p>
        </div>
        <Button onClick={fetchMentorRequests} variant="ghost" size="sm" disabled={isLoading} className="text-gray-500 hover:bg-gray-100 hover:text-gray-900">
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {requests.length === 0 ? (
        <Card className="text-center py-12 bg-white">
          <CardContent>
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2 text-gray-800">No mentor requests yet</h3>
            <p className="text-gray-500 mb-6">
              When a student requests your mentorship, it will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => {
              const statusInfo = statusConfig[request.status] || statusConfig.pending;
              return (
                <Card key={request.id} className="bg-white hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="flex items-center space-x-4 flex-1">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>{request.userName.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900">{request.userName}</h3>
                          <p className="text-sm text-gray-500 flex items-center mt-1">
                            <Mail className="mr-1 h-3 w-3" />
                            {request.userEmail}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <Badge className={cn("mb-2 text-xs border flex items-center", statusInfo.color)}>
                            <span className="mr-1.5">{statusInfo.icon}</span>
                            {statusInfo.label}
                        </Badge>
                        <p className="text-xs text-gray-500 flex items-center justify-end mt-1">
                          <Calendar className="mr-1.5 h-3 w-3" />
                          {format(request.createdAt, 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-700">
                        <strong className="font-medium text-gray-800">Request:</strong> {request.requestMessage || 'No message provided'}
                      </p>
                    </div>

                    <div className="mt-4 flex justify-end">
                      {request.status === 'admin_approved' && (
                        <Button asChild size="sm">
                          <Link href={`/mentor/requests/${request.id}`}>
                              Respond Now <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
            )
          })}
        </div>
      )}
    </div>
  );
}
