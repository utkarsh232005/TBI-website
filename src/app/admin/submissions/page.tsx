"use client";

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileTextIcon } from "lucide-react";
import { AlertCircle, Loader2, ThumbsUp, ThumbsDown, KeyRound, UserCircle, CheckCircle, XCircle, Clock, Landmark, Building, RefreshCw, UploadCloud } from "lucide-react";
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { processApplicationAction, importOffCampusSubmissionsFromSheet } from '@/app/actions/admin-actions';
import { SubmissionsTable } from '../dashboard/components/SubmissionsTable';

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

interface ProcessingActionState {
  id: string;
  type: 'accept' | 'reject';
}

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [onCampusSubmissions, setOnCampusSubmissions] = useState<Submission[]>([]);
  const [offCampusSubmissions, setOffCampusSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [processingActionState, setProcessingActionState] = useState<ProcessingActionState | null>(null);
  const [activeTab, setActiveTab] = useState<'on-campus' | 'off-campus'>('on-campus');
  const [isImporting, setIsImporting] = useState(false);

  const fetchSubmissions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const submissionsCollection = collection(db, "contactSubmissions");
      const q = query(submissionsCollection, orderBy("submittedAt", "desc"));
      const snapshot = await getDocs(q);
      const fetched: Submission[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        fetched.push({
          id: doc.id,
          name: data.name,
          email: data.email,
          companyName: data.companyName,
          idea: data.idea,
          campusStatus: data.campusStatus,
          submittedAt: data.submittedAt instanceof Timestamp ? data.submittedAt.toDate() : new Date(data.submittedAt),
          status: data.status || "pending",
          temporaryUserId: data.temporaryUserId,
          temporaryPassword: data.temporaryPassword,
          processedByAdminAt: data.processedByAdminAt instanceof Timestamp ? data.processedByAdminAt.toDate() : data.processedByAdminAt ? new Date(data.processedByAdminAt) : undefined,
        });
      });
      setSubmissions(fetched);
      setOnCampusSubmissions(fetched.filter(sub => sub.campusStatus === 'campus'));
      setOffCampusSubmissions(fetched.filter(sub => sub.campusStatus === 'off-campus'));
    } catch (err: any) {
      console.error("Error fetching submissions:", err);
      setError("Failed to load submissions.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchSubmissions(); }, []);

  const formatDate = (date?: Date | string) => {
    if (!date) return 'N/A';
    try { return format(new Date(date), "PPpp"); } catch { return 'Invalid Date'; }
  };

  const handleProcess = async (id: string, action: 'accept' | 'reject', name: string, email: string) => {
    setProcessingActionState({ id, type: action });
    try {
      const result = await processApplicationAction(id, action, name, email);
      if (result.status === 'success') {
        toast({ title: `Application ${action === 'accept' ? 'Accepted' : 'Rejected'}`, description: result.message });
        fetchSubmissions();
      } else {
        toast({ title: 'Failed', description: result.message, variant: 'destructive' });
      }
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error', description: `Could not ${action} application.`, variant: 'destructive' });
    } finally {
      setProcessingActionState(null);
    }
  };

  const handleImportOffCampus = async () => {
    setIsImporting(true);
    try {
      const result = await importOffCampusSubmissionsFromSheet();
      if (result.success) {
        toast({
          title: "Import Successful",
          description: result.message,
        });
        fetchSubmissions(); // Refresh data after import
      } else {
        toast({
          title: "Import Failed",
          description: result.message || "An unknown error occurred during import.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error during off-campus data import:", error);
      toast({
        title: "Error",
        description: `Failed to import off-campus data: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const SubmissionsOverview = ({ type }: { type: "on-campus" | "off-campus" }) => {
    const currentSubmissions = type === "on-campus" ? onCampusSubmissions : offCampusSubmissions;

    return (
      <SubmissionsTable
        submissions={currentSubmissions}
        processingAction={processingActionState}
        onProcessAction={handleProcess}
        isLoading={isLoading}
        error={error}
        onRetry={fetchSubmissions}
        className="mt-6"
      />
    );
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-neutral-900/50 border border-neutral-800/50 overflow-hidden">
        <div className="p-6 flex flex-col sm:flex-row sm:justify-between items-start sm:items-center">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center"><FileTextIcon className="mr-2"/>Submissions</h2>
            <p className="text-sm text-neutral-400">Review applications</p>
          </div>
          <div className="flex items-center justify-start gap-4 mb-6">
            <Button onClick={fetchSubmissions} disabled={isLoading} variant="outline" size="sm" className="mt-4 sm:mt-0">
              {isLoading ? <Loader2 className="animate-spin mr-2"/> : <RefreshCw className="mr-2"/>}Refresh
            </Button>
            <Button 
              onClick={handleImportOffCampus}
              disabled={isImporting}
              variant="secondary" 
              size="sm" 
              className="mt-4 sm:mt-0"
            >
              {isImporting ? <Loader2 className="animate-spin mr-2"/> : <UploadCloud className="mr-2"/>}Import Off-Campus Data
            </Button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-start gap-4 mb-6">
            <Button
              variant={activeTab === 'on-campus' ? 'default' : 'outline'}
              onClick={() => setActiveTab('on-campus')}
              className="px-6 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              On-Campus Submissions
            </Button>
            <Button
              variant={activeTab === 'off-campus' ? 'default' : 'outline'}
              onClick={() => setActiveTab('off-campus')}
              className="px-6 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Off-Campus Submissions
            </Button>
          </div>
          
          {activeTab === 'on-campus' && (
            <SubmissionsOverview type="on-campus" />
          )}
          {activeTab === 'off-campus' && (
            <SubmissionsOverview type="off-campus" />
          )}
        </div>
      </div>
    </div>
  );
} 