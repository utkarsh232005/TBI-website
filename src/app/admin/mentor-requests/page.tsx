// src/app/admin/mentor-requests/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusCard } from "@/components/ui/status-card";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  Loader2,
  RefreshCw,
  User,
  Mail,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { 
  getAdminMentorRequests, 
  processAdminMentorRequest 
} from '@/app/actions/mentor-request-actions';
import type { MentorRequest } from '@/types/mentor-request';
import { format } from 'date-fns';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  admin_approved: 'bg-blue-100 text-blue-800',
  admin_rejected: 'bg-red-100 text-red-800',
  mentor_approved: 'bg-green-100 text-green-800',
  mentor_rejected: 'bg-gray-100 text-gray-800',
};

const statusLabels = {
  pending: 'Pending Review',
  admin_approved: 'Forwarded to Mentor',
  admin_rejected: 'Rejected by Admin',
  mentor_approved: 'Approved by Mentor',
  mentor_rejected: 'Declined by Mentor',
};

export default function AdminMentorRequestsPage() {
  const [requests, setRequests] = useState<MentorRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<MentorRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [notes, setNotes] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedRequests = await getAdminMentorRequests();
      setRequests(fetchedRequests);
    } catch (error: any) {
      console.error('Error fetching mentor requests:', error);
      const errorMessage = error.code === 'permission-denied' 
        ? "Permission denied: Check Firestore rules for mentorRequests collection"
        : error.code === 'failed-precondition'
        ? "Collection not found or index missing. The mentorRequests collection may need to be initialized."
        : "Failed to fetch mentor requests";
      
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = (request: MentorRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setActionType(action);
    setNotes('');
    setIsDialogOpen(true);
  };

  const confirmAction = () => {
    setIsDialogOpen(false);
    setIsConfirmDialogOpen(true);
  };

  const processRequest = async () => {
    if (!selectedRequest || !actionType) return;

    setProcessingRequestId(selectedRequest.id);
    setIsConfirmDialogOpen(false);

    try {
      const result = await processAdminMentorRequest('admin_123', {
        requestId: selectedRequest.id,
        action: actionType,
        notes: notes,
      });

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        await fetchRequests(); // Refresh the list
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process request",
        variant: "destructive",
      });
    } finally {
      setProcessingRequestId(null);
      setSelectedRequest(null);
      setActionType(null);
      setNotes('');
    }
  };

  const closeDialogs = () => {
    setIsDialogOpen(false);
    setIsConfirmDialogOpen(false);
    setSelectedRequest(null);
    setActionType(null);
    setNotes('');
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-96">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Unable to Load Requests</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchRequests} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full flex flex-col items-center py-10 px-2">
      <div className="w-full max-w-6xl mx-auto space-y-8">
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
          <div className="px-8 pt-8 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Mentor Requests</h1>
              <p className="text-sm text-gray-500">Review and process mentor selection requests from students</p>
            </div>
            <Button 
              onClick={fetchRequests}
              variant="outline"
              className="bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 focus:ring-2 focus:ring-blue-200 rounded-lg shadow-sm px-5 py-2 font-medium transition"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow border border-gray-100 p-6 flex flex-col items-center">
            <div className="bg-yellow-100 text-yellow-700 rounded-full w-10 h-10 flex items-center justify-center mb-2">
              <Clock className="h-5 w-5" />
            </div>
            <div className="text-xs font-semibold text-gray-500 mb-1">PENDING</div>
            <div className="text-2xl font-bold text-gray-900">{pendingRequests.length}</div>
            <div className="text-xs text-gray-400">Awaiting review</div>
          </div>
          <div className="bg-white rounded-xl shadow border border-gray-100 p-6 flex flex-col items-center">
            <div className="bg-green-100 text-green-700 rounded-full w-10 h-10 flex items-center justify-center mb-2">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div className="text-xs font-semibold text-gray-500 mb-1">APPROVED</div>
            <div className="text-2xl font-bold text-gray-900">{requests.filter(r => r.status === 'admin_approved' || r.status === 'mentor_approved').length}</div>
            <div className="text-xs text-gray-400">Applications</div>
          </div>
          <div className="bg-white rounded-xl shadow border border-gray-100 p-6 flex flex-col items-center">
            <div className="bg-red-100 text-red-700 rounded-full w-10 h-10 flex items-center justify-center mb-2">
              <XCircle className="h-5 w-5" />
            </div>
            <div className="text-xs font-semibold text-gray-500 mb-1">REJECTED</div>
            <div className="text-2xl font-bold text-gray-900">{requests.filter(r => r.status === 'admin_rejected' || r.status === 'mentor_rejected').length}</div>
            <div className="text-xs text-gray-400">Denied</div>
          </div>
          <div className="bg-white rounded-xl shadow border border-gray-100 p-6 flex flex-col items-center">
            <div className="bg-blue-100 text-blue-700 rounded-full w-10 h-10 flex items-center justify-center mb-2">
              <Users className="h-5 w-5" />
            </div>
            <div className="text-xs font-semibold text-gray-500 mb-1">TOTAL</div>
            <div className="text-2xl font-bold text-gray-900">{requests.length}</div>
            <div className="text-xs text-gray-400">All requests</div>
          </div>
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-xl w-12 h-12 flex items-center justify-center shadow-sm">
                <Clock className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Pending Review ({pendingRequests.length})
              </h2>
            </div>
            <div className="grid gap-5">
              {pendingRequests.map((request, index) => (
                <div key={request.id}>
                  <Card className="bg-white border border-yellow-100 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-5">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-14 w-14 ring-2 ring-yellow-100 shadow">
                            <AvatarFallback className="bg-yellow-200 text-yellow-700 text-lg font-bold">
                              {request.userName.split(' ').map(part => part[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">{request.userName}</h3>
                            <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5 mt-1">
                              <Mail className="h-3.5 w-3.5 text-yellow-600" />
                              {request.userEmail}
                            </p>
                            <p className="text-xs flex items-center gap-1.5 text-gray-400 mt-1">
                              <Calendar className="h-3.5 w-3.5 text-yellow-600" />
                              {request.createdAt && format(request.createdAt, 'PPP')}
                            </p>
                          </div>
                        </div>
                        <Badge className={`${statusColors[request.status]} shadow-sm px-3 py-1.5 rounded-full font-semibold text-xs`}>
                          {statusLabels[request.status]}
                        </Badge>
                      </div>

                    <div className="bg-yellow-50 p-5 rounded-lg mb-5 border border-yellow-100 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-lg w-8 h-8 flex items-center justify-center shadow-sm">
                          <Users className="h-4 w-4" />
                        </div>
                        <p className="font-semibold text-yellow-800">
                          Wants to connect with: <span className="font-bold text-yellow-900">{request.mentorName}</span>
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded border border-yellow-100">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 text-yellow-600 mt-1 flex-shrink-0" />
                          <p className="text-gray-700 italic">
                            "{request.requestMessage}"
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap sm:flex-nowrap gap-3">
                      <Button
                        onClick={() => handleAction(request, 'approve')}
                        disabled={processingRequestId === request.id}
                        className="bg-green-600 hover:bg-green-700 text-white border-0 transition-all duration-200 shadow-sm hover:shadow-md w-full sm:w-auto rounded-full"
                      >
                        {processingRequestId === request.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="mr-2 h-5 w-5" />
                        )}
                        Approve & Forward
                      </Button>
                      <Button
                        onClick={() => handleAction(request, 'reject')}
                        disabled={processingRequestId === request.id}
                        variant="outline"
                        className="border-red-200 hover:border-red-400 bg-white hover:bg-red-50 text-red-700 hover:text-red-800 transition-all duration-200 w-full sm:w-auto rounded-full"
                      >
                        <XCircle className="mr-2 h-5 w-5" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Processed Requests */}
        {processedRequests.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-blue-100 text-blue-700 border border-blue-200 rounded-xl w-12 h-12 flex items-center justify-center shadow-sm">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Processed Requests ({processedRequests.length})
              </h2>
            </div>
            <div className="grid gap-5">
              {processedRequests.map((request, index) => (
                <div key={request.id}>
                  <Card className="bg-white border border-blue-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-14 w-14 ring-2 ring-blue-100 shadow">
                            <AvatarFallback className={`bg-blue-200 text-blue-700 text-lg font-bold`}>
                              {request.userName.split(' ').map(part => part[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">{request.userName}</h3>
                            <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5 mt-1">
                              <span className="bg-blue-100 text-blue-600 w-5 h-5 rounded-full flex items-center justify-center text-xs shadow-sm">→</span>
                              {request.mentorName}
                            </p>
                            <p className="text-xs flex items-center gap-1.5 text-gray-400 mt-1">
                              <Calendar className="h-3 w-3 text-blue-500" />
                              {request.adminProcessedAt && format(request.adminProcessedAt, 'PPP')}
                            </p>
                          </div>
                        </div>
                        <Badge className={`${statusColors[request.status]} shadow-sm px-3 py-1.5 rounded-full font-medium text-xs`}>
                          {statusLabels[request.status]}
                        </Badge>
                      </div>
                      {request.adminNotes && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100 shadow-sm text-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="bg-blue-100 text-blue-700 border border-blue-200 rounded-lg w-7 h-7 flex items-center justify-center shadow-sm">
                              <MessageSquare className="h-4 w-4" />
                            </div>
                            <p className="font-semibold text-blue-800">Admin Notes:</p>
                          </div>
                          <p className="text-gray-700 pl-9">{request.adminNotes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}

        {requests.length === 0 && (
          <div className="text-center py-16 bg-white border border-blue-100 rounded-2xl shadow-md">
            <div className="bg-blue-100 text-blue-700 border border-blue-200 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Users className="h-12 w-12" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-3">No mentor requests yet</h3>
            <p className="text-lg text-gray-500 max-w-md mx-auto font-medium">
              Requests will appear here when students submit mentor selection requests.
            </p>
          </div>
        )}

        {/* Action Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={closeDialogs}>
          <DialogContent className="bg-white border border-gray-200 shadow-lg rounded-2xl max-w-lg">
            <DialogHeader>
              <DialogTitle className={`text-2xl font-bold ${actionType === 'approve' ? 'text-green-700' : 'text-red-700'} flex items-center gap-2`}>
                <div className={`${actionType === 'approve' 
                  ? 'bg-green-100 text-green-700 border-green-200' 
                  : 'bg-red-100 text-red-700 border-red-200'} 
                  border rounded-lg w-8 h-8 flex items-center justify-center shadow-sm`}>
                  {actionType === 'approve' 
                    ? <CheckCircle className="h-5 w-5" /> 
                    : <XCircle className="h-5 w-5" />}
                </div>
                {actionType === 'approve' ? 'Approve' : 'Reject'} Mentor Request
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {actionType === 'approve' 
                  ? 'This will forward the request to the mentor for final approval.'
                  : 'This will reject the request and notify the student.'
                }
              </DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-5">
                <div className={`p-5 rounded-lg ${actionType === 'approve' 
                  ? 'bg-green-50 border border-green-100' 
                  : 'bg-red-50 border border-red-100'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
                      <AvatarFallback className={`${actionType === 'approve' 
                        ? 'bg-green-200 text-green-700' 
                        : 'bg-red-200 text-red-700'} text-md font-bold`}>
                        {selectedRequest.userName.split(' ').map(part => part[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-gray-800">{selectedRequest.userName}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-gray-600">wants to connect with</span>
                        <span className="font-semibold text-gray-800">{selectedRequest.mentorName}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded border border-gray-100 mt-3">
                    <p className="text-gray-700 italic">"{selectedRequest.requestMessage}"</p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className={`h-4 w-4 ${actionType === 'approve' ? 'text-green-600' : 'text-red-600'}`} />
                    <label className="font-semibold text-gray-800">
                      {actionType === 'approve' ? 'Additional notes (optional)' : 'Rejection reason'}
                    </label>
                  </div>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={
                      actionType === 'approve' 
                        ? 'Any additional notes for the mentor...'
                        : 'Please provide a reason for rejection...'
                    }
                    className={`border ${actionType === 'approve' 
                      ? 'focus:border-green-300 focus:ring-green-200' 
                      : 'focus:border-red-300 focus:ring-red-200'} rounded-lg shadow-sm`}
                  />
                </div>
              </div>
            )}
            <DialogFooter className="gap-2 sm:gap-0 mt-2">
              <Button 
                variant="outline" 
                onClick={closeDialogs}
                className="border-gray-200 hover:bg-gray-100 text-gray-700 transition-colors w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmAction}
                className={`${actionType === 'approve'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'} 
                  border-0 transition-all duration-200 shadow-sm hover:shadow-md w-full sm:w-auto`}
              >
                {actionType === 'approve' ? 'Approve & Forward' : 'Reject Request'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirmation Dialog */}
        <AlertDialog open={isConfirmDialogOpen} onOpenChange={closeDialogs}>
          <AlertDialogContent className="bg-white border border-gray-200 shadow-lg rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold flex items-center gap-2">
                <div className="bg-yellow-100 text-yellow-700 border-yellow-200 border rounded-lg w-8 h-8 flex items-center justify-center shadow-sm">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                Confirm {actionType === 'approve' ? 'Approval' : 'Rejection'}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
                Are you sure you want to <span className={`font-medium ${actionType === 'approve' ? 'text-green-600' : 'text-red-600'}`}>{actionType}</span> this mentor request? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2 sm:gap-0">
              <AlertDialogCancel className="border-gray-200 hover:bg-gray-100 text-gray-700 transition-colors font-medium">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={processRequest}
                className={`${actionType === 'approve'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'} 
                  text-white border-0 transition-all duration-200 shadow-sm hover:shadow-md font-medium`}
              >
                {actionType === 'approve' ? 'Yes, Approve' : 'Yes, Reject'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
