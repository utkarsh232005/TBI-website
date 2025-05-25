// src/app/admin/dashboard/page.tsx
"use client"; 

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, Loader2, ThumbsUp, ThumbsDown, KeyRound, UserCircle, FileTextIcon, 
  Users, CheckCircle, XCircle, Clock, Landmark, Building 
} from "lucide-react";
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { processApplicationAction } from '@/app/actions/admin-actions';

import { Bar, BarChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, Cell as RechartsCell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

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


export default function AdminDashboardPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [processingActionState, setProcessingActionState] = useState<ProcessingActionState | null>(null);

  const [statusChartData, setStatusChartData] = useState<ChartDataItem[]>([]);
  const [campusChartData, setCampusChartData] = useState<ChartDataItem[]>([]);
  const [kpiData, setKpiData] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
  });

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
      case 'accepted':
        return 'default'; 
      case 'rejected':
        return 'destructive';
      case 'pending':
      default:
        return 'secondary'; 
    }
  };

  const KpiCard = ({ title, value, Icon, description, colorClass = "text-primary" }: { title: string, value: number | string, Icon: React.ElementType, description?: string, colorClass?: string }) => (
    <Card className="shadow-lg hover:shadow-primary/20 transition-all duration-300 bg-[#1A1A1A] border-[#2A2A2A] hover:translate-y-[-2px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-[#1A1A1A]">
        <CardTitle className="text-sm font-medium text-[#9CA3AF]">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${colorClass}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
        {description && <p className="text-xs text-[#9CA3AF] pt-1">{description}</p>}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8 relative">
      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 relative">
        <Card className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] border-[#2A2A2A] shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#9CA3AF] text-sm font-medium mb-1">Total Submissions</p>
                <h3 className="text-3xl font-bold text-[#E0E0E0]">{kpiData.total}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-[#4F46E5]/10 flex items-center justify-center">
                <FileTextIcon className="h-6 w-6 text-[#4F46E5]" />
              </div>
            </div>
            <p className="text-[#9CA3AF] text-sm mt-4">All applications received</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] border-[#2A2A2A] shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#9CA3AF] text-sm font-medium mb-1">Pending Review</p>
                <h3 className="text-3xl font-bold text-[#E0E0E0]">{kpiData.pending}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
            </div>
            <p className="text-[#9CA3AF] text-sm mt-4">Applications awaiting action</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] border-[#2A2A2A] shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#9CA3AF] text-sm font-medium mb-1">Accepted</p>
                <h3 className="text-3xl font-bold text-[#E0E0E0]">{kpiData.accepted}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-teal-500/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-teal-500" />
              </div>
            </div>
            <p className="text-[#9CA3AF] text-sm mt-4">Successfully accepted applications</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] border-[#2A2A2A] shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#9CA3AF] text-sm font-medium mb-1">Rejected</p>
                <h3 className="text-3xl font-bold text-[#E0E0E0]">{kpiData.rejected}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-rose-500" />
              </div>
            </div>
            <p className="text-[#9CA3AF] text-sm mt-4">Applications not moved forward</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section - TEMPORARILY COMMENTED OUT FOR DIAGNOSIS */}
      {/*
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-primary" />
              Application Statuses
            </CardTitle>
            <CardDescription>Distribution of applications by current status.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {isLoading ? <Loader2 className="h-8 w-8 animate-spin mx-auto mt-10 text-primary" /> : statusChartData.length > 0 ? (
              <ChartContainer config={statusChartConfig} className="w-full h-full">
                <BarChart accessibilityLayer data={statusChartData} layout="vertical" margin={{ left: 10, right: 30}}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={10} width={80} />
                  <RechartsTooltip 
                    cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
                    content={<ChartTooltipContent hideLabel />} 
                  />
                  <Legend content={<ChartLegend content={ChartLegendContent} />} />
                  <Bar dataKey="value" radius={5}>
                    {statusChartData.map((entry) => (
                       <RechartsCell key={`cell-${entry.name}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : <p className="text-muted-foreground text-center mt-10">No data for status chart.</p>}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Landmark className="mr-2 h-5 w-5 text-primary" />
              Campus Status
            </CardTitle>
            <CardDescription>Distribution of applicants by campus affiliation.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
             {isLoading ? <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /> : campusChartData.some(d => d.value > 0) ? (
              <ChartContainer config={campusChartConfig} className="w-full h-full">
                <PieChart accessibilityLayer>
                   <RechartsTooltip 
                      cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
                      content={<ChartTooltipContent hideLabel />} 
                   />
                  <Legend content={<ChartLegend content={ChartLegendContent} nameKey="name" />} className="-translate-y-2" />
                  <Pie data={campusChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                     {campusChartData.map((entry) => (
                       <RechartsCell key={`cell-${entry.name}`} fill={entry.fill} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            ) : <p className="text-muted-foreground text-center">No data for campus status chart.</p>}
          </CardContent>
        </Card>
      </div>
      */}

      {/* Submissions Table */}
      <Card className="shadow-xl bg-[#121212] border-[#2A2A2A] overflow-hidden">
        <CardHeader className="bg-[#1A1A1A] border-b border-[#2A2A2A] p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold tracking-tight text-[#E0E0E0] flex items-center">
                <FileTextIcon className="mr-2 h-6 w-6 text-[#4F46E5]" />
                Recent Submissions
              </CardTitle>
              <CardDescription className="text-[#9CA3AF] mt-1">Latest applications submitted to the platform</CardDescription>
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
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-[#4F46E5]" />
              <span className="ml-2 text-[#9CA3AF]">Loading submissions...</span>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-10">
              <AlertCircle className="h-8 w-8 text-rose-500" />
              <span className="ml-2 text-[#9CA3AF]">{error}</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#1A1A1A] hover:bg-[#1A1A1A]">
                    <TableHead className="text-[#9CA3AF] font-medium">Name</TableHead>
                    <TableHead className="text-[#9CA3AF] font-medium">Email</TableHead>
                    <TableHead className="text-[#9CA3AF] font-medium">Company</TableHead>
                    <TableHead className="text-[#9CA3AF] font-medium">Status</TableHead>
                    <TableHead className="text-[#9CA3AF] font-medium">Submitted</TableHead>
                    <TableHead className="text-[#9CA3AF] font-medium text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission, index) => (
                    <TableRow 
                      key={submission.id} 
                      className={`border-b border-[#2A2A2A] hover:bg-[#2A2A2A]/20 transition-all duration-200 ${
                        index % 2 === 0 ? 'bg-[#121212]' : 'bg-[#1E1E1E]'
                      }`}
                    >
                      <TableCell className="font-medium text-[#E0E0E0]">{submission.name}</TableCell>
                      <TableCell className="text-[#9CA3AF]">{submission.email}</TableCell>
                      <TableCell className="text-[#9CA3AF]">{submission.companyName || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`px-3 py-1.5 rounded-full font-medium transition-all duration-200 ${
                            submission.status === 'pending' 
                              ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                              : submission.status === 'accepted'
                              ? 'bg-teal-500/10 text-teal-500 border-teal-500/20'
                              : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                          }`}
                        >
                          {submission.status === 'pending' && <Clock className="mr-1.5 h-3.5 w-3.5" />}
                          {submission.status === 'accepted' && <CheckCircle className="mr-1.5 h-3.5 w-3.5" />}
                          {submission.status === 'rejected' && <XCircle className="mr-1.5 h-3.5 w-3.5" />}
                          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                        </Badge>
                        {submission.processedByAdminAt && (
                          <div className="text-xs text-[#9CA3AF] mt-1">({formatDate(submission.processedByAdminAt)})</div>
                        )}
                      </TableCell>
                      <TableCell className="text-[#9CA3AF]">{formatDate(submission.submittedAt)}</TableCell>
                      <TableCell className="text-right space-x-2">
                        {submission.status === 'pending' ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleProcessApplication(submission.id, 'accept', submission.name, submission.email)}
                              disabled={processingActionState?.id === submission.id}
                              className="bg-teal-500/10 text-teal-500 border-teal-500/20 hover:bg-teal-500/20 hover:text-teal-400 transition-all duration-200"
                            >
                              {processingActionState?.id === submission.id && processingActionState?.type === 'accept' ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <ThumbsUp className="h-4 w-4" />
                              )}
                              <span className="ml-1 hidden sm:inline">Accept</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleProcessApplication(submission.id, 'reject', submission.name, submission.email)}
                              disabled={processingActionState?.id === submission.id}
                              className="bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20 hover:text-rose-400 transition-all duration-200"
                            >
                              {processingActionState?.id === submission.id && processingActionState?.type === 'reject' ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <ThumbsDown className="h-4 w-4" />
                              )}
                              <span className="ml-1 hidden sm:inline">Reject</span>
                            </Button>
                          </>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    