// src/app/admin/dashboard/page.tsx
"use client"; 

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, Loader2, ThumbsUp, ThumbsDown, KeyRound, UserCircle, FileTextIcon, 
  Users, CheckCircle, XCircle, Clock, Landmark, Building, CalendarIcon as Calendar, Settings
} from "lucide-react";
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { processApplicationAction } from '@/app/actions/admin-actions';

import { Bar, BarChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, Cell as RechartsCell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

// Custom UI components inspired by Aceternity UI
// We're creating our own version since we don't have direct access to the package
// Using the dark theme colors: #121212 (background), #1E1E1E (secondary), #4F46E5 (accent)

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

interface ChartDataItem {
  name: string;
  value: number;
  fill: string;
}

interface ProcessingActionState {
  id: string;
  type: 'accept' | 'reject';
}

const statusChartConfig = {
  pending: { label: "Pending", color: "#F59E0B", icon: Clock },
  accepted: { label: "Accepted", color: "#10B981", icon: CheckCircle },
  rejected: { label: "Rejected", color: "#EF4444", icon: XCircle },
} satisfies ChartConfig;

const campusChartConfig = {
  campus: { label: "Campus", color: "#3B82F6", icon: Landmark },
  offCampus: { label: "Off-Campus", color: "#8B5CF6", icon: Building },
  notSpecified: { label: "Not Specified", color: "#6B7280", icon: FileTextIcon },
} satisfies ChartConfig;

const AnimatedButton = ({ variant, children, onClick, disabled, className }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="inline-block"
    >
      <Button
        variant={variant}
        onClick={onClick}
        disabled={disabled}
        className={`shadow-lg transition-all ${className}`}
      >
        {children}
      </Button>
    </motion.div>
  );
};

const AnimatedBadge = ({ variant, children, className }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Badge
        variant={variant}
        className={`px-3 py-1 text-sm rounded-full shadow ${className}`}
      >
        {children}
      </Badge>
    </motion.div>
  );
};

// Helper functions for badge styling
// Helper function to get the badge variant based on status
const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'accepted':
      return "default" as const;
    case 'rejected':
      return "destructive" as const;
    case 'pending':
    default:
      return "secondary" as const;
  }
};

const getStatusBadgeStyle = (status: string): string => {
  switch (status) {
    case 'accepted':
      return "bg-teal-600 hover:bg-teal-700 text-white";
    case 'rejected':
      return "bg-rose-600 hover:bg-rose-700 text-white";
    case 'pending':
    default:
      return "bg-amber-600 hover:bg-amber-700 text-white";
  }
};

const getCampusStatusStyle = (status: string): string => {
  return status === 'campus' 
    ? "bg-blue-600 hover:bg-blue-700 text-white" 
    : "bg-purple-600 hover:bg-purple-700 text-white";
};

export default function AdminDashboardPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusChartData, setStatusChartData] = useState<ChartDataItem[]>([]);
  const [campusChartData, setCampusChartData] = useState<ChartDataItem[]>([]);
  const [processingActionState, setProcessingActionState] = useState<ProcessingActionState | null>(null);
  const { toast } = useToast();

  // KPI data for the dashboard
  const [kpiData, setKpiData] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
  });
  
  // Dashboard page title effect
  useEffect(() => {
    document.title = "TBI Admin - Dashboard";
  }, []);

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
          status: data.status || "pending",
          temporaryUserId: data.temporaryUserId,
          temporaryPassword: data.temporaryPassword,
          processedByAdminAt: data.processedByAdminAt instanceof Timestamp ? data.processedByAdminAt.toDate() : (data.processedByAdminAt ? new Date(data.processedByAdminAt) : undefined),
        });
      });
      setSubmissions(fetchedSubmissions);
      processChartData(fetchedSubmissions);
    } catch (err: any) {
      console.error("Error fetching submissions: ", err);
      setError("Failed to load submissions. Please check console or Firestore permissions.");
    } finally {
      setIsLoading(false);
    }
  };

  const processChartData = (data: Submission[]) => {
    const statusCounts = { pending: 0, accepted: 0, rejected: 0 };
    const campusCounts = { campus: 0, offCampus: 0, notSpecified: 0 };

    data.forEach(sub => {
      statusCounts[sub.status]++;
      if (sub.campusStatus === 'campus') campusCounts.campus++;
      else if (sub.campusStatus === 'off-campus') campusCounts.offCampus++;
      else campusCounts.notSpecified++;
    });

    setStatusChartData([
      { name: "Pending", value: statusCounts.pending, fill: statusChartConfig.pending.color },
      { name: "Accepted", value: statusCounts.accepted, fill: statusChartConfig.accepted.color },
      { name: "Rejected", value: statusCounts.rejected, fill: statusChartConfig.rejected.color },
    ]);

    setCampusChartData([
      { name: "Campus", value: campusCounts.campus, fill: campusChartConfig.campus.color },
      { name: "Off-Campus", value: campusCounts.offCampus, fill: campusChartConfig.offCampus.color },
      { name: "Not Specified", value: campusCounts.notSpecified, fill: campusChartConfig.notSpecified.color },
    ]);
    
    setKpiData({
      total: data.length,
      pending: statusCounts.pending,
      accepted: statusCounts.accepted,
      rejected: statusCounts.rejected,
    });
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
    setProcessingActionState({ id: submissionId, type: action });
    try {
      const result = await processApplicationAction(submissionId, action, applicantName, applicantEmail);
      if (result.status === 'success') {
        toast({
          title: `Application ${action === 'accept' ? 'Accepted' : 'Rejected'}`,
          description: result.message,
        });
        fetchSubmissions(); 
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
      setProcessingActionState(null);
    }
  };

  const getStatusBadgeVariant = (status: Submission['status']) => {
    switch (status) {
      case 'pending':
        return 'outline';
      case 'accepted':
        return 'outline';
      case 'rejected':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusBadgeStyle = (status: Submission['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'accepted':
        return 'bg-teal-500/10 text-teal-500 border-teal-500/20';
      case 'rejected':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default:
        return '';
    }
  };

  const getCampusStatusStyle = (status: Submission['campusStatus']) => {
    switch (status) {
      case 'campus':
        return 'bg-indigo-500/20 text-indigo-400 border-indigo-500';
      case 'off-campus':
        return 'bg-purple-500/20 text-purple-400 border-purple-500';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500';
    }
  };

  const KpiCard = ({ title, value, Icon, description, colorClass = "text-[#4F46E5]" }: { title: string, value: number | string, Icon: React.ElementType, description?: string, colorClass?: string }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="h-full"
        whileHover={{ scale: 1.02, y: -5 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card className="bg-[#151515] border-0 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3),_0_8px_10px_-6px_rgba(0,0,0,0.3),_0_-2px_0_0_rgba(255,255,255,0.05)_inset] rounded-2xl overflow-hidden h-full transition-all duration-300 hover:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.4),_0_10px_15px_-3px_rgba(0,0,0,0.3),_0_-2px_0_0_rgba(255,255,255,0.1)_inset,_0_0_10px_rgba(79,70,229,0.2)]">
          <CardHeader className="pb-2 pt-6 px-6">
            <CardTitle className="text-[#E0E0E0] text-lg font-semibold flex items-center gap-2">
              <motion.div 
                className={`p-2 rounded-xl ${colorClass.replace('text-', 'bg-')}/10 flex items-center justify-center`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, repeatType: "reverse", duration: 2 }}
              >
                <Icon className={`h-5 w-5 ${colorClass}`} />
              </motion.div>
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <motion.div 
              className="text-4xl font-bold text-[#E0E0E0] mb-2 font-orbitron tracking-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <CountUp start={0} end={Number(value) || 0} duration={2} separator="," />
            </motion.div>
            {description && (
              <motion.p 
                className="text-sm text-[#9CA3AF] mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                {description}
              </motion.p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6">
      {/* Analytics Section */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
      >
        <KpiCard title="Total Applications" value={kpiData.total} Icon={FileTextIcon} colorClass="text-[#4F46E5]" description="All submissions received" />
        <KpiCard title="Pending Review" value={kpiData.pending} Icon={Clock} colorClass="text-amber-500" description="Awaiting your decision" />
        <KpiCard title="Accepted" value={kpiData.accepted} Icon={CheckCircle} colorClass="text-teal-500" description="Approved applications" />
        <KpiCard title="Rejected" value={kpiData.rejected} Icon={XCircle} colorClass="text-rose-500" description="Declined applications" />
      </motion.div>

      {/* Applications Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Card className="border-0 shadow-xl overflow-hidden bg-transparent rounded-2xl">
          <CardHeader className="bg-[#1A1A1A] border-b border-[#2A2A2A] p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-[#E0E0E0] text-2xl font-bold tracking-tight font-orbitron">APPLICATION SUBMISSIONS</CardTitle>
                <CardDescription className="text-[#9CA3AF] mt-1">Review and process applications</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 px-4 py-1.5 rounded-full shadow-inner">
                  <Clock className="mr-1.5 h-3.5 w-3.5" /> Pending: {kpiData.pending}
                </Badge>
                <Badge variant="outline" className="bg-teal-500/10 text-teal-500 border-teal-500/20 px-4 py-1.5 rounded-full shadow-inner">
                  <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Accepted: {kpiData.accepted}
                </Badge>
                <Badge variant="outline" className="bg-rose-500/10 text-rose-500 border-rose-500/20 px-4 py-1.5 rounded-full shadow-inner">
                  <XCircle className="mr-1.5 h-3.5 w-3.5" /> Rejected: {kpiData.rejected}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="bg-[#121212] p-6 md:p-8">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 text-rose-400 bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl mb-6"
              >
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-500" />
                <div>
                  <h4 className="font-medium mb-1">Error Loading Data</h4>
                  <p className="text-sm text-rose-300">{error}</p>
                </div>
              </motion.div>
            )}

            {isLoading ? (
              <div className="flex flex-col justify-center items-center py-16 bg-[#151515] rounded-2xl border border-[#2A2A2A] shadow-inner">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#4F46E5] to-transparent opacity-20 blur-xl"></div>
                  <Loader2 className="h-12 w-12 animate-spin text-[#4F46E5] mx-auto mb-4 relative z-10" />
                </div>
                <span className="text-[#E0E0E0] font-medium mt-3">Loading submissions...</span>
                <span className="text-[#9CA3AF] text-sm mt-2">Fetching the latest application data</span>
              </div>
            ) : error ? (
              <div className="text-rose-500 flex flex-col items-center py-16 bg-[#151515] rounded-2xl border border-[#2A2A2A] shadow-inner">
                <AlertCircle className="h-16 w-16 mb-4 text-rose-500 opacity-80" />
                <p className="font-semibold text-xl mb-1">Error loading submissions</p>
                <p className="text-sm text-center text-[#9CA3AF] max-w-md mx-auto mt-2">{error}</p>
                <Button onClick={fetchSubmissions} variant="outline" className="mt-6 border-[#2A2A2A] text-[#E0E0E0] hover:bg-[#252525] rounded-xl px-8 py-2.5 shadow-sm hover:shadow-md transition-all">
                  <Loader2 className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-16 bg-[#151515] rounded-2xl border border-[#2A2A2A] shadow-inner">
                <FileTextIcon className="h-16 w-16 text-[#4F46E5] opacity-60 mx-auto mb-4" />
                <p className="text-[#E0E0E0] text-lg font-medium mb-2">No Applications Found</p>
                <p className="text-[#9CA3AF] max-w-md mx-auto">There are currently no applications submitted to review.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-[#2A2A2A] shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
                <div className="overflow-x-auto">
                  <Table className="w-full border-collapse">
                    <TableHeader className="bg-[#1A1A1A]">
                      <TableRow>
                        <TableHead className="py-5 px-6 text-[#E0E0E0] uppercase tracking-wider text-xs font-bold border-b border-[#2A2A2A]">
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="flex items-center gap-2"
                          >
                            <UserCircle className="h-4 w-4 text-[#4F46E5]" /> Applicant
                          </motion.div>
                        </TableHead>
                        <TableHead className="py-5 px-6 text-[#E0E0E0] uppercase tracking-wider text-xs font-bold border-b border-[#2A2A2A]">
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            className="flex items-center gap-2"
                          >
                            <FileTextIcon className="h-4 w-4 text-[#4F46E5]" /> Idea
                          </motion.div>
                        </TableHead>
                        <TableHead className="py-5 px-6 text-[#E0E0E0] uppercase tracking-wider text-xs font-bold border-b border-[#2A2A2A]">
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.3 }}
                            className="flex items-center gap-2"
                          >
                            <Building className="h-4 w-4 text-[#4F46E5]" /> Campus Status
                          </motion.div>
                        </TableHead>
                        <TableHead className="py-5 px-6 text-[#E0E0E0] uppercase tracking-wider text-xs font-bold border-b border-[#2A2A2A]">
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.4 }}
                            className="flex items-center gap-2"
                          >
                            <Clock className="h-4 w-4 text-[#4F46E5]" /> Review Status
                          </motion.div>
                        </TableHead>
                        <TableHead className="py-5 px-6 text-[#E0E0E0] uppercase tracking-wider text-xs font-bold border-b border-[#2A2A2A]">
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.5 }}
                            className="flex items-center gap-2"
                          >
                            <Calendar className="h-4 w-4 text-[#4F46E5]" /> Submitted At
                          </motion.div>
                        </TableHead>
                        <TableHead className="py-5 px-6 text-[#E0E0E0] uppercase tracking-wider text-xs font-bold border-b border-[#2A2A2A] text-right">
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.6 }}
                            className="flex items-center justify-end gap-2"
                          >
                            <Settings className="h-4 w-4 text-[#4F46E5]" /> Actions
                          </motion.div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.map((submission, index) => (
                        <motion.tr 
                          key={submission.id} 
                          className={`${index % 2 === 0 ? 'bg-[#121212]' : 'bg-[#1E1E1E]'} hover:bg-[#252525] transition-all duration-300`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 * index }}
                          whileHover={{ scale: 1.01, x: 5 }}
                        >
                          <TableCell className="py-5 px-6 border-b border-[#2A2A2A]">
                            <div className="flex flex-col">
                              <div className="font-medium text-[#E0E0E0]">{submission.name}</div>
                              <div className="text-xs text-[#9CA3AF] mt-1">{submission.email}</div>
                            </div>
                          </TableCell>
                        <TableCell className="py-5 px-6 border-b border-[#2A2A2A] text-[#E0E0E0]">
                          <div className="max-w-xs truncate" title={submission.idea}>
                            {submission.idea}
                          </div>
                          {submission.status === 'accepted' && submission.temporaryUserId && (
                            <div className="mt-3 p-3 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A]/80 text-xs text-[#9CA3AF] shadow-inner">
                              <div className="flex items-center gap-2 mb-2"><UserCircle size={14} className="text-[#4F46E5]"/> User ID: <span className="font-mono text-[#E0E0E0] bg-[#252525] px-2 py-1 rounded">{submission.temporaryUserId}</span></div>
                              <div className="flex items-center gap-2"><KeyRound size={14} className="text-[#4F46E5]"/> Password: <span className="font-mono text-[#E0E0E0] bg-[#252525] px-2 py-1 rounded">{submission.temporaryPassword}</span></div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="py-5 px-6 border-b border-[#2A2A2A]">
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                          >
                            {submission.campusStatus ? (
                              <Badge
                                variant="outline"
                                className={`px-4 py-1.5 text-sm rounded-full shadow-inner ${getCampusStatusStyle(submission.campusStatus)} transition-all duration-300 hover:scale-105 hover:shadow-md`}
                              >
                                {submission.campusStatus === 'campus' ? (
                                  <motion.span className="flex items-center">
                                    <Landmark className="mr-1.5 h-3.5 w-3.5" />
                                    Campus
                                  </motion.span>
                                ) : (
                                  <motion.span className="flex items-center">
                                    <Building className="mr-1.5 h-3.5 w-3.5" />
                                    Off-Campus
                                  </motion.span>
                                )}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-gray-500/20 text-gray-400 border-gray-500 px-4 py-1.5 text-sm rounded-full shadow-inner transition-all duration-300 hover:scale-105 hover:shadow-md">
                                <motion.span className="flex items-center">
                                  <FileTextIcon className="mr-1.5 h-3.5 w-3.5" />
                                  Not Specified
                                </motion.span>
                              </Badge>
                            )}
                          </motion.div>
                        </TableCell>
                        <TableCell className="py-5 px-6 border-b border-[#2A2A2A]">
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.3 }}
                            whileHover={{ scale: 1.05 }}
                          >
                            <Badge variant="outline" className={`px-4 py-1.5 text-sm rounded-full shadow-inner ${getStatusBadgeStyle(submission.status)} transition-all duration-300 hover:shadow-md`}>
                              <motion.span className="flex items-center">
                                {submission.status === 'pending' && <Clock className="mr-1.5 h-3.5 w-3.5" />}
                                {submission.status === 'accepted' && <CheckCircle className="mr-1.5 h-3.5 w-3.5" />}
                                {submission.status === 'rejected' && <XCircle className="mr-1.5 h-3.5 w-3.5" />}
                                {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                              </motion.span>
                            </Badge>
                          </motion.div>
                        </TableCell>
                        <TableCell className="py-5 px-6 border-b border-[#2A2A2A]">
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.4 }}
                            className="flex items-center"
                          >
                            <Calendar className="h-4 w-4 mr-2 text-[#4F46E5]" />
                            <span className="text-[#E0E0E0] font-medium">{formatDate(submission.submittedAt)}</span>
                          </motion.div>
                        </TableCell>
                        <TableCell className="py-5 px-6 border-b border-[#2A2A2A] text-right">
                          {submission.status === 'pending' ? (
                            <motion.div 
                              className="flex justify-end items-center gap-2"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, delay: 0.5 }}
                            >
                              <Button
                                variant="outline"
                                onClick={() => handleProcessApplication(submission.id, 'accept', submission.name, submission.email)}
                                disabled={processingActionState?.id === submission.id}
                                className="border-teal-500 text-teal-500 hover:bg-teal-500/10 rounded-xl px-4 py-2 text-sm font-medium shadow-sm transform transition-all duration-300 hover:scale-105 hover:shadow-md"
                              >
                                {processingActionState?.id === submission.id && processingActionState?.type === 'accept' ?
                                  <Loader2 className="h-4 w-4 animate-spin" /> :
                                  <>
                                    <ThumbsUp className="h-4 w-4 mr-1.5" />
                                    Accept
                                  </>
                                }
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => handleProcessApplication(submission.id, 'reject', submission.name, submission.email)}
                                disabled={processingActionState?.id === submission.id}
                                className="border-rose-500 text-rose-500 hover:bg-rose-500/10 rounded-xl px-4 py-2 text-sm font-medium shadow-sm transform transition-all duration-300 hover:scale-105 hover:shadow-md"
                              >
                                {processingActionState?.id === submission.id && processingActionState?.type === 'reject' ?
                                  <Loader2 className="h-4 w-4 animate-spin" /> :
                                  <>
                                    <ThumbsDown className="h-4 w-4 mr-1.5" />
                                    Reject
                                  </>
                                }
                              </Button>
                            </motion.div>
                          ) : (
                            <motion.span 
                              className="text-sm text-[#9CA3AF] italic font-medium bg-[#1A1A1A] px-3 py-1.5 rounded-full shadow-inner"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3, delay: 0.4 }}
                            >
                              Processed
                            </motion.span>
                          )}
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            )}
          </CardContent>
       const KpiCard = ({ title, value, Icon, description, colorClass = "text-[#4F46E5]" }: { title: string, value: number | string, Icon: React.ElementType, description?: string, colorClass?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.5 }}
      className="group"
    >
      <Card className="border-0 shadow-xl overflow-hidden bg-transparent rounded-2xl group-hover:shadow-2xl transition-all duration-300">
        <CardHeader className="bg-[#1A1A1A] border-b border-[#2A2A2A] p-6 relative overflow-hidden">
          <motion.div 
            className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-radial from-[#4F46E5]/5 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
          />
          <div className="flex items-center justify-between relative z-10">
            <CardTitle className="text-[#E0E0E0] text-lg font-bold tracking-tight">{title}</CardTitle>
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Icon className={`w-6 h-6 ${colorClass}`} />
            </motion.div>
                    className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-radial from-[#4F46E5]/10 to-transparent rounded-full blur-xl"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
                  />
                  <ChartContainer config={statusChartConfig}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          animationDuration={1500}
                          animationBegin={200}
                        >
                          {statusChartData.map((entry, index) => (
                            <RechartsCell key={`cell-${index}`} fill={entry.fill} stroke="#121212" strokeWidth={2} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} animationDuration={300} />
                        <ChartLegend content={<ChartLegendContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </motion.div>
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-[#151515] rounded-2xl border border-[#2A2A2A] shadow-inner">
                  <p className="text-[#9CA3AF]">No data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-xl overflow-hidden bg-transparent rounded-2xl">
          <CardHeader className="bg-[#1A1A1A] border-b border-[#2A2A2A] p-6">
            <CardTitle className="text-[#E0E0E0] text-xl font-bold tracking-tight">CAMPUS STATUS</CardTitle>
            <CardDescription className="text-[#9CA3AF] mt-1">Distribution of campus vs off-campus</CardDescription>
          </CardHeader>
          <CardContent className="bg-[#121212] p-6 md:p-8">
            <div className="h-[300px] w-full flex justify-center">
              {campusChartData.length > 0 ? (
                <motion.div 
                  className="w-full h-full bg-[#151515] rounded-2xl border border-[#2A2A2A] shadow-inner p-4 overflow-hidden relative"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  whileHover={{ boxShadow: "0 0 20px rgba(79, 70, 229, 0.2) inset" }}
                >
                  <motion.div
                    className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-radial from-[#8B5CF6]/10 to-transparent rounded-full blur-xl"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", delay: 1 }}
                  />
                  <ChartContainer config={campusChartConfig}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={campusChartData}>
                        <XAxis 
                          dataKey="name" 
                          tickLine={false} 
                          axisLine={false} 
                          stroke="#9CA3AF" 
                          fontSize={12} 
                          tickMargin={10} 
                        />
                        <YAxis 
                          tickLine={false} 
                          axisLine={false} 
                          stroke="#9CA3AF" 
                          fontSize={12} 
                        />
                        <ChartTooltip 
                          content={<ChartTooltipContent />} 
                          animationDuration={300} 
                          cursor={{ fill: 'rgba(79, 70, 229, 0.1)' }} 
                        />
                        <Bar 
                          dataKey="value" 
                          radius={[8, 8, 0, 0]} 
                          animationDuration={1500} 
                          animationBegin={300}
                        >
                          {campusChartData.map((entry, index) => (
                            <RechartsCell key={`cell-${index}`} fill={entry.fill} stroke="#121212" strokeWidth={1} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </motion.div>
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-[#151515] rounded-2xl border border-[#2A2A2A] shadow-inner">
                  <p className="text-[#9CA3AF]">No data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bottom Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-8 bg-gradient-to-r from-[#1A1A1A] to-[#1E1E1E] border border-[#2A2A2A] rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.3)]"
      >
        <div className="flex items-start gap-4">
          <div className="bg-[#4F46E5]/10 p-3 rounded-xl">
            <KeyRound className="h-6 w-6 text-[#4F46E5]" />
          </div>
          <div>
            <h3 className="text-[#E0E0E0] text-xl font-bold tracking-tight mb-2">Need Help Managing Applications?</h3>
            <p className="text-[#9CA3AF]">Check our admin guide for detailed instructions on processing applications efficiently.</p>
          </div>
        </div>
        <Button className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl px-8 py-2.5 shadow-[0_4px_15px_rgba(79,70,229,0.4)] transform transition-all duration-200 hover:scale-105 hover:shadow-[0_6px_20px_rgba(79,70,229,0.6)] font-medium whitespace-nowrap">
          View Admin Guide
        </Button>
      </motion.div>
    </div>
  );
}

    