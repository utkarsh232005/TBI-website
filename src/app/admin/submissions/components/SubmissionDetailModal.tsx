'use client';

import { useState } from 'react';
import { Submission } from '@/types/Submission';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Landmark, Mail, Phone, ExternalLink, GraduationCap, Calendar, User, Info, Tags, MessageSquare, ClipboardList, CheckCircle } from 'lucide-react';

interface SubmissionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: Submission | null;
}

export default function SubmissionDetailModal({ isOpen, onClose, submission }: SubmissionDetailModalProps) {
  if (!submission) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">{submission.name}</DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Details for the submission from {submission.email}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 text-sm">
          <div className="flex items-center gap-2 text-gray-700">
            <User className="h-4 w-4 text-gray-400" />
            <strong>Name:</strong> {submission.name}
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Mail className="h-4 w-4 text-gray-400" />
            <strong>Email:</strong> {submission.email}
          </div>
          {submission.phone && (
            <div className="flex items-center gap-2 text-gray-700">
              <Phone className="h-4 w-4 text-gray-400" />
              <strong>Phone:</strong> {submission.phone}
            </div>
          )}
          {submission.linkedin && (
            <div className="flex items-center gap-2 text-gray-700">
              <ExternalLink className="h-4 w-4 text-gray-400" />
              <strong>LinkedIn:</strong> <a href={submission.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{submission.linkedin}</a>
            </div>
          )}
          {submission.course && (
            <div className="flex items-center gap-2 text-gray-700">
              <GraduationCap className="h-4 w-4 text-gray-400" />
              <strong>Course:</strong> {submission.course}
            </div>
          )}
          {submission.yearOfStudy && (
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar className="h-4 w-4 text-gray-400" />
              <strong>Year of Study:</strong> {submission.yearOfStudy}
            </div>
          )}
          {submission.campus && (
            <div className="flex items-center gap-2 text-gray-700">
              <Landmark className="h-4 w-4 text-gray-400" />
              <strong>Campus:</strong> <Badge variant="secondary">{submission.campus}</Badge>
            </div>
          )}
          {submission.startupName && (
            <div className="flex items-center gap-2 text-gray-700">
              <Info className="h-4 w-4 text-gray-400" />
              <strong>Startup Name:</strong> {submission.startupName}
            </div>
          )}
          {submission.startupIdea && (
            <div>
              <strong className="flex items-center gap-2 text-gray-700"><Tags className="h-4 w-4 text-gray-400" />Startup Idea:</strong>
              <p className="ml-6 text-gray-700 whitespace-pre-wrap bg-gray-50 rounded p-2 mt-1">{submission.startupIdea}</p>
            </div>
          )}
          {submission.message && (
            <div>
              <strong className="flex items-center gap-2 text-gray-700"><MessageSquare className="h-4 w-4 text-gray-400" />Message:</strong>
              <p className="ml-6 text-gray-700 whitespace-pre-wrap bg-gray-50 rounded p-2 mt-1">{submission.message}</p>
            </div>
          )}
          {submission.status && (
            <div className="flex items-center gap-2 text-gray-700">
              <ClipboardList className="h-4 w-4 text-gray-400" />
              <strong>Status:</strong> <Badge variant="outline">{submission.status}</Badge>
            </div>
          )}
          {submission.source === 'off-campus' && (
            <div className="flex items-center gap-2 text-gray-700">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <strong>Source:</strong> Off-Campus (Google Sheets)
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onClose} className="bg-gray-100 hover:bg-gray-200 text-gray-800 rounded px-4 py-2 font-medium">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 