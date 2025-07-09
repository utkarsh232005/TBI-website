// src/app/mentor/my-mentees/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/user-context';
import { getApprovedMentees } from '@/app/actions/mentor-request-actions';
import type { MentorRequest } from '@/types/mentor-request';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users, Loader2, ArrowRight, User, Mail, MessageSquare } from "lucide-react";
import Link from 'next/link';

export default function MyMenteesPage() {
  const { user } = useUser();
  const [mentees, setMentees] = useState<MentorRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.email) {
      const fetchMentees = async () => {
        setIsLoading(true);
        const result = await getApprovedMentees(user.email!);
        if (result.success && result.mentees) {
          setMentees(result.mentees);
        } else {
          console.error("Failed to fetch mentees:", result.error);
        }
        setIsLoading(false);
      };
      fetchMentees();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Mentees</h1>
        <p className="text-gray-600 mt-1">
          An overview of all the users under your mentorship.
        </p>
      </div>

      {mentees.length === 0 ? (
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">You currently have no approved mentees.</p>
            <p className="text-gray-500 text-sm">When you approve a request, the user will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentees.map(menteeRequest => (
            <Card key={menteeRequest.id} className="bg-white hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>{menteeRequest.userName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{menteeRequest.userName}</CardTitle>
                  <CardDescription className="flex items-center text-xs">
                    <Mail className="w-3 h-3 mr-1" />
                    {menteeRequest.userEmail}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-3 bg-gray-50 p-3 rounded-md border">
                  <MessageSquare className="w-4 h-4 mr-2 inline-block" />
                  {menteeRequest.requestMessage}
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/mentor/my-mentees/${menteeRequest.userId}`}>
                    View Profile <ArrowRight className="ml-2 h-4 w-4" />
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
