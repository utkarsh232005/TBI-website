
// src/app/admin/dashboard/page.tsx
"use client"; 

import { useEffect, useState } from 'react';
// import Link from 'next/link'; // No longer needed here
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Loader2, ThumbsUp, ThumbsDown, KeyRound, UserCircle, FileTextIcon } from "lucide-react";
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { processApplicationAction } from '@/app/actions/admin-actions';

interface Submission {
  id: string;
  name: string;
  email: string;
  companyName?: string;
  idea: string;
  campusStatus?: "campus" | "off-campus";
  submittedAt: Date | string;
  status: "pending" | "accepted" | "rejected";
  temporaryUserId?: string;
  temporaryPassword?: string;
  processedByAdminAt?: Date | string;
}

export default function AdminDashboardPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [processingSubmissionId, setProcessingSubmissionId] = useState<string | null>(null);

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
          submittedAt: data.submittedAt instanceof Timestamp ? data.submittedAt.toDate() : new Date(data.submittedAt),
          status: data.status || "pending", // Default to pending if status is not set
          temporaryUserId: data.temporaryUserId,
          temporaryPassword: data.temporaryPassword,
          processedByAdminAt: data.processedByAdminAt instanceof Timestamp ? data.processedByAdminAt.toDate() : (data.processedByAdminAt ? new Date(data.processedByAdminAt) : undefined),
        });
      });
      setSubmissions(fetchedSubmissions);
    } catch (err: any) {
      console.error("Error fetching submissions: ", err);
      setError("Failed to load submissions. Please check console or Firestore permissions.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    try {
      return format(new Date(date), "PPpp"); 
    } catch {
      return 'Invalid Date';
    }
  };

  const handleProcessApplication = async (submissionId: string, action: 'accept' | 'reject', applicantName: string, applicantEmail: string) => {
    setProcessingSubmissionId(submissionId);
    try {
      const result = await processApplicationAction(submissionId, action, applicantName, applicantEmail);
      if (result.status === 'success') {
        toast({
          title: `Application ${action === 'accept' ? 'Accepted' : 'Rejected'}`,
          description: result.message,
        });
        // Update local state to reflect changes
        setSubmissions(prevSubmissions =>
          prevSubmissions.map(sub =>
            sub.id === submissionId
              ? { ...sub, 
                  status: action, 
                  temporaryUserId: action === 'accept' ? result.temporaryUserId : undefined,
                  temporaryPassword: action === 'accept' ? result.temporaryPassword : undefined,
                  processedByAdminAt: new Date() // Approximate, actual value is set by serverTimestamp
                }
              : sub
          )
        );
      } else {
        toast({
          title: "Processing Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error(`Error ${action}ing application: `, err);
      toast({
        title: "Error",
        description: `Failed to ${action} application. ${err.message || ''}`,
        variant: "destructive",
      });
    } finally {
      setProcessingSubmissionId(null);
    }
  };

  const getStatusBadgeVariant = (status: Submission['status']) => {
    switch (status) {
      case 'accepted':
        return 'default'; 
      case 'rejected':
        return 'destructive';
      case 'pending':
      default:
        return 'secondary'; 
    }
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <FileTextIcon className="mr-3 h-7 w-7 text-primary" />
            Application Submissions
          </CardTitle>
          <CardDescription>
            View and manage applications. Temporary credentials for accepted users are shown below.
            <br />
            <span className="text-xs text-muted-foreground">
              Email notifications are sent via Resend (API key required).
            </span>
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
              <Button onClick={fetchSubmissions} variant="outline" className="mt-4">Try Again</Button>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-10">
              <FileTextIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No submissions yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Idea</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">{submission.name}</TableCell>
                      <TableCell>{submission.email}</TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={submission.idea}>
                          {submission.idea}
                        </div>
                        {submission.status === 'accepted' && submission.temporaryUserId && (
                          <div className="mt-1 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1"><UserCircle size={12}/> User ID: {submission.temporaryUserId}</div>
                              <div className="flex items-center gap-1"><KeyRound size={12}/> Pass: {submission.temporaryPassword}</div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(submission.status)} className="capitalize">
                          {submission.status}
                        </Badge>
                        {submission.processedByAdminAt && (
                           <div className="text-xs text-muted-foreground mt-1">({formatDate(submission.processedByAdminAt)})</div>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(submission.submittedAt)}</TableCell>
                      <TableCell className="text-right space-x-2">
                        {submission.status === 'pending' ? (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleProcessApplication(submission.id, 'accept', submission.name, submission.email)}
                              disabled={processingSubmissionId === submission.id}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              {processingSubmissionId === submission.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsUp className="h-4 w-4" />}
                              <span className="ml-1 hidden sm:inline">Accept</span>
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleProcessApplication(submission.id, 'reject', submission.name, submission.email)}
                              disabled={processingSubmissionId === submission.id}
                            >
                              {processingSubmissionId === submission.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsDown className="h-4 w-4" />}
                               <span className="ml-1 hidden sm:inline">Reject</span>
                            </Button>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">Processed</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
