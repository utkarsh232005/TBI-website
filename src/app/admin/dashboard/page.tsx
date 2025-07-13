
"use client";

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileTextIcon, TrendingUp, Users, Activity, BarChart3 } from "lucide-react";
import { AlertCircle, Loader2, ThumbsUp, ThumbsDown, KeyRound, UserCircle, CheckCircle, XCircle, Clock, Landmark, Building, RefreshCw } from "lucide-react";
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';
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
      const collectionsToFetch = ['contactSubmissions', 'offCampusApplications'];
      const allSubmissions: Submission[] = [];

      for (const collectionName of collectionsToFetch) {
        const submissionsCollection = collection(db, collectionName);
        const q = query(submissionsCollection, orderBy("submittedAt", "desc"));
        const snapshot = await getDocs(q);
        
        snapshot.forEach(doc => {
          const data = doc.data();
          allSubmissions.push({
            id: doc.id,
            ...data,
            submittedAt: data.submittedAt instanceof Timestamp ? data.submittedAt.toDate() : new Date(data.submittedAt),
            status: data.status || "pending",
            processedByAdminAt: data.processedByAdminAt instanceof Timestamp ? data.processedByAdminAt.toDate() : data.processedByAdminAt ? new Date(data.processedByAdminAt) : undefined,
          } as Submission);
        });
      }

      // Sort combined submissions by date
      allSubmissions.sort((a, b) => new Date(b.submittedAt as string).getTime() - new Date(a.submittedAt as string).getTime());

      setSubmissions(allSubmissions);
      updateKpi(allSubmissions);
    } catch (err: any) {
      console.error("Error fetching submissions:", err);
      setError("Failed to load submissions.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateKpi = (data: Submission[]) => {
    const counts = { pending: 0, accepted: 0, rejected: 0 };
    data.forEach(sub => {
      if (sub.status === 'pending') counts.pending++;
      else if (sub.status === 'accepted') counts.accepted++;
      else if (sub.status === 'rejected') counts.rejected++;
    });
    setKpiData({ total: data.length, pending: counts.pending, accepted: counts.accepted, rejected: counts.rejected });
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

  const view = (submission: Submission) => {
    // Handle viewing submission details instantly
    console.log('Viewing submission details:', submission);
    
    // You can add additional logic here such as:
    // - Opening a modal with submission details
    // - Navigating to a detailed view page
    // - Setting selected submission state
    
    // For now, we'll just log the submission data
    // In a full implementation, you might want to:
    // setSelectedSubmission(submission);
    // setIsDetailsModalOpen(true);
  };

  // --- Typography utility classes (for inline use) ---
  const heading1 = "text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900";
  const heading2 = "text-xl sm:text-2xl font-bold text-gray-900";
  const label = "text-sm font-semibold text-gray-700 tracking-wide uppercase";
  const metricValue = "text-3xl font-bold text-gray-900";
  const metricDesc = "text-xs text-gray-500 mt-1";
  const cardBase = "bg-white rounded-2xl shadow-md border border-gray-100 flex flex-col justify-between p-6 min-h-[170px]";
  const cardIcon = "flex items-center justify-center w-12 h-12 rounded-xl mb-4";
  const cardTrend = "absolute top-4 right-4 px-2 py-0.5 rounded-full text-xs font-semibold bg-white/80 border border-gray-200";
  const cardGrid = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6";
  const section = "bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden";
  const sectionHeader = "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 p-8 border-b border-gray-50";
  const sectionTitle = "flex items-center gap-4";
  const sectionIcon = "w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center shadow-sm";
  const sectionStats = "flex items-center gap-3";
  const statBox = "flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100 text-gray-700 text-sm font-medium shadow-sm";
  const statBoxBlue = "flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100 text-blue-700 text-sm font-medium shadow-sm";
  const mainBg = "min-h-screen bg-[#f7fafd]";
  const mainWrap = "max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-10";
  const btn = "rounded-full px-6 py-3 font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm hover:shadow-md border-0 focus:outline-none focus:ring-2 focus:ring-blue-200 transition";
  const liveBtn = "flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100 text-blue-700 text-sm font-medium shadow-sm hover:bg-blue-100 transition";

  // --- MetricCard with unified layout ---
  type MetricCardProps = {
    title: string;
    value: number | string;
    icon: React.ComponentType<{ className?: string }>;
    trend?: string;
    description?: string;
    color: 'blue' | 'green' | 'amber' | 'red';
  };
  const MetricCard = ({ title, value, icon: Icon, trend, description }: MetricCardProps) => {
    return (
      <div className={`${cardBase} relative border-gray-100`}>
        <div className={`${cardIcon} bg-gray-100 text-gray-500`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className={`${cardTrend} text-gray-600 border-gray-200`}>{trend}</span>
        )}
        <div>
          <div className={label}>{title}</div>
          <div className={metricValue}>{value}</div>
          {description && <div className={metricDesc}>{description}</div>}
        </div>
      </div>
    );
  };

  return (
    <div className={mainBg}>
      <div className={mainWrap}>
        {/* Header Section */}
        <div className={section + " flex flex-col gap-0"}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 p-8">
            <div className="space-y-3">
              <h1 className={heading1}>
                Dashboard Overview
              </h1>
              <p className="text-base text-gray-600 font-normal">
                Monitor and manage your application submissions
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className={liveBtn.replace('text-blue-700', 'text-gray-700').replace('hover:bg-blue-100', 'hover:bg-gray-100').replace('border-blue-100', 'border-gray-200').replace('bg-blue-50', 'bg-gray-100')} type="button">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Live Updates
              </button>
              <Button
                onClick={fetchSubmissions}
                disabled={isLoading}
                className={btn.replace('text-white', 'text-gray-900').replace('bg-gradient-to-r from-blue-600 to-indigo-600', 'bg-gray-200').replace('hover:from-blue-700 hover:to-indigo-700', 'hover:bg-gray-300')}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2 text-gray-600" />
                ) : (
                  <RefreshCw className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-500 text-gray-600" />
                )}
                Refresh Data
              </Button>
            </div>
          </div>
        </div>

        {/* KPI Grid */}
        <div className={cardGrid}>
          <MetricCard
            title="Total Applications"
            value={kpiData.total}
            icon={FileTextIcon}
            description="All submissions received"
            color="blue"
            trend="+12.5%"
          />
          <MetricCard
            title="Pending Review"
            value={kpiData.pending}
            icon={Clock}
            description="Awaiting evaluation"
            color="amber"
            trend="+8.3%"
          />
          <MetricCard
            title="Approved"
            value={kpiData.accepted}
            icon={CheckCircle}
            description="Successfully accepted"
            color="green"
            trend="+15.2%"
          />
          <MetricCard
            title="Rejected"
            value={kpiData.rejected}
            icon={XCircle}
            description="Not approved"
            color="red"
            trend="-5.1%"
          />
        </div>

        {/* Submissions Table Section */}
        <div className={section}>
          <div className={sectionHeader}>
            <div className={sectionTitle}>
              <div className={sectionIcon.replace('bg-gradient-to-br from-blue-100 to-indigo-100', 'bg-gray-100 text-gray-500')}>
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h2 className={heading2}>Application Management</h2>
                <div className="text-sm text-gray-600 font-normal">Review and process submissions</div>
              </div>
            </div>
            <div className={sectionStats}>
              <div className={statBox.replace('text-blue-700', 'text-gray-700').replace('bg-blue-50', 'bg-gray-100').replace('border-blue-100', 'border-gray-200')}>
                <Activity className="w-4 h-4 text-gray-600" />
                {submissions.length} Total
              </div>
              <div className={statBoxBlue.replace('text-blue-700', 'text-gray-700').replace('bg-blue-50', 'bg-gray-100').replace('border-blue-100', 'border-gray-200')}>
                <Users className="w-4 h-4 text-gray-600" />
                {kpiData.pending} Pending
              </div>
            </div>
          </div>
          <div className="overflow-hidden">
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
      </div>
    </div>
  );
}
