
'use client';

import { Submission } from '@/types/Submission';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Eye, 
  User, 
  Mail, 
  Phone, 
  Building, 
  Globe, 
  Users, 
  Lightbulb, 
  Target, 
  Puzzle, 
  Star, 
  TrendingUp,
  FileText,
  Calendar,
  Download,
  KeyRound,
  Landmark
} from "lucide-react";

interface SubmissionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: Submission | null;
}

const formatDate = (date: Date | string | Timestamp | undefined) => {
  if (!date) return 'N/A';
  try {
    const d = date instanceof Timestamp ? date.toDate() : new Date(date);
    return format(d, "PPp");
  } catch {
    return 'Invalid Date';
  }
};

const DetailSection = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode; }) => (
  <div className="bg-gradient-to-br from-neutral-900/60 to-neutral-800/40 rounded-xl p-6 border border-neutral-700/50">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
        <Icon className="h-5 w-5 text-indigo-400" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-100">{title}</h3>
    </div>
    {children}
  </div>
);

const DetailItem = ({ label, value }: { label: string; value?: string | React.ReactNode; }) => (
  <div className="flex flex-col gap-1 py-1">
    <div className="text-sm font-medium text-neutral-400">{label}</div>
    <div className="text-base text-neutral-100 break-words">{value || 'N/A'}</div>
  </div>
);

export default function SubmissionDetailModal({ isOpen, onClose, submission }: SubmissionDetailModalProps) {
  if (!submission) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted': return <Badge className="bg-emerald-900/20 text-emerald-300 border-emerald-700/40">Accepted</Badge>;
      case 'rejected': return <Badge className="bg-red-900/20 text-red-300 border-red-700/40">Rejected</Badge>;
      default: return <Badge className="bg-yellow-900/20 text-yellow-300 border-yellow-700/40">Pending</Badge>;
    }
  };

  const getCampusBadge = (status?: 'campus' | 'off-campus') => {
    if (!status) return null;
    return status === 'campus' 
      ? <Badge className="bg-blue-900/20 text-blue-300 border-blue-700/40">Campus</Badge>
      : <Badge className="bg-purple-900/20 text-purple-300 border-purple-700/40">Off-Campus</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
<<<<<<< HEAD
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
=======
      <DialogContent className="max-w-4xl max-h-[90vh] bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 border border-neutral-700/50 text-white">
        <DialogHeader className="space-y-4 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-indigo-400/30">
              <span className="text-indigo-300 font-bold text-lg">
                {(submission.fullName || submission.name)?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-neutral-100">
                {submission.fullName || submission.name}
              </DialogTitle>
              <p className="text-neutral-400 mt-1">{submission.companyEmail || submission.email}</p>
            </div>
            <div className="ml-auto flex gap-2">
              {getCampusBadge(submission.campusStatus)}
              {getStatusBadge(submission.status)}
            </div>
          </div>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            <DetailSection title="Basic Information" icon={User}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <DetailItem label="Full Name" value={submission.fullName || submission.name} />
                <DetailItem label="Phone" value={submission.phone} />
                <DetailItem label="Nature of Inquiry" value={submission.natureOfInquiry} />
                <DetailItem label="Submitted At" value={formatDate(submission.submittedAt)} />
              </div>
            </DetailSection>
            
            <DetailSection title="Company Information" icon={Building}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <DetailItem label="Company Name" value={submission.companyName} />
                <DetailItem label="Company Email" value={submission.companyEmail || submission.email} />
                <DetailItem label="Portfolio/LinkedIn URL" value={submission.portfolioUrl ? <a href={submission.portfolioUrl} className="text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">{submission.portfolioUrl}</a> : 'N/A'} />
                <DetailItem label="Founder Names" value={submission.founderNames} />
              </div>
            </DetailSection>

            <DetailSection title="Business Classification" icon={TrendingUp}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <DetailItem label="Domain" value={<Badge variant="outline" className="text-blue-300 border-blue-700">{submission.domain}</Badge>} />
                <DetailItem label="Sector" value={<Badge variant="outline" className="text-purple-300 border-purple-700">{submission.sector}</Badge>} />
              </div>
            </DetailSection>
            
            <DetailSection title="Founder & Team Details" icon={Users}>
              <div className="space-y-4">
                <DetailItem label="Founder Bio" value={<p className="whitespace-pre-wrap">{submission.founderBio}</p>} />
                <DetailItem label="Team Information" value={<p className="whitespace-pre-wrap">{submission.teamInfo}</p>} />
              </div>
            </DetailSection>
            
            <DetailSection title="Startup Details" icon={Lightbulb}>
              <div className="space-y-4">
                <DetailItem label="Startup Idea" value={<p className="whitespace-pre-wrap">{submission.startupIdea}</p>} />
                <DetailItem label="Problem Solving Approach" value={<p className="whitespace-pre-wrap">{submission.problemSolving}</p>} />
                <DetailItem label="Uniqueness & Competitive Advantage" value={<p className="whitespace-pre-wrap">{submission.uniqueness}</p>} />
              </div>
            </DetailSection>
            
            {submission.status === 'accepted' && (submission.firebaseUid || submission.temporaryUserId) && (
              <DetailSection title="Login Credentials" icon={KeyRound}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DetailItem label="Firebase UID" value={submission.firebaseUid || submission.temporaryUserId} />
                  <DetailItem label="Temporary Password" value={submission.temporaryPassword} />
                </div>
              </DetailSection>
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button onClick={onClose} variant="outline" className="mt-4">Close</Button>
>>>>>>> beb9523e675e3445f808db4c0308240e0955707d
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
