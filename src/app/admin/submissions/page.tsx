"use client";

import { useEffect, useState, Suspense } from 'react';
import { Button } from "@/components/ui/button";
import { FileTextIcon } from "lucide-react";
import { AlertCircle, Loader2, ThumbsUp, ThumbsDown, KeyRound, UserCircle, CheckCircle, XCircle, Clock, Landmark, Building, RefreshCw, UploadCloud } from "lucide-react";
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { processApplicationAction, importOffCampusSubmissionsFromSheet } from '@/app/actions/admin-actions';
import { SubmissionsTable } from '../dashboard/components/SubmissionsTable';
import { OnCampusSubmissionCard } from './components/OnCampusSubmissionCard';
import { Submission } from '@/types/Submission';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SubmissionDetailModal from './components/SubmissionDetailModal';

interface ProcessingActionState {
  id: string;
  type: 'accept' | 'reject';
}

function AdminSubmissionsContent() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [onCampusSubmissions, setOnCampusSubmissions] = useState<Submission[]>([]);
  const [offCampusSubmissions, setOffCampusSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [processingActionState, setProcessingActionState] = useState<ProcessingActionState | null>(null);
  const [activeTab, setActiveTab] = useState<'on-campus' | 'off-campus'>('on-campus');
  const [isImporting, setIsImporting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab as 'on-campus' | 'off-campus');
    }
  }, [searchParams]);

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

  const handleViewDetails = (submission: Submission) => {
    setSelectedSubmission(submission);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSubmission(null);
  };

  const SubmissionsOverview = ({ type }: { type: "on-campus" | "off-campus" }) => {
    const currentSubmissions = type === "on-campus" ? onCampusSubmissions : offCampusSubmissions;

    if (type === "on-campus") {
      if (isLoading && currentSubmissions.length === 0) {
        return (
          <div className="flex items-center justify-center py-10 rounded-xl bg-neutral-900/30">
            <Loader2 className="mr-3 h-8 w-8 animate-spin text-indigo-400" />
            <span className="text-neutral-300">Loading on-campus submissions...</span>
          </div>
        );
      }
    
      if (error) {
        return (
          <div className="flex flex-col items-center justify-center py-10 rounded-xl bg-rose-900/10 border border-rose-900/30">
            <AlertCircle className="h-10 w-10 text-rose-400 mb-3" />
            <h3 className="text-lg font-semibold text-rose-100">Error loading data</h3>
            <p className="text-sm text-rose-300 mt-1 mb-4 text-center max-w-md">{error}</p>
            <Button 
              onClick={fetchSubmissions} 
              variant="outline" 
              className="border-rose-500/30 text-rose-300 hover:bg-rose-900/30 hover:text-white"
            >
              Try Again
            </Button>
          </div>
        );
      }
    
      if (currentSubmissions.length === 0) {
        return (
          <div className="text-center py-12 rounded-xl bg-neutral-900/30 border border-dashed border-neutral-700/50">
            <FileTextIcon className="mx-auto h-12 w-12 text-neutral-500 mb-4" />
            <h3 className="text-lg font-medium text-neutral-200">No on-campus submissions yet</h3>
            <p className="text-neutral-400 mt-1">On-campus applications will appear here once submitted</p>
          </div>
        );
      }
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {currentSubmissions.map(submission => (
            <OnCampusSubmissionCard
              key={submission.id}
              submission={submission}
              processingAction={processingActionState}
              onProcessAction={handleProcess}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      );
    } else { // off-campus or any other type using table
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
    }
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
      <SubmissionDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        submission={selectedSubmission}
      />    </div>
  );
}

export default function AdminSubmissionsPage() {
  return (
    <Suspense fallback={
      <div className="space-y-8">
        <div className="rounded-2xl bg-neutral-900/50 border border-neutral-800/50 overflow-hidden">
          <div className="p-6 flex flex-col sm:flex-row sm:justify-between items-start sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center">
                <FileTextIcon className="mr-2"/>Submissions
              </h2>
              <p className="text-sm text-neutral-400">Loading submissions...</p>
            </div>
          </div>
          <div className="p-6 flex items-center justify-center">
            <Loader2 className="animate-spin h-8 w-8 text-neutral-400" />
          </div>
        </div>
      </div>
    }>
      <AdminSubmissionsContent />
    </Suspense>
  );
}