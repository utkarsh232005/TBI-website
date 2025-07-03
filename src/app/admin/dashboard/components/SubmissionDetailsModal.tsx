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
  <div className={`relative bg-white backdrop-blur-lg rounded-2xl p-5 border-2 border-blue-200/60 shadow-lg hover:shadow-xl hover:border-blue-300/70 transition-all duration-300 ring-1 ring-blue-100/30 overflow-hidden ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/3 to-indigo-500/5 rounded-2xl opacity-100"></div>
    <div className="relative flex items-center gap-4 mb-5">
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl blur opacity-50"></div>
        <div className="relative p-3 rounded-xl bg-gradient-to-br from-blue-500/15 via-purple-500/10 to-indigo-500/15 border-2 border-white/70 shadow-md backdrop-blur-sm">
          <Icon className="h-5 w-5 text-blue-600 drop-shadow-sm" />
        </div>
      </div>
      <h3 className="text-lg font-bold text-gray-800 drop-shadow-sm">{title}</h3>
    </div>
    <div className="relative">{children}</div>
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
  <div className={`relative flex items-start gap-4 py-4 px-5 rounded-xl bg-white border border-blue-200/50 shadow-md hover:shadow-lg hover:border-blue-300/60 transition-all duration-300 backdrop-blur-sm ring-1 ring-blue-100/20 overflow-hidden ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/3 via-purple-500/2 to-indigo-500/3 rounded-xl opacity-100"></div>
    {Icon && <Icon className="relative h-4 w-4 text-blue-500 mt-1 flex-shrink-0 drop-shadow-sm" />}
    <div className="relative flex-1 min-w-0">
      <div className="text-xs font-bold text-gray-600 mb-2 drop-shadow-sm uppercase tracking-wide">{label}</div>
      <div className="text-sm text-gray-800 font-semibold break-words drop-shadow-sm leading-relaxed">{value || 'N/A'}</div>
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
      <DialogContent className="max-w-5xl max-h-[90vh] bg-white border-2 border-blue-200/60 shadow-lg overflow-hidden rounded-2xl">
        <DialogHeader className="relative space-y-6 pb-8 border-b border-blue-200/50 bg-white rounded-t-2xl -mx-6 -mt-6 px-8 pt-8 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-indigo-500/5 rounded-t-2xl"></div>
          <div className="relative flex items-center gap-6">
            <div className="relative">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center border-2 border-blue-300 shadow-md">
                <span className="text-blue-700 font-bold text-2xl">
                  {(submission.fullName || submission.name)?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-gray-800 drop-shadow-sm">
                {submission.fullName || submission.name}
              </DialogTitle>
              <p className="text-gray-600 mt-2 text-lg font-semibold drop-shadow-sm">{submission.companyEmail || submission.email}</p>
            </div>
            <div className="ml-auto flex gap-3">
              <Badge variant="outline" className="bg-gradient-to-r from-blue-100/80 via-blue-50 to-blue-100/80 text-blue-700 border-2 border-blue-300/60 px-4 py-2 text-sm font-bold shadow-md backdrop-blur-sm rounded-lg">
                <span className="drop-shadow-sm">{submission.campusStatus || 'Campus'}</span>
              </Badge>
              <Badge 
                variant="outline" 
                className={`px-4 py-2 text-sm font-bold shadow-md backdrop-blur-sm border-2 rounded-lg
                  ${submission.status === 'accepted' ? 'bg-gradient-to-r from-emerald-100/80 via-emerald-50 to-emerald-100/80 text-emerald-700 border-emerald-300/60' : ''}
                  ${submission.status === 'rejected' ? 'bg-gradient-to-r from-red-100/80 via-red-50 to-red-100/80 text-red-700 border-red-300/60' : ''}
                  ${submission.status === 'pending' ? 'bg-gradient-to-r from-yellow-100/80 via-yellow-50 to-yellow-100/80 text-yellow-700 border-yellow-300/60' : ''}
                `}
              >
                <span className="drop-shadow-sm">{submission.status}</span>
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] pr-6">
          <div className="space-y-6 py-4">
            
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
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide drop-shadow-sm">Domain</label>
                  <Badge className="w-full justify-center py-3 bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-700 border-2 border-blue-300/60 font-bold text-xs shadow-lg backdrop-blur-sm ring-1 ring-blue-100/30 rounded-lg">
                    <span className="drop-shadow-sm">{submission.domain || 'N/A'}</span>
                  </Badge>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide drop-shadow-sm">Sector</label>
                  <Badge className="w-full justify-center py-3 bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-700 border-2 border-purple-300/60 font-bold text-xs shadow-lg backdrop-blur-sm ring-1 ring-purple-100/30 rounded-lg">
                    <span className="drop-shadow-sm">{submission.sector || 'N/A'}</span>
                  </Badge>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide drop-shadow-sm">Legal Status</label>
                  <Badge className="w-full justify-center py-3 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 text-emerald-700 border-2 border-emerald-300/60 font-bold text-xs shadow-lg backdrop-blur-sm ring-1 ring-emerald-100/30 rounded-lg">
                    <span className="drop-shadow-sm">{submission.legalStatus || 'N/A'}</span>
                  </Badge>
                </div>
              </div>
            </DetailSection>

            {/* Founder Information */}
            <DetailSection title="Founder & Team Details" icon={Users}>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-3 block uppercase tracking-wide drop-shadow-sm">Founder Bio</label>
                  <div className="bg-white rounded-xl p-4 border border-blue-200/60 shadow-md backdrop-blur-sm ring-1 ring-blue-100/30 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/3 via-purple-500/2 to-indigo-500/3 rounded-xl opacity-100"></div>
                    <p className="relative text-gray-800 leading-relaxed font-medium text-sm drop-shadow-sm">{submission.founderBio || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-3 block uppercase tracking-wide drop-shadow-sm">Team Information</label>
                  <div className="bg-white rounded-xl p-4 border border-blue-200/60 shadow-md backdrop-blur-sm ring-1 ring-blue-100/30 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/3 via-purple-500/2 to-indigo-500/3 rounded-xl opacity-100"></div>
                    <p className="relative text-gray-800 leading-relaxed font-medium text-sm drop-shadow-sm">{submission.teamInfo || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </DetailSection>

            {/* Startup Idea */}
            <DetailSection title="Startup Details" icon={Lightbulb}>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-2 block uppercase tracking-wide drop-shadow-sm">Startup Idea</label>
                  <div className="bg-white rounded-xl p-4 border border-blue-200/60 shadow-md backdrop-blur-sm ring-1 ring-blue-100/30 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/3 via-purple-500/2 to-indigo-500/3 rounded-xl opacity-100"></div>
                    <p className="relative text-gray-800 leading-relaxed font-medium text-sm drop-shadow-sm">{submission.startupIdea || submission.idea || 'N/A'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-2 block uppercase tracking-wide drop-shadow-sm">Target Audience</label>
                    <div className="bg-white rounded-xl p-4 border border-blue-200/60 shadow-md backdrop-blur-sm ring-1 ring-blue-100/30 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/3 via-purple-500/2 to-indigo-500/3 rounded-xl opacity-100"></div>
                      <p className="relative text-gray-800 font-medium text-sm drop-shadow-sm">{submission.targetAudience || 'N/A'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-2 block uppercase tracking-wide drop-shadow-sm">Current Stage</label>
                    <div className="bg-white rounded-xl p-4 border border-blue-200/60 shadow-md backdrop-blur-sm ring-1 ring-blue-100/30 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/3 via-purple-500/2 to-indigo-500/3 rounded-xl opacity-100"></div>
                      <p className="relative text-gray-800 font-medium text-sm drop-shadow-sm">{submission.currentStage || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-2 block uppercase tracking-wide drop-shadow-sm">Problem Solving Approach</label>
                  <div className="bg-white rounded-xl p-4 border border-blue-200/60 shadow-md backdrop-blur-sm ring-1 ring-blue-100/30 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/3 via-purple-500/2 to-indigo-500/3 rounded-xl opacity-100"></div>
                    <p className="relative text-gray-800 leading-relaxed font-medium text-sm drop-shadow-sm">{submission.problemSolving || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-2 block uppercase tracking-wide drop-shadow-sm">Uniqueness & Competitive Advantage</label>
                  <div className="bg-white rounded-xl p-4 border border-blue-200/60 shadow-md backdrop-blur-sm ring-1 ring-blue-100/30 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/3 via-purple-500/2 to-indigo-500/3 rounded-xl opacity-100"></div>
                    <p className="relative text-gray-800 leading-relaxed font-medium text-sm drop-shadow-sm">{submission.uniqueness || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </DetailSection>

            {/* Login Credentials (if accepted) */}
            {submission.status === 'accepted' && submission.temporaryUserId && (
              <DetailSection title="Login Credentials" icon={KeyRound} className="bg-gradient-to-br from-emerald-50/90 to-green-50/90 border-2 border-emerald-200/70 shadow-lg shadow-emerald-100/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-emerald-600 uppercase tracking-wide">User ID</label>
                    <div className="bg-gradient-to-r from-emerald-100/80 to-emerald-200/80 rounded-lg p-3 border border-emerald-300/60 shadow-sm">
                      <div className="flex items-center gap-2">
                        <UserCircle className="h-4 w-4 text-emerald-600" />
                        <span className="font-mono text-emerald-800 font-bold text-sm">{submission.temporaryUserId}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Password</label>
                    <div className="bg-gradient-to-r from-emerald-100/80 to-emerald-200/80 rounded-lg p-3 border border-emerald-300/60 shadow-sm">
                      <div className="flex items-center gap-2">
                        <KeyRound className="h-4 w-4 text-emerald-600" />
                        <span className="font-mono text-emerald-800 font-bold text-sm">{submission.temporaryPassword}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </DetailSection>
            )}

            {/* Attachment */}
            {submission.attachmentBase64 && (
              <DetailSection title="Attachment" icon={FileText}>
                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-blue-200/60 shadow-md backdrop-blur-sm ring-1 ring-blue-100/30 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/3 via-purple-500/2 to-indigo-500/3 rounded-xl opacity-100"></div>
                  <div className="relative flex items-center gap-4">
                    <div className="relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl blur opacity-40"></div>
                      <div className="relative p-3 bg-gradient-to-br from-blue-100/80 to-indigo-100/80 rounded-xl border border-blue-200/60 shadow-sm backdrop-blur-sm">
                        <FileText className="h-6 w-6 text-blue-600 drop-shadow-sm" />
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-800 font-bold text-base drop-shadow-sm">{submission.attachmentName || 'attachment.pdf'}</p>
                      <p className="text-gray-600 text-xs font-semibold mt-1 drop-shadow-sm uppercase tracking-wide">Application document</p>
                    </div>
                  </div>
                  <Button 
                    onClick={downloadAttachment}
                    variant="outline" 
                    size="sm"
                    className="relative border-2 border-blue-300/70 text-blue-600 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 font-bold px-4 py-2 shadow-md backdrop-blur-sm ring-1 ring-blue-100/30 rounded-lg overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/3 via-purple-500/2 to-indigo-500/3 opacity-100"></div>
                    <Download className="relative h-4 w-4 mr-2 drop-shadow-sm" />
                    <span className="relative drop-shadow-sm">Download</span>
                  </Button>
                </div>
              </DetailSection>
            )}

          </div>
          {/* Bottom spacing */}
          <div className="pb-8"></div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
