'use client';

import { Submission, CampusStatus } from "@/types/Submission";
import { format } from 'date-fns';
import { FileTextIcon, Mail, CalendarDays, Building, Phone, Info, CheckCircle, XCircle, Globe } from "lucide-react";

interface OffCampusSubmissionCardProps {
  submission: Submission;
  processingAction: { id: string; type: 'accept' | 'reject' } | null;
  onProcessAction: (id: string, action: 'accept' | 'reject', name: string, email: string) => void;
  onViewDetails: (submission: Submission) => void;
}

const formatDate = (date: Date | string | undefined | any) => {
  if (!date) return 'N/A';
  try {
    // Handle Firestore Timestamp objects
    if (date && typeof date === 'object' && 'toDate' in date) {
      return format(date.toDate(), "PPpp");
    }
    return format(new Date(date), "PPpp");
  } catch {
    return 'Invalid Date';
  }
};

export function OffCampusSubmissionCard({
  submission,
  processingAction,
  onProcessAction,
  onViewDetails,
}: OffCampusSubmissionCardProps) {
  return (
    <div className="submission-card">
      {/* Status Badge */}
      <div className={`submission-status-badge submission-status-${submission.status || 'pending'}`}>
        {submission.status || 'pending'}
      </div>

      {/* Card Header */}
      <div className="submission-card-header">
        <div className="submission-icon-wrapper">
          <Globe className="submission-icon-large" />
        </div>
        <h3 className="submission-card-title">
          {submission.name || 'Unknown Applicant'}
        </h3>
        <p className="submission-card-description">
          Off-Campus Application
        </p>
      </div>

      {/* Card Content */}
      <div className="submission-card-content">
        <div className="submission-info-grid">
          <div className="submission-info-item">
            <Mail className="submission-info-icon" />
            <div className="submission-info-content">
              <div className="submission-info-label">Email</div>
              <div className="submission-info-value">{submission.email || 'Not provided'}</div>
            </div>
          </div>
          
          {submission.phone && (
            <div className="submission-info-item">
              <Phone className="submission-info-icon" />
              <div className="submission-info-content">
                <div className="submission-info-label">Phone</div>
                <div className="submission-info-value">{submission.phone}</div>
              </div>
            </div>
          )}
          
          {submission.companyName && (
            <div className="submission-info-item">
              <Building className="submission-info-icon" />
              <div className="submission-info-content">
                <div className="submission-info-label">Company</div>
                <div className="submission-info-value">{submission.companyName}</div>
              </div>
            </div>
          )}
          
          {submission.submittedAt && (
            <div className="submission-info-item">
              <CalendarDays className="submission-info-icon" />
              <div className="submission-info-content">
                <div className="submission-info-label">Submitted</div>
                <div className="submission-info-value">{formatDate(submission.submittedAt)}</div>
              </div>
            </div>
          )}
        </div>
        
        {(submission.startupIdea || submission.idea) && (
          <div className="submission-info-item" style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
            <Info className="submission-info-icon" />
            <div className="submission-info-content">
              <div className="submission-info-label">Business Idea</div>
              <div className="submission-info-value">
                {(submission.startupIdea || submission.idea || '').substring(0, 100)}
                {(submission.startupIdea || submission.idea || '').length > 100 && '...'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="submission-card-footer">
        <button 
          onClick={() => onViewDetails(submission)} 
          className="submission-action-btn submission-action-view"
        >
          <FileTextIcon className="w-4 h-4" />
          View Details
        </button>
        
        {submission.status === 'pending' && (
          <>
            <button 
              onClick={() => onProcessAction(submission.id, 'accept', submission.name, submission.email)}
              disabled={processingAction?.id === submission.id}
              className="submission-action-btn submission-action-accept"
            >
              <CheckCircle className="w-4 h-4" />
              Accept
            </button>
            <button 
              onClick={() => onProcessAction(submission.id, 'reject', submission.name, submission.email)}
              disabled={processingAction?.id === submission.id}
              className="submission-action-btn submission-action-reject"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default OffCampusSubmissionCard;
