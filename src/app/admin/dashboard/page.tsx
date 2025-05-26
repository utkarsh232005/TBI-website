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
    <div className={`group relative p-6 bg-neutral-900/50 backdrop-blur-sm rounded-2xl border border-neutral-800/50 hover:border-indigo-500/30 transition-all duration-300 overflow-hidden ${className} hover:shadow-lg hover:shadow-indigo-500/5`}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${iconBg || 'bg-indigo-500/10'} group-hover:bg-opacity-80 transition-all duration-300`}>
            <Icon className={`h-5 w-5 ${valueColor || 'text-indigo-400'} group-hover:scale-110 transition-transform`} />
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-neutral-800/50 text-neutral-400">
            +2.5%
          </span>
        </div>
        <div className="mt-2">
          <p className="text-sm font-medium text-neutral-400">{title}</p>
          <p className={`mt-1 text-2xl font-bold ${valueColor || 'text-white'}`}>
            {value}
          </p>
          {description && (
            <p className="mt-1.5 text-xs text-neutral-500 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-600 mr-1.5"></span>
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  // Custom card components for each KPI with specific styling
  const TotalCard = () => (
    <KpiCard 
      title="Total" 
      value={kpiData.total} 
      Icon={FileTextIcon} 
      description="All received"
      iconBg="bg-blue-500/10"
      valueColor="text-blue-400"
      className="hover:border-blue-500/30 hover:shadow-blue-500/5"
    />
  );

  const PendingCard = () => (
    <KpiCard 
      title="Pending" 
      value={kpiData.pending} 
      Icon={Clock} 
      description="Awaiting review"
      iconBg="bg-amber-500/10"
      valueColor="text-amber-400"
      className="hover:border-amber-500/30 hover:shadow-amber-500/5"
    />
  );

  const AcceptedCard = () => (
    <KpiCard 
      title="Accepted" 
      value={kpiData.accepted} 
      Icon={CheckCircle} 
      description="Approved"
      iconBg="bg-teal-500/10"
      valueColor="text-teal-400"
      className="hover:border-teal-500/30 hover:shadow-teal-500/5"
    />
  );

  const RejectedCard = () => (
    <KpiCard 
      title="Rejected" 
      value={kpiData.rejected} 
      Icon={XCircle} 
      description="Denied"
      iconBg="bg-rose-500/10"
      valueColor="text-rose-400"
      className="hover:border-rose-500/30 hover:shadow-rose-500/5"
    />
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <TotalCard />
        <PendingCard />
        <AcceptedCard />
        <RejectedCard />
      </div>
      <div className="rounded-2xl bg-neutral-900/50 border border-neutral-800/50 overflow-hidden">
        <div className="p-6 flex flex-col sm:flex-row sm:justify-between items-start sm:items-center">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center"><FileTextIcon className="mr-2"/>Submissions</h2>
            <p className="text-sm text-neutral-400">Review applications</p>
          </div>
          <Button onClick={fetchSubmissions} disabled={isLoading} variant="outline" size="sm" className="mt-4 sm:mt-0">
            {isLoading ? <Loader2 className="animate-spin mr-2"/> : <RefreshCw className="mr-2"/>}Refresh
          </Button>
        </div>
        <div className="p-6">
          {isLoading && submissions.length === 0 ? (
            <div className="flex justify-center items-center py-10 bg-neutral-900/30 rounded-xl">
              <Loader2 className="animate-spin mr-3"/><span className="text-neutral-300">Loading...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-10 bg-rose-900/10 border border-rose-900/30 rounded-xl">
              <AlertCircle className="text-rose-400 mb-2"/><p className="text-rose-300">{error}</p>
              <Button onClick={fetchSubmissions} variant="outline" className="mt-4">Retry</Button>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-10 bg-neutral-900/30 border-dashed border-neutral-700/50 border rounded-xl">
              <FileTextIcon className="mx-auto mb-2"/><p className="text-neutral-400">No submissions</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-neutral-800/30">
                  <tr>
                    <th className="px-4 py-2 text-xs text-neutral-400">Name</th>
                    <th className="px-4 py-2 text-xs text-neutral-400">Email</th>
                    <th className="px-4 py-2 text-xs text-neutral-400">Idea</th>
                    <th className="px-4 py-2 text-xs text-neutral-400">Campus</th>
                    <th className="px-4 py-2 text-xs text-neutral-400">Status</th>
                    <th className="px-4 py-2 text-xs text-neutral-400">Submitted</th>
                    <th className="px-4 py-2 text-xs text-neutral-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/50">
                  {submissions.map(sub => (
                    <tr key={sub.id} className="hover:bg-neutral-800/20">
                      <td className="px-4 py-2 text-sm text-white">{sub.name}</td>
                      <td className="px-4 py-2 text-sm text-neutral-300">{sub.email}</td>
                      <td className="px-4 py-2 max-w-xs truncate text-neutral-300">
                        {sub.idea}
                        {sub.status === 'accepted' && sub.temporaryUserId && (
                          <div className="mt-1 text-xs text-neutral-400">
                            <div className="flex items-center gap-1"><UserCircle className="h-3 w-3"/><span>ID: {sub.temporaryUserId}</span></div>
                            <div className="flex items-center gap-1"><KeyRound className="h-3 w-3"/><span>Pass: {sub.temporaryPassword}</span></div>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {sub.campusStatus ? (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${sub.campusStatus === 'campus' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>{sub.campusStatus === 'campus' ? 'Campus' : 'Off-Campus'}</span>
                        ) : <span className="text-xs text-neutral-500">N/A</span>}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getBadgeClasses(sub.status)}`}>{sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}</span>
                          {sub.processedByAdminAt && <span className="text-xs text-neutral-500">{formatDate(sub.processedByAdminAt)}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-sm text-neutral-400 whitespace-nowrap">{formatDate(sub.submittedAt)}</td>
                      <td className="px-4 py-2 text-right text-sm font-medium">
                        {sub.status === 'pending' ? (
                          <div className="flex items-center justify-end space-x-3">
                            <button
                              onClick={() => handleProcess(sub.id, 'accept', sub.name, sub.email)}
                              disabled={processingActionState?.id === sub.id}
                              className={`group relative inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 overflow-hidden ${
                                processingActionState?.id === sub.id && processingActionState?.type === 'accept' 
                                  ? 'bg-teal-600/90 cursor-wait' 
                                  : 'bg-teal-600/10 hover:bg-teal-600/20 border border-teal-500/30 hover:border-teal-500/50 text-teal-400 hover:text-teal-300 shadow-sm hover:shadow-teal-500/20'
                              }`}
                            >
                              <span className={`absolute inset-0 bg-gradient-to-r from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity ${processingActionState?.id === sub.id ? 'opacity-100' : ''}`}></span>
                              <span className="relative flex items-center">
                                {processingActionState?.id === sub.id && processingActionState?.type === 'accept' ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                  <ThumbsUp className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                                )}
                                <span className="font-medium">Accept</span>
                              </span>
                            </button>
                            <button
                              onClick={() => handleProcess(sub.id, 'reject', sub.name, sub.email)}
                              disabled={processingActionState?.id === sub.id}
                              className={`group relative inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 overflow-hidden ${
                                processingActionState?.id === sub.id && processingActionState?.type === 'reject'
                                  ? 'bg-rose-600/90 cursor-wait'
                                  : 'bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/30 hover:border-rose-500/50 text-rose-400 hover:text-rose-300 shadow-sm hover:shadow-rose-500/20'
                              }`}
                            >
                              <span className={`absolute inset-0 bg-gradient-to-r from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity ${processingActionState?.id === sub.id ? 'opacity-100' : ''}`}></span>
                              <span className="relative flex items-center">
                                {processingActionState?.id === sub.id && processingActionState?.type === 'reject' ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                  <ThumbsDown className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                                )}
                                <span className="font-medium">Reject</span>
                              </span>
                            </button>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-neutral-800/50 text-neutral-400 border border-neutral-700/50">
                            {sub.status === 'accepted' ? (
                              <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-teal-400" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5 mr-1.5 text-rose-400" />
                            )}
                            {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
