
// src/app/admin/dashboard/page.tsx
"use client"; // This page will fetch data client-side for simplicity with Firebase SDK

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, LogOut, Users, FileText, AlertCircle, Loader2 } from "lucide-react";
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns'; // For formatting dates

interface Submission {
  id: string;
  name: string;
  email: string;
  companyName?: string;
  idea: string;
  campusStatus?: "campus" | "off-campus";
  submittedAt: Date | string; // Store as Date object after fetching
}

export default function AdminDashboardPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const submissionsCollection = collection(db, "contactSubmissions");
        const q = query(submissionsCollection, orderBy("submittedAt", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedSubmissions: Submission[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedSubmissions.push({
            id: doc.id,
            name: data.name,
            email: data.email,
            companyName: data.companyName,
            idea: data.idea,
            campusStatus: data.campusStatus,
            submittedAt: data.submittedAt instanceof Timestamp ? data.submittedAt.toDate() : new Date(data.submittedAt) // Convert Firestore Timestamp to JS Date
          });
        });
        setSubmissions(fetchedSubmissions);
      } catch (err: any) {
        console.error("Error fetching submissions: ", err);
        setError("Failed to load submissions. Please check console for details or ensure you have correct Firestore permissions.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  const formatDate = (date: Date | string) => {
    if (!date) return 'N/A';
    try {
      return format(new Date(date), "PPpp"); // e.g., Jul 27, 2024, 12:30:00 PM
    } catch {
      return 'Invalid Date';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-8 w-8 text-primary" />
            <h1 className="font-orbitron text-2xl font-bold text-primary">Admin Dashboard</h1>
          </div>
          <Button asChild variant="outline">
            <Link href="/">
              <LogOut className="mr-2 h-4 w-4" /> Back to Homepage
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <FileText className="mr-3 h-7 w-7 text-primary" />
              Application Submissions
            </CardTitle>
            <CardDescription>
              View and manage all applications submitted through the contact form.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
                <span className="text-muted-foreground">Loading submissions...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-10 text-destructive">
                <AlertCircle className="mr-2 h-8 w-8" />
                <p className="font-semibold">Error loading data</p>
                <p className="text-sm">{error}</p>
                <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">Try Again</Button>
              </div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-10">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No submissions yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead className="min-w-[200px]">Idea</TableHead>
                      <TableHead>Campus Status</TableHead>
                      <TableHead>Submitted At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium">{submission.name}</TableCell>
                        <TableCell>{submission.email}</TableCell>
                        <TableCell>{submission.companyName || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={submission.idea}>
                            {submission.idea}
                          </div>
                        </TableCell>
                        <TableCell>
                          {submission.campusStatus ? (
                            <Badge variant={submission.campusStatus === 'campus' ? 'default' : 'secondary'}>
                              {submission.campusStatus.charAt(0).toUpperCase() + submission.campusStatus.slice(1)}
                            </Badge>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                        <TableCell>{formatDate(submission.submittedAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Placeholder for more admin features */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Users className="mr-3 h-7 w-7 text-primary" />
              User Management (Placeholder)
            </CardTitle>
            <CardDescription>
              This section will allow managing users once full Firebase Authentication is implemented.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">User management features will be available here.</p>
             <Button variant="outline" className="mt-4" disabled>Manage Users</Button>
          </CardContent>
        </Card>

      </main>
       <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        InnoNexus Admin Panel &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
