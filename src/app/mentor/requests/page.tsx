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
  ArrowRight,
  Filter,
  Search
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { collection, query, where, orderBy, onSnapshot, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { MentorRequest } from '@/types/mentor-request';
import { format } from 'date-fns';
import { useUser } from '@/contexts/user-context';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Extended type to include actual user details
type MentorRequestWithUserDetails = MentorRequest & {
  actualUserName?: string;
  actualUserDetails?: {
    name: string;
    firstName: string;
    lastName: string;
  };
};

const statusConfig: { [key: string]: { label: string; color: string; icon: React.ReactElement } } = {
  pending: { label: 'Under Review', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: <Clock className="h-3 w-3" /> },
  admin_approved: { label: 'Awaiting Your Response', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: <ArrowRight className="h-3 w-3" /> },
  admin_rejected: { label: 'Not Approved by Admin', color: 'bg-red-100 text-red-800 border-red-200', icon: <XCircle className="h-3 w-3" /> },
  mentor_approved: { label: 'Approved', color: 'bg-green-100 text-green-800 border-green-200', icon: <CheckCircle className="h-3 w-3" /> },
  mentor_rejected: { label: 'Declined by You', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: <XCircle className="h-3 w-3" /> },
};

export default function MentorRequestsPage() {
  const [requests, setRequests] = useState<MentorRequestWithUserDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();

  // Function to fetch user details from users collection
  const fetchUserDetails = async (userEmail: string): Promise<{ name: string; firstName: string; lastName: string } | null> => {
    try {
      // Query users collection by email
      const usersQuery = query(
        collection(db, 'users'),
        where('email', '==', userEmail)
      );
      
      const usersSnapshot = await getDocs(usersQuery);
      
      if (!usersSnapshot.empty) {
        const userData = usersSnapshot.docs[0].data();
        return {
          name: userData.name || '',
          firstName: userData.firstName || '',
          lastName: userData.lastName || ''
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
  };

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
      async (querySnapshot) => {
        try {
          const mentorRequests: MentorRequestWithUserDetails[] = await Promise.all(
            querySnapshot.docs.map(async (docSnapshot) => {
              const data = docSnapshot.data();
              const baseRequest = {
                id: docSnapshot.id,
                ...data,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
              } as MentorRequest;

              // Fetch actual user details
              const userDetails = await fetchUserDetails(data.userEmail);
              
              return {
                ...baseRequest,
                actualUserName: userDetails?.name || data.userName,
                actualUserDetails: userDetails
              } as MentorRequestWithUserDetails;
            })
          );
          
          // Sort manually since we removed orderBy
          mentorRequests.sort((a, b) => {
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bTime - aTime;
          });
          
          setRequests(mentorRequests);
          setIsLoading(false);
        } catch (error) {
          console.error('Error processing mentor requests:', error);
          toast({
            title: "Error",
            description: "Failed to load your mentorship requests.",
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
    setTimeout(() => {
      setRefreshing(false);
      toast({
        title: "Refreshed",
        description: "Requests have been updated",
      });
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your requests...</p>
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
              Mentorship Requests
            </h1>
            <p className="text-gray-600 text-lg">
              Review and respond to requests from aspiring mentees.
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

      {requests.length === 0 ? (
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardContent className="p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No mentor requests yet</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              When a student requests your mentorship, it will appear here for your review and response.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request, index) => {
              const statusInfo = statusConfig[request.status] || statusConfig.pending;
            return (
              <Card key={request.id} className="border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex items-center space-x-4 flex-1">
                      <Avatar className="h-14 w-14 border-2 border-gray-200">
                        <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                          {/* Use actual user name for initials */}
                          {request.actualUserName
                            ? request.actualUserName.split(' ').map(part => part.charAt(0)).join('').slice(0, 2).toUpperCase()
                            : request.userName.includes('@') 
                              ? request.userName.split('@')[0].slice(0, 2).toUpperCase()
                              : request.userName.slice(0, 2).toUpperCase()
                          }
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {/* Display actual user name from database */}
                          {request.actualUserName || request.userName}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <Mail className="mr-1 h-3 w-3" />
                          {request.userEmail}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <Badge className={cn(
                        "mb-2 text-xs border flex items-center",
                        request.status === 'admin_approved' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        request.status === 'mentor_approved' ? 'bg-green-100 text-green-800 border-green-200' :
                        request.status === 'mentor_rejected' ? 'bg-red-100 text-red-800 border-red-200' :
                        'bg-gray-100 text-gray-800 border-gray-200'
                      )}>
                          <span className="mr-1.5">{statusInfo.icon}</span>
                          {statusInfo.label}
                      </Badge>
                      <p className="text-xs text-gray-500 flex items-center justify-end mt-1">
                        <Calendar className="mr-1.5 h-3 w-3" />
                        {format(request.createdAt, 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700">
                      <strong className="font-medium text-gray-900">Request:</strong> {request.requestMessage || 'No message provided'}
                    </p>
                  </div>

                  <div className="mt-6 flex justify-end">
                    {request.status === 'admin_approved' && (
                      <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Link href={`/mentor/requests/${request.id}`} className="flex items-center gap-2">
                            Respond Now <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
          );
        })}
        </div>
      )}
    </div>
  );
}
