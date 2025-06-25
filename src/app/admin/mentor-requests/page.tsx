// src/app/admin/mentor-requests/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Calendar
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Mentor Requests</h1>
          <p className="text-muted-foreground mt-2">
            Review and process mentor selection requests from students
          </p>
        </div>
        <Button onClick={fetchRequests} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingRequests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">
                  {requests.filter(r => r.status === 'admin_approved' || r.status === 'mentor_approved').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold">
                  {requests.filter(r => r.status === 'admin_rejected' || r.status === 'mentor_rejected').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{requests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-yellow-600">
            Pending Review ({pendingRequests.length})
          </h2>
          <div className="grid gap-4">
            {pendingRequests.map((request) => (
              <Card key={request.id} className="border-yellow-200">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          <User className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">{request.userName}</h3>
                        <p className="text-sm text-muted-foreground flex items-center">
                          <Mail className="mr-1 h-3 w-3" />
                          {request.userEmail}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                          <Calendar className="mr-1 h-3 w-3" />
                          {request.createdAt && format(request.createdAt, 'PPP')}
                        </p>
                      </div>
                    </div>
                    <Badge className={statusColors[request.status]}>
                      {statusLabels[request.status]}
                    </Badge>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg mb-4">
                    <p className="font-medium mb-2">Wants to connect with: {request.mentorName}</p>
                    <p className="text-sm text-muted-foreground">
                      <MessageSquare className="inline mr-1 h-3 w-3" />
                      {request.requestMessage}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleAction(request, 'approve')}
                      disabled={processingRequestId === request.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {processingRequestId === request.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="mr-2 h-4 w-4" />
                      )}
                      Approve & Forward
                    </Button>
                    <Button
                      onClick={() => handleAction(request, 'reject')}
                      disabled={processingRequestId === request.id}
                      variant="destructive"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Processed Requests */}
      {processedRequests.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            Processed Requests ({processedRequests.length})
          </h2>
          <div className="grid gap-4">
            {processedRequests.map((request) => (
              <Card key={request.id} className="opacity-75">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{request.userName}</h3>
                        <p className="text-sm text-muted-foreground">
                          → {request.mentorName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {request.adminProcessedAt && format(request.adminProcessedAt, 'PPP')}
                        </p>
                      </div>
                    </div>
                    <Badge className={statusColors[request.status]}>
                      {statusLabels[request.status]}
                    </Badge>
                  </div>
                  {request.adminNotes && (
                    <div className="mt-3 p-3 bg-muted/30 rounded text-sm">
                      <strong>Admin Notes:</strong> {request.adminNotes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {requests.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No mentor requests yet</h3>
          <p className="text-muted-foreground">
            Requests will appear here when students submit mentor selection requests.
          </p>
        </div>
      )}

      {/* Action Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={closeDialogs}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve' : 'Reject'} Mentor Request
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' 
                ? 'This will forward the request to the mentor for final approval.'
                : 'This will reject the request and notify the student.'
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p><strong>Student:</strong> {selectedRequest.userName}</p>
                <p><strong>Mentor:</strong> {selectedRequest.mentorName}</p>
                <p className="mt-2 text-sm">{selectedRequest.requestMessage}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium">
                  {actionType === 'approve' ? 'Additional notes (optional)' : 'Rejection reason'}
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    actionType === 'approve' 
                      ? 'Any additional notes for the mentor...'
                      : 'Please provide a reason for rejection...'
                  }
                  className="mt-2"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={closeDialogs}>
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              variant={actionType === 'approve' ? 'default' : 'destructive'}
            >
              {actionType === 'approve' ? 'Approve & Forward' : 'Reject Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={closeDialogs}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {actionType} this mentor request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={processRequest}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
