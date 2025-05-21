
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

const statusChartConfig = {
  pending: { label: "Pending", color: "hsl(var(--chart-3))", icon: Clock },
  accepted: { label: "Accepted", color: "hsl(var(--chart-1))", icon: CheckCircle },
  rejected: { label: "Rejected", color: "hsl(var(--chart-5))", icon: XCircle },
} satisfies ChartConfig;

const campusChartConfig = {
  campus: { label: "Campus", color: "hsl(var(--chart-2))", icon: Landmark },
  offCampus: { label: "Off-Campus", color: "hsl(var(--chart-4))", icon: Building },
  notSpecified: { label: "Not Specified", color: "hsl(var(--muted))", icon: FileTextIcon },
} satisfies ChartConfig;


export default function AdminDashboardPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [processingSubmissionId, setProcessingSubmissionId] = useState<string | null>(null);

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
    setProcessingSubmissionId(submissionId);
    actionBeingProcessed = action; // Set for button spinner
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
      setProcessingSubmissionId(null);
      actionBeingProcessed = null; // Reset for button spinner
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
    <Card className="shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${colorClass}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
        {description && <p className="text-xs text-muted-foreground pt-1">{description}</p>}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Submissions" value={kpiData.total} Icon={FileTextIcon} description="All applications received." colorClass="text-primary" />
        <KpiCard title="Pending Review" value={kpiData.pending} Icon={Clock} description="Applications awaiting action."  colorClass="text-yellow-500"/>
        <KpiCard title="Accepted" value={kpiData.accepted} Icon={CheckCircle} description="Successfully accepted applications." colorClass="text-green-500" />
        <KpiCard title="Rejected" value={kpiData.rejected} Icon={XCircle} description="Applications not moved forward." colorClass="text-red-500" />
      </div>

      {/* Charts Section */}
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

      {/* Submissions Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <FileTextIcon className="mr-3 h-7 w-7 text-primary" />
            Application Submissions
          </CardTitle>
          <CardDescription>
            View and manage applications. Temporary credentials for accepted users are shown below.
            <br />
            <span className="text-xs text-muted-foreground">
              Email notifications are sent via Resend (API key required if configured).
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && submissions.length === 0 ? ( 
            <div className="flex items-center justify-center py-10">
              <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
              <span className="text-muted-foreground">Loading submissions...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-10 text-destructive">
              <AlertCircle className="mr-2 h-8 w-8" />
              <p className="font-semibold">Error loading data</p>
              <p className="text-sm">{error}</p>
              <Button onClick={fetchSubmissions} variant="outline" className="mt-4">Try Again</Button>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-10">
              <FileTextIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No submissions yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Idea</TableHead>
                    <TableHead>Campus Status</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">{submission.name}</TableCell>
                      <TableCell>{submission.email}</TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={submission.idea}>
                          {submission.idea}
                        </div>
                        {submission.status === 'accepted' && submission.temporaryUserId && (
                          <div className="mt-1 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1"><UserCircle size={12}/> User ID: {submission.temporaryUserId}</div>
                              <div className="flex items-center gap-1"><KeyRound size={12}/> Pass: {submission.temporaryPassword}</div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {submission.campusStatus ? (
                           <Badge 
                            variant={submission.campusStatus === 'campus' ? 'default' : 'secondary'} 
                            className={submission.campusStatus === 'campus' ? 'bg-blue-500/20 text-blue-700 border-blue-500' : 'bg-purple-500/20 text-purple-700 border-purple-500'}
                           >
                            {submission.campusStatus === 'campus' ? 'Campus' : 'Off-Campus'}
                           </Badge>
                        ) : <span className="text-xs text-muted-foreground">N/A</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(submission.status)} className="capitalize">
                          {submission.status}
                        </Badge>
                        {submission.processedByAdminAt && (
                           <div className="text-xs text-muted-foreground mt-1">({formatDate(submission.processedByAdminAt)})</div>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(submission.submittedAt)}</TableCell>
                      <TableCell className="text-right space-x-2">
                        {submission.status === 'pending' ? (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleProcessApplication(submission.id, 'accept', submission.name, submission.email)}
                              disabled={processingSubmissionId === submission.id}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              {processingSubmissionId === submission.id && actionBeingProcessed === 'accept' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsUp className="h-4 w-4" />}
                              <span className="ml-1 hidden sm:inline">Accept</span>
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleProcessApplication(submission.id, 'reject', submission.name, submission.email)}
                              disabled={processingSubmissionId === submission.id}
                            >
                              {processingSubmissionId === submission.id && actionBeingProcessed === 'reject' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsDown className="h-4 w-4" />}
                               <span className="ml-1 hidden sm:inline">Reject</span>
                            </Button>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">Processed</span>
                        )}
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

// Helper state for button spinner
let actionBeingProcessed: 'accept' | 'reject' | null = null;

// Update handleProcessApplication to set actionBeingProcessed
// This is a bit of a workaround for functional components.
// Ideally, this state (actionBeingProcessed) would be part of the component's state
// if we were to refactor how it's used with the handleProcessApplication function.
// For now, we are modifying the function attached to the default export.
const originalHandleProcessApplication = (AdminDashboardPage as any).prototype?.handleProcessApplication;

if (originalHandleProcessApplication) {
  (AdminDashboardPage as any).prototype.handleProcessApplication = async function(this: any, submissionId: string, action: 'accept' | 'reject', applicantName: string, applicantEmail: string) {
    actionBeingProcessed = action;
    await originalHandleProcessApplication.call(this, submissionId, action, applicantName, applicantEmail);
    actionBeingProcessed = null;
  };
} else {
  // Fallback if prototype or original function is not found, to prevent crashes.
  // This might happen if the component structure changes significantly.
  // We still want the AdminDashboardPage to render.
  console.warn("Could not find originalHandleProcessApplication on AdminDashboardPage prototype. Button spinner logic might be affected.");
}
