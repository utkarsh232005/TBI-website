"use client";

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileTextIcon } from "lucide-react";
import { AlertCircle, Loader2, ThumbsUp, ThumbsDown, KeyRound, UserCircle, CheckCircle, XCircle, Clock, Landmark, Building, RefreshCw } from "lucide-react";
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { processApplicationAction } from '@/app/actions/admin-actions';
import { SubmissionsTable } from './components/SubmissionsTable';
import { Submission } from '@/types/Submission';

interface ProcessingActionState {
  id: string;
  type: 'accept' | 'reject';
}

export default function AdminDashboardPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [processingActionState, setProcessingActionState] = useState<ProcessingActionState | null>(null);

  const [kpiData, setKpiData] = useState({ total: 0, pending: 0, accepted: 0, rejected: 0 });

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
          ...data,
          submittedAt: data.submittedAt instanceof Timestamp ? data.submittedAt.toDate() : new Date(data.submittedAt),
          status: data.status || "pending",
          processedByAdminAt: data.processedByAdminAt instanceof Timestamp ? data.processedByAdminAt.toDate() : data.processedByAdminAt ? new Date(data.processedByAdminAt) : undefined,
        } as Submission);
      });
      setSubmissions(fetched);
      updateKpi(fetched);
    } catch (err: any) {
      console.error("Error fetching submissions:", err);
      setError("Failed to load submissions.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateKpi = (data: Submission[]) => {
    const counts = { pending: 0, accepted: 0, rejected: 0 };
    data.forEach(sub => counts[sub.status]++);
    setKpiData({ total: data.length, pending: counts.pending, accepted: counts.accepted, rejected: counts.rejected });
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

  const getBadgeClasses = (status: Submission['status']) =>
    status === 'accepted'
      ? 'bg-teal-500/10 text-teal-400'
      : status === 'rejected'
        ? 'bg-rose-500/10 text-rose-400'
        : 'bg-amber-500/10 text-amber-400';

  const KpiCard = ({ title, value, Icon, description, className = '', iconBg, valueColor }: { title: string; value: number | string; Icon: React.ComponentType<{ className?: string }>; description?: string; className?: string; iconBg?: string; valueColor?: string }) => (
    <div className={`admin-card group cursor-pointer admin-float ${className}`}>
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`admin-icon ${
            iconBg?.includes('indigo') || valueColor?.includes('indigo') ? 'admin-icon-blue' : 
            iconBg?.includes('teal') || iconBg?.includes('green') || valueColor?.includes('teal') || valueColor?.includes('green') ? 'admin-icon-green' : 
            iconBg?.includes('amber') || valueColor?.includes('amber') ? 'admin-icon-amber' : 
            iconBg?.includes('rose') || valueColor?.includes('rose') ? 'admin-icon-red' : 'admin-icon-blue'
          }`}>
            <Icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
          </div>
          <div className="admin-badge admin-badge-neutral">
            +2.5%
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">{title}</h3>
          <p className={`text-2xl font-bold transition-all duration-300 group-hover:scale-105 ${
            valueColor?.includes('indigo') ? 'text-blue-600' : 
            valueColor?.includes('teal') || valueColor?.includes('green') ? 'text-green-600' : 
            valueColor?.includes('amber') ? 'text-amber-600' : 
            valueColor?.includes('rose') ? 'text-red-600' : 'text-gray-900'
          }`}>
            {value}
          </p>
          {description && (
            <p className="text-xs font-medium text-muted-foreground flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-1.5"></span>
              {description}
            </p>
          )}
        </div>
      </div>
      {/* Shimmer effect on hover */}
      <div className="admin-shimmer absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl"></div>
    </div>
  );

  // Custom card components for each KPI with specific styling
  const TotalCard = () => (
    <div className="admin-card cursor-pointer hover:border-blue-500/30 hover:shadow-blue-500/5">
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="admin-icon admin-icon-blue">
            <FileTextIcon className="h-5 w-5" />
          </div>
          <div className="admin-badge admin-badge-neutral">
            +2.5%
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Total</h3>
          <p className="text-2xl font-bold text-blue-600">
            {kpiData.total}
          </p>
          <p className="text-xs font-medium text-muted-foreground flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-1.5"></span>
            All received
          </p>
        </div>
      </div>
    </div>
  );

  const PendingCard = () => (
    <div className="admin-card cursor-pointer hover:border-amber-500/30 hover:shadow-amber-500/5">
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="admin-icon admin-icon-amber">
            <Clock className="h-5 w-5" />
          </div>
          <div className="admin-badge admin-badge-neutral">
            +2.5%
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Pending</h3>
          <p className="text-2xl font-bold text-amber-600">
            {kpiData.pending}
          </p>
          <p className="text-xs font-medium text-muted-foreground flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-1.5"></span>
            Awaiting review
          </p>
        </div>
      </div>
    </div>
  );

  const AcceptedCard = () => (
    <div className="admin-card cursor-pointer hover:border-teal-500/30 hover:shadow-teal-500/5">
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="admin-icon admin-icon-green">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div className="admin-badge admin-badge-neutral">
            +2.5%
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Accepted</h3>
          <p className="text-2xl font-bold text-green-600">
            {kpiData.accepted}
          </p>
          <p className="text-xs font-medium text-muted-foreground flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-1.5"></span>
            Approved
          </p>
        </div>
      </div>
    </div>
  );

  const RejectedCard = () => (
    <div className="admin-card cursor-pointer hover:border-rose-500/30 hover:shadow-rose-500/5">
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="admin-icon admin-icon-red">
            <XCircle className="h-5 w-5" />
          </div>
          <div className="admin-badge admin-badge-neutral">
            +2.5%
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Rejected</h3>
          <p className="text-2xl font-bold text-red-600">
            {kpiData.rejected}
          </p>
          <p className="text-xs font-medium text-muted-foreground flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-1.5"></span>
            Denied
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <TotalCard />
          <PendingCard />
          <AcceptedCard />
          <RejectedCard />
        </div>
        <div className="admin-card overflow-hidden">
          <div className="admin-header">
            <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center">
              <div className="flex items-center gap-4">
                <div className="admin-icon admin-icon-blue">
                  <FileTextIcon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-3xl font-black mb-1">Submissions</h2>
                  <p className="font-semibold text-lg text-muted-foreground">Review applications</p>
                </div>
              </div>
              <Button 
                onClick={fetchSubmissions} 
                disabled={isLoading} 
                className="admin-btn admin-btn-primary group mt-4 sm:mt-0"
              >
                <span className={`${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`}>
                  {isLoading ? <Loader2 className="h-5 w-5"/> : <RefreshCw className="h-5 w-5"/>}
                </span>
                Refresh
              </Button>
            </div>
          </div>
          <SubmissionsTable
            submissions={submissions}
            processingAction={processingActionState}
            onProcessAction={handleProcess}
            isLoading={isLoading}
            error={error}
            onRetry={fetchSubmissions}
          />
        </div>
    </div>
  );
}
