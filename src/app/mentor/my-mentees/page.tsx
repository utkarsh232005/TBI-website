// src/app/mentor/my-mentees/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/user-context';
import { getApprovedMentees } from '@/app/actions/mentor-request-actions';
import type { MentorRequest } from '@/types/mentor-request';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Loader2, 
  ArrowRight, 
  User, 
  Mail, 
  MessageSquare, 
  Search,
  Filter,
  Calendar,
  Star,
  TrendingUp,
  Clock
} from "lucide-react";
import Link from 'next/link';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Extended type to include actual user details
type MentorRequestWithUserDetails = MentorRequest & {
  actualUserName?: string;
  actualUserDetails?: {
    name: string;
    firstName: string;
    lastName: string;
  };
};

export default function MyMenteesPage() {
  const { user } = useUser();
  const [mentees, setMentees] = useState<MentorRequestWithUserDetails[]>([]);
  const [filteredMentees, setFilteredMentees] = useState<MentorRequestWithUserDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  useEffect(() => {
    if (user?.email) {
      const fetchMentees = async () => {
        setIsLoading(true);
        const result = await getApprovedMentees(user.email!);
        if (result.success && result.mentees) {
          // Fetch user details for each mentee
          const menteesWithUserDetails = await Promise.all(
            result.mentees.map(async (mentee) => {
              const userDetails = await fetchUserDetails(mentee.userEmail);
              return {
                ...mentee,
                actualUserName: userDetails?.name || mentee.userName,
                actualUserDetails: userDetails
              } as MentorRequestWithUserDetails;
            })
          );
          
          setMentees(menteesWithUserDetails);
          setFilteredMentees(menteesWithUserDetails);
        } else {
          console.error("Failed to fetch mentees:", result.error);
        }
        setIsLoading(false);
      };
      fetchMentees();
    }
  }, [user]);

  // Filter mentees based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMentees(mentees);
    } else {
      const filtered = mentees.filter(mentee =>
        (mentee.actualUserName || mentee.userName).toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentee.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (mentee.requestMessage && mentee.requestMessage.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredMentees(filtered);
    }
  }, [searchQuery, mentees]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString("en-US", { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return "N/A";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your mentees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              My Mentees
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Guide and support the next generation of innovators
            </p>
          </div>

          {/* Stats Cards */}
          <div className="flex gap-4">
            <Card className="border-gray-200 bg-white shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{mentees.length}</p>
                    <p className="text-xs text-gray-500">Total Mentees</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-gray-200 bg-white shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{mentees.length}</p>
                    <p className="text-xs text-gray-500">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <Card className="border-gray-200 bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search mentees by name, email, or message..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
          
          {searchQuery && (
            <div className="mt-4 text-sm text-gray-500">
              Showing {filteredMentees.length} of {mentees.length} mentees
              {searchQuery && ` matching "${searchQuery}"`}
            </div>
          )}
        </CardContent>
      </Card>

        {/* Mentees Grid */}
        {filteredMentees.length === 0 ? (
          <Card className="border-gray-200 bg-white shadow-sm">
            <CardContent className="text-center py-16">
              <div className="mb-6">
                <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchQuery ? 'No mentees found' : 'No mentees yet'}
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {searchQuery 
                    ? `No mentees match your search for "${searchQuery}". Try adjusting your search terms.`
                    : 'You currently have no approved mentees. When you approve mentorship requests, they will appear here.'
                  }
                </p>
              </div>
              {searchQuery && (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchQuery('')}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Clear Search
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredMentees.map((menteeRequest, index) => (
              <Card key={menteeRequest.id} className="border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 h-full">
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <Avatar className="h-14 w-14 ring-2 ring-gray-200 transition-all duration-300">
                        <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                          {getInitials(menteeRequest.actualUserName || menteeRequest.userName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg text-gray-900 transition-colors truncate">
                        {menteeRequest.actualUserName || menteeRequest.userName}
                      </CardTitle>
                      <CardDescription className="flex items-center text-gray-600 text-sm mt-1">
                        <Mail className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="truncate">{menteeRequest.userEmail}</span>
                      </CardDescription>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
                          Active Mentee
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pb-4">
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-gray-500 font-medium">INITIAL REQUEST</span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
                        {menteeRequest.requestMessage}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Joined {formatDate(menteeRequest.mentorProcessedAt || menteeRequest.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Recent</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="pt-0">
                  <Button 
                    asChild 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Link href={`/mentor/my-mentees/${menteeRequest.userId}`}>
                      <User className="mr-2 h-4 w-4" />
                      View Profile 
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }
