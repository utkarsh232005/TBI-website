
"use client";

import { useEffect, useState, Suspense } from 'react';
import { Button } from "@/components/ui/button";
import { FileTextIcon, Loader2, AlertCircle, RefreshCw, UploadCloud, Building, Landmark } from "lucide-react";
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import { processApplicationAction, importOffCampusSubmissionsFromSheet } from '@/app/actions/admin-actions';
import { OffCampusSubmissionCard } from './components/OffCampusSubmissionCard';
import { Submission } from '@/types/Submission';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SubmissionDetailModal from './components/SubmissionDetailModal';

interface ProcessingActionState {
  id: string;
  type: 'accept' | 'reject';
}

function AdminSubmissionsContent() {
  const [onCampusSubmissions, setOnCampusSubmissions] = useState<Submission[]>([]);
  const [offCampusSubmissions, setOffCampusSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [processingActionState, setProcessingActionState] = useState<ProcessingActionState | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') === 'off-campus' ? 'off-campus' : 'on-campus';

  const fetchSubmissions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const onCampusQuery = query(collection(db, "contactSubmissions"), orderBy("submittedAt", "desc"));
      const offCampusQuery = query(collection(db, "offCampusApplications"), orderBy("submittedAt", "desc"));

      const [onCampusSnapshot, offCampusSnapshot] = await Promise.all([
        getDocs(onCampusQuery),
        getDocs(offCampusQuery)
      ]);

      const onCampusData = onCampusSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Submission));
      setOnCampusSubmissions(onCampusData);

      const offCampusData = offCampusSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Submission));
      setOffCampusSubmissions(offCampusData);

    } catch (err: any) {
      console.error("Error fetching submissions:", err);
      setError("Failed to load submissions.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchSubmissions(); }, []);

  const handleProcess = async (id: string, action: 'accept' | 'reject', name: string, email: string, campusStatus: Submission['campusStatus']) => {
    setProcessingActionState({ id, type: action });
    try {
      const result = await processApplicationAction(id, action, name, email, campusStatus);
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
        toast({ title: "Import Successful", description: result.message });
        fetchSubmissions();
      } else {
        toast({ title: "Import Failed", description: result.message || "An unknown error occurred during import.", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: `Failed to import off-campus data: ${error.message || 'Unknown error'}`, variant: "destructive" });
    } finally {
      setIsImporting(false);
    }
  };

  const handleViewDetails = (submission: Submission) => {
    setSelectedSubmission(submission);
  };

  const SubmissionsGrid = ({ submissions, type }: { submissions: Submission[], type: 'on-campus' | 'off-campus' }) => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {[...Array(6)].map((_, i) => <div key={i} className="h-96 bg-neutral-800/50 rounded-2xl animate-pulse" />)}
        </div>
      );
    }
    if (error) {
      return <div className="text-center py-10 text-red-400">{error}</div>;
    }
    if (submissions.length === 0) {
      return (
        <div className="text-center py-20 rounded-2xl bg-neutral-900/30 border border-dashed border-neutral-700/50">
          <FileTextIcon className="mx-auto h-12 w-12 text-neutral-500 mb-4" />
          <h3 className="text-lg font-medium text-neutral-200">No {type} submissions yet</h3>
          {type === 'off-campus' && (
            <Button onClick={handleImportOffCampus} disabled={isImporting} variant="secondary" size="sm" className="mt-4">
              {isImporting ? <Loader2 className="animate-spin mr-2" /> : <UploadCloud className="mr-2" />}
              Import Off-Campus Data
            </Button>
          )}
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {submissions.map(submission => (
          <OffCampusSubmissionCard
            key={submission.id}
            submission={submission}
            processingAction={processingActionState}
            onProcessAction={(id, action, name, email) => handleProcess(id, action, name, email, submission.campusStatus)}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center"><FileTextIcon className="mr-3 h-6 w-6 text-indigo-400"/>Submissions</h2>
          <p className="text-sm text-neutral-400 mt-1">Review and process all incoming applications.</p>
        </div>
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <Button onClick={fetchSubmissions} disabled={isLoading} variant="outline" size="sm" className="border-neutral-700 hover:border-neutral-500">
            {isLoading ? <Loader2 className="animate-spin mr-2"/> : <RefreshCw className="mr-2"/>}Refresh
          </Button>
          <Button onClick={handleImportOffCampus} disabled={isImporting} variant="secondary" size="sm">
            {isImporting ? <Loader2 className="animate-spin mr-2"/> : <UploadCloud className="mr-2"/>}Import Off-Campus
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-neutral-800/50">
          <TabsTrigger value="on-campus"><Landmark className="mr-2 h-4 w-4"/>On-Campus</TabsTrigger>
          <TabsTrigger value="off-campus"><Building className="mr-2 h-4 w-4"/>Off-Campus</TabsTrigger>
        </TabsList>
        <TabsContent value="on-campus">
          <SubmissionsGrid submissions={onCampusSubmissions} type="on-campus" />
        </TabsContent>
        <TabsContent value="off-campus">
          <SubmissionsGrid submissions={offCampusSubmissions} type="off-campus" />
        </TabsContent>
      </Tabs>
      
      <SubmissionDetailModal
        submission={selectedSubmission}
        isOpen={!!selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
      />
    </div>
  );
}

export default function AdminSubmissionsPage() {
  return (
    <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <AdminSubmissionsContent />
    </Suspense>
  );
}
