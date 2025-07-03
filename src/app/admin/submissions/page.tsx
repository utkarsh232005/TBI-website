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
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams) {
      const tab = searchParams.get('tab');
      if (tab && (tab === 'on-campus' || tab === 'off-campus')) {
        setActiveTab(tab);
      }
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

    if (isLoading && currentSubmissions.length === 0) {
      return (
        <div className="flex items-center justify-center py-10 rounded-xl admin-card">
          <Loader2 className="mr-3 h-8 w-8 animate-spin text-blue-600" />
          <span className="text-gray-700 font-medium">Loading {type} submissions...</span>
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
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No {type} submissions yet</h3>
              <p className="text-gray-600 text-lg max-w-lg mx-auto leading-relaxed">
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
        {currentSubmissions.map(submission => (
          type === "on-campus" ? (
            <OnCampusSubmissionCard
              key={submission.id}
              submission={submission}
              processingAction={processingActionState}
              onProcessAction={handleProcess}
              onViewDetails={handleViewDetails}
            />
          ) : (
            <OffCampusSubmissionCard
              key={submission.id}
              submission={submission}
              processingAction={processingActionState}
              onProcessAction={handleProcess}
              onViewDetails={handleViewDetails}
            />
          )
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">        <div className="admin-card overflow-hidden relative">
          {/* Background gradient effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white/10 to-purple-50/20 rounded-3xl opacity-0 hover:opacity-100 transition-all duration-700"></div>
          
          <div className="admin-header relative">
            {/* Top gradient line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 opacity-70"></div>
            
            <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center">
              <div className="flex items-center gap-4">
                {/* Enhanced icon */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-indigo-500/20 rounded-xl blur opacity-50 group-hover:opacity-100 transition-all duration-500"></div>
                  <div className="relative admin-icon admin-icon-blue group-hover:scale-110 transition-all duration-400 shadow-lg">
                    <FileTextIcon className="h-5 w-5 group-hover:text-blue-700 transition-colors duration-300" />
                  </div>
                </div>
                
                <div>
                  <h2 className="text-3xl font-black mb-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Submissions
                  </h2>
                  <p className="font-semibold text-lg text-muted-foreground">Review applications with enhanced interface</p>
                </div>
              </div>
            </div>
            
            {/* Enhanced action buttons */}
            <div className="flex items-center justify-start gap-4 mb-6 mt-6">
              <Button 
                onClick={fetchSubmissions} 
                disabled={isLoading} 
                className="group relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2.5 px-6 rounded-full border-0 shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-300/50 transition-all duration-300 hover:scale-105 overflow-hidden"
              >
                {/* Button shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
                
                <div className="relative flex items-center gap-2">
                  <span className={`${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`}>
                    {isLoading ? <Loader2 className="h-4 w-4"/> : <RefreshCw className="h-4 w-4"/>}
                  </span>
                  <span>Refresh</span>
                </div>
              </Button>
              
              <Button 
                onClick={handleImportOffCampus}
                disabled={isImporting}
                className="group relative bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-2.5 px-6 rounded-full border-0 shadow-lg shadow-purple-200/50 hover:shadow-xl hover:shadow-purple-300/50 transition-all duration-300 hover:scale-105 overflow-hidden"
              >
                {/* Button shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
                
                <div className="relative flex items-center gap-2">
                  {isImporting ? <Loader2 className="h-4 w-4 animate-spin"/> : <UploadCloud className="h-4 w-4 group-hover:scale-110 transition-transform duration-300"/>}
                  <span>Import Off-Campus Data</span>
                </div>
              </Button>
            </div>
          </div>

        <div className="p-6">
          <div className="flex items-center justify-start gap-4 mb-6">
            <Button
              variant={activeTab === 'on-campus' ? 'default' : 'outline'}
              onClick={() => setActiveTab('on-campus')}
              className={`group relative font-semibold py-3 px-8 rounded-full border-2 transition-all duration-300 hover:scale-105 overflow-hidden ${
                activeTab === 'on-campus' 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-500 shadow-lg shadow-blue-200/50' 
                  : 'bg-white/80 text-blue-600 border-blue-300 hover:bg-blue-50 hover:border-blue-400 shadow-sm'
              }`}
            >
              {/* Active tab shine effect */}
              {activeTab === 'on-campus' && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
              )}
              
              <div className="relative flex items-center gap-2">
                <Building className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                <span>On-Campus Submissions</span>
              </div>
            </Button>
            
            <Button
              variant={activeTab === 'off-campus' ? 'default' : 'outline'}
              onClick={() => setActiveTab('off-campus')}
              className={`group relative font-semibold py-3 px-8 rounded-full border-2 transition-all duration-300 hover:scale-105 overflow-hidden ${
                activeTab === 'off-campus' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white border-purple-500 shadow-lg shadow-purple-200/50' 
                  : 'bg-white/80 text-purple-600 border-purple-300 hover:bg-purple-50 hover:border-purple-400 shadow-sm'
              }`}
            >
              {/* Active tab shine effect */}
              {activeTab === 'off-campus' && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
              )}
              
              <div className="relative flex items-center gap-2">
                <Landmark className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                <span>Off-Campus Submissions</span>
              </div>
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