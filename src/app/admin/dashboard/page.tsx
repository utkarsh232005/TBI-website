
"use client";

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileTextIcon, TrendingUp, Users, Activity, BarChart3 } from "lucide-react";
import { AlertCircle, Loader2, ThumbsUp, ThumbsDown, KeyRound, UserCircle, CheckCircle, XCircle, Clock, Landmark, Building, RefreshCw } from "lucide-react";
import { getFirebaseDb } from '@/lib/firebase';
import { collection, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import { processApplicationAction } from '@/getFirebaseApp()/actions/admin-actions';
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
        const submissionsCollection = collection(getFirebaseDb(), collectionName);
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
  // Revamped for modern, accessible, enterprise-grade light theme
  const heading1 = "text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight";
  const heading2 = "text-2xl sm:text-3xl font-bold text-gray-900 mb-1";
  const label = "text-xs font-semibold text-gray-600 tracking-widest uppercase mb-1";
  const metricValue = "text-4xl font-extrabold text-gray-900";
  const metricDesc = "text-xs text-gray-500 mt-1";
  const cardBase = "bg-white rounded-3xl shadow-lg border border-gray-100 flex flex-col justify-between p-8 min-h-[170px] transition-shadow hover:shadow-xl";
  const cardIcon = "flex items-center justify-center w-14 h-14 rounded-2xl mb-5 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600";
  const cardTrend = "absolute top-5 right-5 px-2 py-0.5 rounded-full text-xs font-semibold bg-white/90 border border-gray-200 shadow-sm";
  const cardGrid = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8";
  const section = "bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden";
  const sectionHeader = "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8 p-10 border-b border-gray-50 bg-gray-50";
  const sectionTitle = "flex items-center gap-5";
  const sectionIcon = "w-14 h-14 bg-gray-100 text-gray-500 rounded-2xl flex items-center justify-center shadow-sm";
  const sectionStats = "flex items-center gap-4";
  const statBox = "flex items-center gap-2 px-5 py-2 bg-gray-50 rounded-full border border-gray-100 text-gray-700 text-sm font-medium shadow-sm";
  const statBoxBlue = "flex items-center gap-2 px-5 py-2 bg-blue-50 rounded-full border border-blue-100 text-blue-700 text-sm font-medium shadow-sm";
  const mainBg = "min-h-screen bg-gradient-to-br from-white via-blue-50 to-gray-50";
  const mainWrap = "max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-14";
  const btn = "rounded-full px-7 py-3 font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md border-0 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200";
  const liveBtn = "flex items-center gap-2 px-5 py-2 bg-green-50 rounded-full border border-green-100 text-green-700 text-sm font-medium shadow-sm hover:bg-green-100 transition-all duration-200";

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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10 p-10">
            <div className="space-y-4">
              <h1 className={heading1}>
                Dashboard Overview
              </h1>
              <p className="text-lg text-gray-600 font-normal max-w-2xl">
                Monitor and manage your application submissions with real-time insights and streamlined controls.
              </p>
            </div>
            <div className="flex items-center gap-5">
              <button className={liveBtn} type="button" aria-label="Live Updates">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Live Updates
              </button>
              <Button
                onClick={fetchSubmissions}
                disabled={isLoading}
                className={btn}
                aria-label="Refresh Data"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2 text-white" />
                ) : (
                  <RefreshCw className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-500 text-white" />
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
        <div className={section + " mt-10"}>
          <div className={sectionHeader}>
            <div className={sectionTitle}>
              <div className={sectionIcon}>
                <BarChart3 className="w-7 h-7" />
              </div>
              <div>
                <h2 className={heading2}>Application Management</h2>
                <div className="text-base text-gray-600 font-normal">Review and process submissions efficiently</div>
              </div>
            </div>
            <div className={sectionStats}>
              <div className={statBox}>
                <Activity className="w-4 h-4 text-gray-600" />
                {submissions.length} Total
              </div>
              <div className={statBoxBlue}>
                <Users className="w-4 h-4 text-blue-700" />
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
