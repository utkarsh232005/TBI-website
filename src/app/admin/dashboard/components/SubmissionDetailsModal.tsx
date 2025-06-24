import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  UserCircle,
  KeyRound
} from "lucide-react";
import { Submission } from "@/types/Submission";
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

interface SubmissionDetailsModalProps {
  submission: Submission;
  children: React.ReactNode;
}

const formatDate = (date: Date | string | Timestamp | undefined) => {
  if (!date) return 'N/A';
  try {
    if (date && typeof date === 'object' && 'toDate' in date) {
      return format((date as Timestamp).toDate(), "PPp");
    }
    return format(new Date(date), "PPp");
  } catch {
    return 'Invalid Date';
  }
};

const DetailSection = ({ 
  title, 
  icon: Icon, 
  children, 
  className = "" 
}: { 
  title: string; 
  icon: any; 
  children: React.ReactNode; 
  className?: string;
}) => (
  <div className={`bg-gradient-to-br from-neutral-900/60 to-neutral-800/40 rounded-xl p-6 border border-neutral-700/50 ${className}`}>
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
        <Icon className="h-5 w-5 text-indigo-400" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-100">{title}</h3>
    </div>
    {children}
  </div>
);

const DetailItem = ({ 
  label, 
  value, 
  icon: Icon,
  className = ""
}: { 
  label: string; 
  value: string | undefined; 
  icon?: any;
  className?: string;
}) => (
  <div className={`flex items-start gap-3 py-2 ${className}`}>
    {Icon && <Icon className="h-4 w-4 text-neutral-400 mt-0.5 flex-shrink-0" />}
    <div className="flex-1 min-w-0">
      <div className="text-sm font-medium text-neutral-300">{label}</div>
      <div className="text-sm text-neutral-100 mt-1 break-words">{value || 'N/A'}</div>
    </div>
  </div>
);

export function SubmissionDetailsModal({ submission, children }: SubmissionDetailsModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const downloadAttachment = () => {
    if (submission.attachmentBase64 && submission.attachmentName) {
      const link = document.createElement('a');
      link.href = submission.attachmentBase64;
      link.download = submission.attachmentName || 'attachment.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 border border-neutral-700/50">
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
              <Badge variant="outline" className="bg-blue-900/20 text-blue-300 border-blue-700/40">
                {submission.campusStatus || 'Campus'}
              </Badge>
              <Badge 
                variant="outline" 
                className={`
                  ${submission.status === 'accepted' ? 'bg-emerald-900/20 text-emerald-300 border-emerald-700/40' : ''}
                  ${submission.status === 'rejected' ? 'bg-red-900/20 text-red-300 border-red-700/40' : ''}
                  ${submission.status === 'pending' ? 'bg-yellow-900/20 text-yellow-300 border-yellow-700/40' : ''}
                `}
              >
                {submission.status}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            
            {/* Basic Information */}
            <DetailSection title="Basic Information" icon={User}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem label="Full Name" value={submission.fullName || submission.name} icon={User} />
                <DetailItem label="Phone" value={submission.phone} icon={Phone} />
                <DetailItem label="Nature of Inquiry" value={submission.natureOfInquiry} icon={FileText} />
                <DetailItem label="Submitted At" value={formatDate(submission.submittedAt)} icon={Calendar} />
              </div>
            </DetailSection>

            {/* Company Information */}
            <DetailSection title="Company Information" icon={Building}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem label="Company Name" value={submission.companyName} icon={Building} />
                <DetailItem label="Company Email" value={submission.companyEmail || submission.email} icon={Mail} />
                <DetailItem label="Portfolio URL" value={submission.portfolioUrl} icon={Globe} />
                <div className="md:col-span-2">
                  <DetailItem label="Founder Names" value={submission.founderNames} icon={Users} />
                </div>
              </div>
            </DetailSection>

            {/* Business Details */}
            <DetailSection title="Business Classification" icon={TrendingUp}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-300">Domain</label>
                  <Badge className="w-full justify-center bg-gradient-to-r from-blue-900/40 to-blue-800/40 text-blue-200 border border-blue-700/40">
                    {submission.domain || 'N/A'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-300">Sector</label>
                  <Badge className="w-full justify-center bg-gradient-to-r from-purple-900/40 to-purple-800/40 text-purple-200 border border-purple-700/40">
                    {submission.sector || 'N/A'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-300">Legal Status</label>
                  <Badge className="w-full justify-center bg-gradient-to-r from-emerald-900/40 to-emerald-800/40 text-emerald-200 border border-emerald-700/40">
                    {submission.legalStatus || 'N/A'}
                  </Badge>
                </div>
              </div>
            </DetailSection>

            {/* Founder Information */}
            <DetailSection title="Founder & Team Details" icon={Users}>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-neutral-300 mb-2 block">Founder Bio</label>
                  <div className="bg-neutral-800/30 rounded-lg p-4 border border-neutral-700/30">
                    <p className="text-neutral-100 leading-relaxed">{submission.founderBio || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-300 mb-2 block">Team Information</label>
                  <div className="bg-neutral-800/30 rounded-lg p-4 border border-neutral-700/30">
                    <p className="text-neutral-100 leading-relaxed">{submission.teamInfo || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </DetailSection>

            {/* Startup Idea */}
            <DetailSection title="Startup Details" icon={Lightbulb}>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-neutral-300 mb-2 block">Startup Idea</label>
                  <div className="bg-gradient-to-br from-indigo-950/30 to-purple-950/30 rounded-lg p-4 border border-indigo-700/30">
                    <p className="text-neutral-100 leading-relaxed">{submission.startupIdea || submission.idea || 'N/A'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-300 mb-2 block">Target Audience</label>
                    <div className="bg-neutral-800/30 rounded-lg p-4 border border-neutral-700/30">
                      <p className="text-neutral-100">{submission.targetAudience || 'N/A'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-300 mb-2 block">Current Stage</label>
                    <div className="bg-neutral-800/30 rounded-lg p-4 border border-neutral-700/30">
                      <p className="text-neutral-100">{submission.currentStage || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-300 mb-2 block">Problem Solving Approach</label>
                  <div className="bg-neutral-800/30 rounded-lg p-4 border border-neutral-700/30">
                    <p className="text-neutral-100 leading-relaxed">{submission.problemSolving || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-300 mb-2 block">Uniqueness & Competitive Advantage</label>
                  <div className="bg-neutral-800/30 rounded-lg p-4 border border-neutral-700/30">
                    <p className="text-neutral-100 leading-relaxed">{submission.uniqueness || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </DetailSection>

            {/* Login Credentials (if accepted) */}
            {submission.status === 'accepted' && submission.temporaryUserId && (
              <DetailSection title="Login Credentials" icon={KeyRound} className="bg-gradient-to-br from-emerald-950/40 to-emerald-900/20 border-emerald-700/40">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-emerald-200">User ID</label>
                    <div className="bg-emerald-900/30 rounded-lg p-3 border border-emerald-700/40">
                      <div className="flex items-center gap-2">
                        <UserCircle className="h-4 w-4 text-emerald-400" />
                        <span className="font-mono text-emerald-100">{submission.temporaryUserId}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-emerald-200">Password</label>
                    <div className="bg-emerald-900/30 rounded-lg p-3 border border-emerald-700/40">
                      <div className="flex items-center gap-2">
                        <KeyRound className="h-4 w-4 text-emerald-400" />
                        <span className="font-mono text-emerald-100">{submission.temporaryPassword}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </DetailSection>
            )}

            {/* Attachment */}
            {submission.attachmentBase64 && (
              <DetailSection title="Attachment" icon={FileText}>
                <div className="flex items-center justify-between p-4 bg-neutral-800/30 rounded-lg border border-neutral-700/30">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-neutral-400" />
                    <div>
                      <p className="text-neutral-100 font-medium">{submission.attachmentName || 'attachment.pdf'}</p>
                      <p className="text-neutral-400 text-sm">Application document</p>
                    </div>
                  </div>
                  <Button 
                    onClick={downloadAttachment}
                    variant="outline" 
                    size="sm"
                    className="border-indigo-500/40 text-indigo-300 hover:bg-indigo-900/30"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </DetailSection>
            )}

          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
