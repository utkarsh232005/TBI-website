
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'on-campus' | 'off-campus'>('on-campus');
  const searchParams = useSearchParams();

  // Initialize activeTab from URL params
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl === 'off-campus') {
      setActiveTab('off-campus');
    } else {
      setActiveTab('on-campus');
    }
  }, [searchParams]);

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
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSubmission(null);
  };

  const SubmissionsGrid = ({ submissions, type }: { submissions: Submission[], type: 'on-campus' | 'off-campus' }) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-10 rounded-xl admin-card">
          <Loader2 className="mr-3 h-8 w-8 animate-spin text-blue-600" />
          <span className="admin-body-small admin-font-medium">Loading {type} submissions...</span>
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-10 rounded-xl bg-rose-900/10 border border-rose-900/30">
          <AlertCircle className="h-10 w-10 text-rose-400 mb-3" />
          <h3 className="admin-heading-4 admin-text-error">Error loading data</h3>
          <p className="admin-caption mt-1 mb-4 text-center max-w-md">{error}</p>
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
    if (submissions.length === 0) {
      return (
        <div className="text-center py-16 rounded-2xl admin-card border-dashed border-gray-200/50 relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white/10 to-purple-50/20 rounded-2xl"></div>
          <div className="absolute top-6 right-6 w-2 h-2 bg-blue-400/20 rounded-full animate-bounce delay-300"></div>
          <div className="absolute bottom-8 left-8 w-1.5 h-1.5 bg-purple-400/30 rounded-full animate-bounce delay-700"></div>
          
          <div className="relative space-y-8">
            {/* Enhanced icon */}
            <div className="relative group mx-auto w-fit">
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 via-purple-500/15 to-indigo-500/20 rounded-full blur opacity-50 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative admin-icon admin-icon-blue w-fit mx-auto p-8 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-500">
                <FileTextIcon className="h-20 w-20 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
              </div>
            </div>
            
            <div>
              <h3 className="admin-heading-3 mb-3">No {type} submissions yet</h3>
              <p className="admin-body-large max-w-lg mx-auto leading-relaxed">
                {type === 'on-campus' 
                  ? 'On-campus applications will appear here once students submit their innovative startup ideas through the platform' 
                  : 'Off-campus applications will appear here once imported from external sources or submitted directly'
                }
              </p>
            </div>
            
            {type === 'off-campus' && (
              <div className="relative">
                <Button 
                  onClick={handleImportOffCampus}
                  disabled={isImporting}
                  className="group relative bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-3 px-8 rounded-full border-0 shadow-lg shadow-purple-200/50 hover:shadow-xl hover:shadow-purple-300/50 transition-all duration-300 hover:scale-105 overflow-hidden"
                >
                  {/* Button shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
                  
                  <div className="relative flex items-center gap-2">
                    {isImporting ? <Loader2 className="h-5 w-5 animate-spin"/> : <UploadCloud className="h-5 w-5 group-hover:scale-110 transition-transform duration-300"/>}
                    <span>Import Off-Campus Data</span>
                  </div>
                </Button>
              </div>
            )}
            
            {/* Animated badge */}
            <div className="relative">
              <div className="admin-badge admin-badge-neutral inline-flex items-center py-2 px-4 rounded-full shadow-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                <span className="font-medium">Waiting for applications...</span>
              </div>
            </div>
          </div>
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
    <div className="w-full min-h-screen flex flex-col items-center bg-gray-50 py-10 px-2">
      <div className="w-full max-w-6xl mx-auto space-y-8">
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden relative">
          <div className="px-8 pt-8 pb-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 rounded-full p-3 flex items-center justify-center">
                <FileTextIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Submissions</h2>
                <p className="text-sm text-gray-500">Review applications with a clean, professional interface</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={fetchSubmissions} 
                disabled={isLoading} 
                className="bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 focus:ring-2 focus:ring-blue-200 rounded-lg shadow-sm px-5 py-2 font-medium transition"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Refresh
              </Button>
              <Button 
                onClick={handleImportOffCampus}
                disabled={isImporting}
                className="bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 focus:ring-2 focus:ring-purple-200 rounded-lg shadow-sm px-5 py-2 font-medium transition"
              >
                {isImporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UploadCloud className="h-4 w-4 mr-2" />}
                Import Off-Campus Data
              </Button>
            </div>
          </div>
          <div className="px-8 pt-6 pb-2">
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => setActiveTab('on-campus')}
                className={`px-5 py-2 rounded-lg font-semibold border transition focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                  activeTab === 'on-campus'
                    ? 'bg-blue-600 text-white border-blue-600 shadow'
                    : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'
                }`}
                aria-current={activeTab === 'on-campus'}
              >
                <span className="inline-flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  On-Campus
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('off-campus')}
                className={`px-5 py-2 rounded-lg font-semibold border transition focus:outline-none focus:ring-2 focus:ring-purple-200 ${
                  activeTab === 'off-campus'
                    ? 'bg-purple-600 text-white border-purple-600 shadow'
                    : 'bg-white text-purple-700 border-purple-200 hover:bg-purple-50'
                }`}
                aria-current={activeTab === 'off-campus'}
              >
                <span className="inline-flex items-center gap-2">
                  <Landmark className="h-4 w-4" />
                  Off-Campus
                </span>
              </button>
            </div>
            {activeTab === 'on-campus' && (
              <SubmissionsGrid submissions={onCampusSubmissions} type="on-campus" />
            )}
            {activeTab === 'off-campus' && (
              <SubmissionsGrid submissions={offCampusSubmissions} type="off-campus" />
            )}
          </div>
        </div>
        <SubmissionDetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          submission={selectedSubmission}
        />
      </div>
    </div>
  );
}

export default function AdminSubmissionsPage() {
  return (
    <Suspense fallback={
      <div className="space-y-8">
        <div className="admin-card overflow-hidden">
          <div className="p-6 flex flex-col sm:flex-row sm:justify-between items-start sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <FileTextIcon className="mr-2"/>Submissions
              </h2>
              <p className="text-sm text-gray-500">Loading submissions...</p>
            </div>
          </div>
          <div className="p-6 flex items-center justify-center">
            <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
          </div>
        </div>
      </div>
    }>
      <AdminSubmissionsContent />
    </Suspense>
  );
}
