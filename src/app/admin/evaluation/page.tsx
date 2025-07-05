"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  Users, 
  FileText, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Filter,
  Search,
  X,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  AlertCircle,
  Activity,
  Target,
  TrendingUp,
  Star,
  Copy,
  Archive,
  Download
} from "lucide-react";
import { format } from 'date-fns';
import dynamic from 'next/dynamic';

// Helper function to safely format dates
const safeFormat = (date: Date | string, formatStr: string) => {
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

// Toast notification component
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) => (
  <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border ${
    type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
    type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
    'bg-blue-50 border-blue-200 text-blue-800'
  }`}>
    <div className="flex items-center gap-3">
      <span>{message}</span>
      <button 
        onClick={onClose} 
        className="w-6 h-6 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded shadow-sm transition-all duration-200 flex items-center justify-center"
        title="Close notification"
      >
        <X className="w-4 h-4 text-gray-500 hover:text-gray-700" />
      </button>
    </div>
  </div>
);

// Confirmation dialog component
const ConfirmDialog = ({ 
  isOpen, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  onConfirm, 
  onCancel,
  variant = "danger"
}: {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "warning" | "info";
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-md mx-4 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          {variant === "danger" && <AlertCircle className="w-6 h-6 text-red-500" />}
          {variant === "warning" && <AlertCircle className="w-6 h-6 text-amber-500" />}
          {variant === "info" && <Clock className="w-6 h-6 text-blue-500" />}
          <h3 className="admin-heading-4">{title}</h3>
        </div>
        <p className="admin-body-small mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <Button 
            variant="outline" 
            onClick={onCancel} 
            className="border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 px-6 py-2.5 font-medium rounded-lg transition-all duration-200"
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>{cancelText}</span>
            </div>
          </Button>
          <Button 
            onClick={onConfirm} 
            className={`${
              variant === "danger" ? "bg-red-600 hover:bg-red-700" :
              variant === "warning" ? "bg-amber-600 hover:bg-amber-700" :
              "bg-blue-600 hover:bg-blue-700"
            } text-white px-6 py-2.5 font-medium rounded-lg transition-all duration-200`}
          >
            <div className="flex items-center gap-2">
              {variant === "danger" && <AlertCircle className="w-4 h-4" />}
              {variant === "warning" && <AlertCircle className="w-4 h-4" />}
              {variant === "info" && <CheckCircle className="w-4 h-4" />}
              <span>{confirmText}</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

// View Round Modal
const ViewRoundModal = ({ round, isOpen, onClose }: { 
  round: EvaluationRound | null; 
  isOpen: boolean; 
  onClose: () => void; 
}) => {
  if (!isOpen || !round) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-200 rounded-lg max-w-4xl w-full max-h-[95vh] flex flex-col shadow-lg">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-200">
          <div className="min-w-0 flex-1">
            <h2 className="admin-heading-3 truncate">{round.roundName}</h2>
            <p className="admin-caption mt-1 line-clamp-2">{round.description || 'No description provided'}</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200 flex items-center justify-center"
            title="Close modal"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 p-6 overflow-y-auto min-h-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <h3 className="admin-heading-5 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                  Basic Information
                </h3>
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <label className="admin-label">Phase</label>
                    <Badge className={`${
                      round.phase === 'Application' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                      round.phase === 'Screening' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                      round.phase === 'Pitch' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                      round.phase === 'Demo' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' :
                      round.phase === 'Due Diligence' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                      'bg-green-100 text-green-800 border-green-200'
                    } px-3 py-1.5 text-sm font-medium border`}>
                      {round.phase}
                    </Badge>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <label className="admin-label">Status</label>
                    <div className="flex items-center gap-2">
                      {round.status === 'Active' && <Activity className="w-4 h-4 text-green-600 flex-shrink-0" />}
                      {round.status === 'Completed' && <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                      {round.status === 'Draft' && <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />}
                      {round.status === 'Cancelled' && <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />}
                      <span className={`font-medium ${
                        round.status === 'Active' ? 'text-green-700' :
                        round.status === 'Completed' ? 'text-blue-700' :
                        round.status === 'Draft' ? 'text-amber-700' :
                        'text-red-700'
                      }`}>
                        {round.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <label className="text-sm text-gray-600 block mb-2 font-medium">Scheduled Date</label>
                    <div className="flex items-center gap-3 text-gray-800">
                      <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <div>
                        <div className="font-medium">{format(round.scheduledAt, 'PPP')}</div>
                        <div className="text-sm text-gray-500">{format(round.scheduledAt, 'p')}</div>
                      </div>
                    </div>
                  </div>
                  
                  {round.evaluationDeadline && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <label className="text-sm text-gray-600 block mb-2 font-medium">Evaluation Deadline</label>
                      <div className="flex items-center gap-3 text-gray-800">
                        <Clock className="w-4 h-4 text-orange-600 flex-shrink-0" />
                        <div>
                          <div className="font-medium">{format(round.evaluationDeadline, 'PPP')}</div>
                          <div className="text-sm text-gray-500">{format(round.evaluationDeadline, 'p')}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {round.description && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <label className="text-sm text-gray-600 block mb-2 font-medium">Description</label>
                      <p className="text-gray-800 leading-relaxed">{round.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Scoring & Configuration */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                  Scoring Configuration
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-purple-50 rounded-lg p-4 text-center border border-purple-200">
                      <label className="text-sm text-purple-700 block mb-2 font-medium">Max Score</label>
                      <p className="text-2xl font-bold text-purple-800">{round.maxScore}</p>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-4 text-center border border-indigo-200">
                      <label className="text-sm text-indigo-700 block mb-2 font-medium">Min Score</label>
                      <p className="text-2xl font-bold text-indigo-800">{round.minimumScore}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <label className="text-sm text-gray-600 block mb-2 font-medium">Scoring Method</label>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        round.scoringMethod === 'weighted' ? 'bg-purple-500' :
                        round.scoringMethod === 'simple' ? 'bg-blue-500' :
                        'bg-green-500'
                      }`}></div>
                      <p className="text-gray-800 capitalize font-medium">{round.scoringMethod}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <label className="text-sm text-gray-600 block mb-2 font-medium">Evaluation Period</label>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <p className="text-gray-800 font-medium">{round.evaluationPeriod} days</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <label className="text-sm text-gray-600 block mb-2 font-medium">Auto Advance</label>
                    <div className="flex items-center gap-2">
                      {round.autoAdvance ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="text-green-700 font-medium">Enabled</span>
                          <span className="text-xs text-gray-500 ml-2">Qualifying submissions will advance automatically</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span className="text-gray-700 font-medium">Disabled</span>
                          <span className="text-xs text-gray-500 ml-2">Manual advancement required</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                  Current Metrics
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
                    <div className="text-3xl font-bold text-blue-700 mb-1">{round.submissionCount || 0}</div>
                    <div className="text-blue-600 text-sm font-medium">Submissions</div>
                    <div className="text-xs text-blue-500 mt-1">Total received</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center border border-purple-200">
                    <div className="text-3xl font-bold text-purple-700 mb-1">{round.evaluatorCount || 0}</div>
                    <div className="text-purple-600 text-sm font-medium">Evaluators</div>
                    <div className="text-xs text-purple-500 mt-1">Active reviewers</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
                    <div className="text-3xl font-bold text-green-700 mb-1">{round.criteriaCount || 0}</div>
                    <div className="text-green-600 text-sm font-medium">Criteria</div>
                    <div className="text-xs text-green-500 mt-1">Evaluation points</div>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4 text-center border border-amber-200">
                    <div className="text-3xl font-bold text-amber-700 mb-1">
                      {round.averageScore ? round.averageScore.toFixed(1) : '0.0'}
                    </div>
                    <div className="text-amber-600 text-sm font-medium">Avg Score</div>
                    <div className="text-xs text-amber-500 mt-1">Overall rating</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Allowed Submission Types */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
                  Allowed Submissions
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {round.allowedSubmissionTypes.map((type, index) => (
                      <Badge 
                        key={index} 
                        className="bg-amber-100 text-amber-800 border-amber-200 px-3 py-1.5 text-sm font-medium border"
                      >
                        {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    ))}
                  </div>
                  {round.allowedSubmissionTypes.length === 0 && (
                    <p className="text-gray-500 text-sm italic">No submission types specified</p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Details for larger screens */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gray-500 rounded-full"></div>
                  Timeline & Progress
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1 font-medium">Created</div>
                      <div className="text-gray-900 font-semibold">{format(round.createdAt, 'MMM d, yyyy')}</div>
                      <div className="text-xs text-gray-500">{format(round.createdAt, 'HH:mm')}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1 font-medium">Last Updated</div>
                      <div className="text-gray-900 font-semibold">{format(round.updatedAt, 'MMM d, yyyy')}</div>
                      <div className="text-xs text-gray-500">{format(round.updatedAt, 'HH:mm')}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1 font-medium">Scheduled</div>
                      <div className="text-gray-900 font-semibold">{format(round.scheduledAt, 'MMM d, yyyy')}</div>
                      <div className="text-xs text-gray-500">{format(round.scheduledAt, 'HH:mm')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50/80 backdrop-blur-sm">
          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex items-center gap-4">
              <span>Created: {format(round.createdAt, 'PPP')}</span>
              <span className="text-gray-400">•</span>
              <span>Updated: {format(round.updatedAt, 'PPP')}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="group relative border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 px-8 py-3 font-medium rounded-xl shadow-sm hover:shadow-md backdrop-blur-sm"
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="transition-transform duration-300 group-hover:translate-x-0.5">Close</span>
              </div>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gray-50/0 to-gray-100/0 group-hover:from-gray-50/60 group-hover:to-gray-100/60 transition-all duration-300"></div>
            </Button>
            <Button 
              onClick={() => {
                onClose();
                // Trigger edit mode by calling a parent function
                setTimeout(() => {
                  const editEvent = new CustomEvent('openEditModal', { detail: round });
                  window.dispatchEvent(editEvent);
                }, 100);
              }}
              className="group relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/30 font-medium rounded-xl border-0"
            >
              <div className="flex items-center gap-2.5">
                <Edit className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                <span className="transition-transform duration-300 group-hover:translate-x-0.5">Edit Round</span>
              </div>
              <div className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/10 transition-all duration-300"></div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Edit Round Modal (enhanced version)
const EditRoundModal = ({ 
  round, 
  isOpen, 
  onClose, 
  onSave 
}: { 
  round: EvaluationRound | null; 
  isOpen: boolean; 
  onClose: () => void;
  onSave: (data: Partial<EvaluationRound>) => void;
}) => {
  const [formData, setFormData] = useState<Partial<EvaluationRound>>({});

  useEffect(() => {
    if (round) {
      setFormData(round);
    }
  }, [round]);

  if (!isOpen || !round) return null;

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-200 rounded-2xl max-w-3xl w-full max-h-[95vh] flex flex-col shadow-2xl">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-200">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold text-gray-900">Edit Evaluation Round</h2>
            <p className="text-gray-600 text-sm mt-1">Update the details of your evaluation round</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200 flex items-center justify-center"
            title="Close modal"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 p-6 overflow-y-auto min-h-0">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Round Name</label>
                  <Input
                    value={formData.roundName || ''}
                    onChange={(e) => setFormData({...formData, roundName: e.target.value})}
                    className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    placeholder="Enter round name..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                    rows={3}
                    placeholder="Enter description..."
                  />
                </div>
              </div>
            </div>

            {/* Status & Phase */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                Status & Phase
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phase</label>
                  <select
                    value={formData.phase || ''}
                    onChange={(e) => setFormData({...formData, phase: e.target.value as any})}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-colors"
                  >
                    <option value="Application">Application</option>
                    <option value="Screening">Screening</option>
                    <option value="Pitch">Pitch</option>
                    <option value="Demo">Demo</option>
                    <option value="Due Diligence">Due Diligence</option>
                    <option value="Final">Final</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status || ''}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-colors"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Scoring Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                Scoring Configuration
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Score</label>
                  <Input
                    type="number"
                    value={formData.maxScore || ''}
                    onChange={(e) => setFormData({...formData, maxScore: parseInt(e.target.value)})}
                    className="bg-white border-gray-300 text-gray-900 focus:border-green-500 focus:ring-green-500 transition-colors"
                    placeholder="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Score</label>
                  <Input
                    type="number"
                    value={formData.minimumScore || ''}
                    onChange={(e) => setFormData({...formData, minimumScore: parseInt(e.target.value)})}
                    className="bg-white border-gray-300 text-gray-900 focus:border-green-500 focus:ring-green-500 transition-colors"
                    placeholder="60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Scoring Method</label>
                  <select
                    value={formData.scoringMethod || ''}
                    onChange={(e) => setFormData({...formData, scoringMethod: e.target.value as any})}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none transition-colors"
                  >
                    <option value="weighted">Weighted</option>
                    <option value="simple">Simple</option>
                    <option value="consensus">Consensus</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Evaluation Period (days)</label>
                  <Input
                    type="number"
                    value={formData.evaluationPeriod || ''}
                    onChange={(e) => setFormData({...formData, evaluationPeriod: parseInt(e.target.value)})}
                    className="bg-white border-gray-300 text-gray-900 focus:border-green-500 focus:ring-green-500 transition-colors"
                    placeholder="7"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.autoAdvance || false}
                    onChange={(e) => setFormData({...formData, autoAdvance: e.target.checked})}
                    className="w-4 h-4 rounded border-gray-300 bg-white text-green-600 focus:ring-green-500 focus:ring-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable Auto Advance</span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-7">Automatically advance qualifying submissions to the next round</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50/80">
          <div className="text-sm text-gray-600">
            Last updated: {round ? format(round.updatedAt, 'PPP p') : 'Never'}
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              className="group relative bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-green-500/30 font-medium rounded-xl border-0"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                <span className="transition-transform duration-300 group-hover:translate-x-0.5">Save Changes</span>
              </div>
              <div className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/10 transition-all duration-300"></div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dynamic import for the modal
const CreateEvaluationModal = dynamic(
  () => import("./NewEvaluationModal").then(mod => ({ default: mod.default || mod })),
  { 
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
        <div className="bg-white p-4 rounded shadow-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading modal...</p>
        </div>
      </div>
    )
  }
);

// Enhanced evaluation round interface
interface EvaluationRound {
  id: string;
  roundName: string;
  description?: string;
  phase: 'Application' | 'Screening' | 'Pitch' | 'Demo' | 'Due Diligence' | 'Final';
  scheduledAt: Date;
  evaluationDeadline?: Date;
  status: 'Draft' | 'Active' | 'Completed' | 'Cancelled';
  createdAt: Date;
  updatedAt: Date;
  maxScore: number;
  minimumScore: number;
  evaluationPeriod: number;
  scoringMethod: 'weighted' | 'simple' | 'consensus';
  autoAdvance: boolean;
  allowedSubmissionTypes: string[];
  criteriaCount?: number;
  evaluatorCount?: number;
  submissionCount?: number;
  averageScore?: number;
}

// Local storage key for evaluation rounds
const STORAGE_KEY = 'admin_evaluation_rounds';

export default function EvaluationPage() {
  const [evaluationRounds, setEvaluationRounds] = useState<EvaluationRound[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [phaseFilter, setPhaseFilter] = useState<string>('all');
  const [selectedRound, setSelectedRound] = useState<EvaluationRound | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: "danger" | "warning" | "info";
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Load evaluation rounds from localStorage on mount
  useEffect(() => {
    const loadEvaluationRounds = () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const rounds = JSON.parse(stored).map((round: any) => ({
            ...round,
            scheduledAt: new Date(round.scheduledAt),
            evaluationDeadline: round.evaluationDeadline ? new Date(round.evaluationDeadline) : undefined,
            createdAt: new Date(round.createdAt),
            updatedAt: new Date(round.updatedAt)
          }));
          setEvaluationRounds(rounds);
        } else {
          // Initialize with sample data
          const sampleRounds: EvaluationRound[] = [
            {
              id: '1',
              roundName: 'Q1 2024 Startup Pitch Competition',
              description: 'Initial screening round for Q1 startup applications with comprehensive evaluation criteria',
              phase: 'Pitch',
              scheduledAt: new Date('2024-02-15T09:00:00'),
              evaluationDeadline: new Date('2024-02-20T17:00:00'),
              status: 'Active',
              createdAt: new Date('2024-01-15T10:00:00'),
              updatedAt: new Date('2024-01-15T10:00:00'),
              maxScore: 100,
              minimumScore: 60,
              evaluationPeriod: 7,
              scoringMethod: 'weighted',
              autoAdvance: false,
              allowedSubmissionTypes: ['pitch_deck', 'business_plan'],
              criteriaCount: 8,
              evaluatorCount: 12,
              submissionCount: 45,
              averageScore: 78.5
            },
            {
              id: '2',
              roundName: 'FinTech Innovation Challenge',
              description: 'Specialized evaluation round focusing on financial technology startups',
              phase: 'Due Diligence',
              scheduledAt: new Date('2024-03-01T14:00:00'),
              evaluationDeadline: new Date('2024-03-15T16:00:00'),
              status: 'Completed',
              createdAt: new Date('2024-02-01T09:30:00'),
              updatedAt: new Date('2024-03-16T10:15:00'),
              maxScore: 100,
              minimumScore: 70,
              evaluationPeriod: 14,
              scoringMethod: 'consensus',
              autoAdvance: true,
              allowedSubmissionTypes: ['pitch_deck', 'financial_projections', 'demo_video'],
              criteriaCount: 10,
              evaluatorCount: 8,
              submissionCount: 28,
              averageScore: 84.2
            },
            {
              id: '3',
              roundName: 'Healthcare Innovation Round',
              description: 'Evaluation round for healthcare and medical technology startups',
              phase: 'Demo',
              scheduledAt: new Date('2024-04-10T10:00:00'),
              evaluationDeadline: new Date('2024-04-25T18:00:00'),
              status: 'Draft',
              createdAt: new Date('2024-03-20T11:00:00'),
              updatedAt: new Date('2024-03-20T11:00:00'),
              maxScore: 100,
              minimumScore: 65,
              evaluationPeriod: 15,
              scoringMethod: 'weighted',
              autoAdvance: false,
              allowedSubmissionTypes: ['pitch_deck', 'prototype_demo', 'technical_documentation'],
              criteriaCount: 12,
              evaluatorCount: 15,
              submissionCount: 32,
              averageScore: 0
            },
            {
              id: '4',
              roundName: 'AI & Machine Learning Showcase',
              description: 'Comprehensive evaluation for artificial intelligence and machine learning startups',
              phase: 'Final',
              scheduledAt: new Date('2024-05-05T13:00:00'),
              evaluationDeadline: new Date('2024-05-20T17:00:00'),
              status: 'Active',
              createdAt: new Date('2024-04-01T14:30:00'),
              updatedAt: new Date('2024-04-02T09:45:00'),
              maxScore: 100,
              minimumScore: 75,
              evaluationPeriod: 15,
              scoringMethod: 'simple',
              autoAdvance: true,
              allowedSubmissionTypes: ['pitch_deck', 'live_demo', 'technical_whitepaper'],
              criteriaCount: 15,
              evaluatorCount: 20,
              submissionCount: 18,
              averageScore: 89.7
            }
          ];
          setEvaluationRounds(sampleRounds);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleRounds));
        }
      } catch (err) {
        setError('Failed to load evaluation rounds');
        console.error('Error loading evaluation rounds:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvaluationRounds();
  }, []);

  // Listen for edit modal events from View modal
  useEffect(() => {
    const handleOpenEditModal = (event: CustomEvent) => {
      const round = event.detail;
      if (round) {
        setSelectedRound(round);
        setIsEditModalOpen(true);
      }
    };

    window.addEventListener('openEditModal', handleOpenEditModal as any);
    return () => window.removeEventListener('openEditModal', handleOpenEditModal as any);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMoreActions) {
        const target = event.target as Element;
        if (!target.closest('.more-actions-dropdown')) {
          setShowMoreActions(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMoreActions]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      // Close modals with Escape key (prioritize topmost modal)
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        
        // Close in priority order (topmost first)
        if (confirmDialog.isOpen) {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        } else if (showMoreActions) {
          setShowMoreActions(null);
        } else if (isModalOpen) {
          setIsModalOpen(false);
        } else if (isEditModalOpen) {
          setIsEditModalOpen(false);
          setSelectedRound(null);
        } else if (isViewModalOpen) {
          setIsViewModalOpen(false);
          setSelectedRound(null);
        }
      }

      // Quick create with Ctrl+N (only when no modals are open)
      if (event.ctrlKey && event.key === 'n') {
        // Prevent default browser behavior
        event.preventDefault();
        event.stopPropagation();
        
        // Only open if no other modals are currently open
        if (!isModalOpen && !isViewModalOpen && !isEditModalOpen && !confirmDialog.isOpen) {
          setIsModalOpen(true);
        }
      }
    };

    // Attach to document to capture all events
    document.addEventListener('keydown', handleKeydown, { capture: true });
    return () => document.removeEventListener('keydown', handleKeydown, { capture: true });
  }, [isViewModalOpen, isEditModalOpen, isModalOpen, confirmDialog.isOpen, showMoreActions]);

  // Save evaluation rounds to localStorage whenever they change
  useEffect(() => {
    if (evaluationRounds.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(evaluationRounds));
    }
  }, [evaluationRounds]);

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Show confirmation dialog
  const showConfirmDialog = (title: string, message: string, onConfirm: () => void, variant: "danger" | "warning" | "info" = "danger") => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
      variant
    });
  };

  // Handle creating a new evaluation round
  const handleCreateEvaluation = async (roundData: Partial<EvaluationRound>) => {
    try {
      const newRound: EvaluationRound = {
        id: Date.now().toString(),
        roundName: roundData.roundName || '',
        description: roundData.description,
        phase: roundData.phase || 'Application',
        scheduledAt: roundData.scheduledAt || new Date(),
        evaluationDeadline: roundData.evaluationDeadline,
        status: roundData.status || 'Draft',
        createdAt: new Date(),
        updatedAt: new Date(),
        maxScore: roundData.maxScore || 100,
        minimumScore: roundData.minimumScore || 60,
        evaluationPeriod: roundData.evaluationPeriod || 7,
        scoringMethod: roundData.scoringMethod || 'weighted',
        autoAdvance: roundData.autoAdvance || false,
        allowedSubmissionTypes: roundData.allowedSubmissionTypes || ['pitch_deck'],
        criteriaCount: 0,
        evaluatorCount: 0,
        submissionCount: 0,
        averageScore: 0
      };

      const updatedRounds = [...evaluationRounds, newRound];
      setEvaluationRounds(updatedRounds);
      setIsModalOpen(false);
      showToast(`Evaluation round "${newRound.roundName}" created successfully!`, 'success');
    } catch (error) {
      console.error('Failed to create evaluation round:', error);
      setError('Failed to create evaluation round');
      showToast('Failed to create evaluation round', 'error');
    }
  };

  // Handle deleting an evaluation round
  const handleDeleteRound = (id: string) => {
    const round = evaluationRounds.find(r => r.id === id);
    if (!round) return;

    showConfirmDialog(
      'Delete Evaluation Round',
      `Are you sure you want to delete "${round.roundName}"? This action cannot be undone.`,
      async () => {
        try {
          const updatedRounds = evaluationRounds.filter(round => round.id !== id);
          setEvaluationRounds(updatedRounds);
          showToast(`Evaluation round "${round.roundName}" deleted successfully`, 'success');
          setShowMoreActions(null);
        } catch (error) {
          console.error('Failed to delete evaluation round:', error);
          showToast('Failed to delete evaluation round', 'error');
        }
      },
      "danger"
    );
  };

  // Handle viewing a round
  const handleViewRound = (round: EvaluationRound) => {
    setSelectedRound(round);
    setIsViewModalOpen(true);
    setShowMoreActions(null);
  };

  // Handle editing a round
  const handleEditRound = (round: EvaluationRound) => {
    setSelectedRound(round);
    setIsEditModalOpen(true);
    setShowMoreActions(null);
  };

  // Handle saving edited round
  const handleSaveEditedRound = (updatedData: Partial<EvaluationRound>) => {
    if (!selectedRound) return;

    try {
      const updatedRound = {
        ...selectedRound,
        ...updatedData,
        updatedAt: new Date()
      };

      const updatedRounds = evaluationRounds.map(r => 
        r.id === selectedRound.id ? updatedRound : r
      );
      
      setEvaluationRounds(updatedRounds);
      setIsEditModalOpen(false);
      setSelectedRound(null);
      showToast(`Evaluation round "${updatedRound.roundName}" updated successfully!`, 'success');
    } catch (error) {
      console.error('Failed to update evaluation round:', error);
      showToast('Failed to update evaluation round', 'error');
    }
  };

  // Handle duplicating a round
  const handleDuplicateRound = (round: EvaluationRound) => {
    try {
      const duplicatedRound: EvaluationRound = {
        ...round,
        id: Date.now().toString(),
        roundName: `${round.roundName} (Copy)`,
        status: 'Draft',
        createdAt: new Date(),
        updatedAt: new Date(),
        submissionCount: 0,
        averageScore: 0
      };
      
      const updatedRounds = [...evaluationRounds, duplicatedRound];
      setEvaluationRounds(updatedRounds);
      setShowMoreActions(null);
      showToast(`Evaluation round duplicated as "${duplicatedRound.roundName}"`, 'success');
    } catch (error) {
      console.error('Failed to duplicate evaluation round:', error);
      showToast('Failed to duplicate evaluation round', 'error');
    }
  };

  // Handle archiving a round
  const handleArchiveRound = (round: EvaluationRound) => {
    showConfirmDialog(
      'Archive Evaluation Round',
      `Are you sure you want to archive "${round.roundName}"? This will change its status to Cancelled.`,
      () => {
        try {
          const updatedRound = { ...round, status: 'Cancelled' as const, updatedAt: new Date() };
          const updatedRounds = evaluationRounds.map(r => r.id === round.id ? updatedRound : r);
          setEvaluationRounds(updatedRounds);
          setShowMoreActions(null);
          showToast(`Evaluation round "${round.roundName}" archived successfully`, 'info');
        } catch (error) {
          console.error('Failed to archive evaluation round:', error);
          showToast('Failed to archive evaluation round', 'error');
        }
      },
      "warning"
    );
  };

  // Handle exporting round data
  const handleExportRound = (round: EvaluationRound) => {
    try {
      const dataStr = JSON.stringify(round, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `evaluation-round-${round.id}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      setShowMoreActions(null);
      showToast(`Evaluation round "${round.roundName}" exported successfully`, 'success');
    } catch (error) {
      console.error('Failed to export evaluation round:', error);
      showToast('Failed to export evaluation round', 'error');
    }
  };

  // Filter rounds based on search and filters
  const filteredRounds = evaluationRounds.filter(round => {
    const matchesSearch = round.roundName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         round.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || round.status === statusFilter;
    const matchesPhase = phaseFilter === 'all' || round.phase === phaseFilter;
    
    return matchesSearch && matchesStatus && matchesPhase;
  });

  // Calculate stats
  const stats = {
    total: evaluationRounds.length,
    active: evaluationRounds.filter(r => r.status === 'Active').length,
    completed: evaluationRounds.filter(r => r.status === 'Completed').length,
    avgScore: evaluationRounds.filter(r => r.averageScore && r.averageScore > 0)
      .reduce((acc, r) => acc + (r.averageScore || 0), 0) / 
      evaluationRounds.filter(r => r.averageScore && r.averageScore > 0).length || 0
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">Loading evaluation rounds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Evaluation Rounds
            </h1>
            <p className="text-gray-600 text-lg">
              Manage and monitor your startup evaluation processes
            </p>
          </div>
          
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Round
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-700 hover:bg-red-100"
            >
              ×
            </Button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 border">
                Total
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-blue-600 text-sm font-medium">Evaluation Rounds</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <Badge className="bg-green-100 text-green-800 border-green-200 border">
                Live
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
              <p className="text-green-600 text-sm font-medium">Active Rounds</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <Badge className="bg-purple-100 text-purple-800 border-purple-200 border">
                Done
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
              <p className="text-purple-600 text-sm font-medium">Completed</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
              <Badge className="bg-amber-100 text-amber-800 border-amber-200 border">
                Avg
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-gray-900">{stats.avgScore.toFixed(1)}</p>
              <p className="text-amber-600 text-sm font-medium">Average Score</p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search rounds..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-lg"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <select
              value={phaseFilter}
              onChange={(e) => setPhaseFilter(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
            >
              <option value="all">All Phases</option>
              <option value="Application">Application</option>
              <option value="Screening">Screening</option>
              <option value="Pitch">Pitch</option>
              <option value="Demo">Demo</option>
              <option value="Due Diligence">Due Diligence</option>
              <option value="Final">Final</option>
            </select>
          </div>
        </div>

        {/* Evaluation Rounds Table */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-4 px-6 text-gray-700 font-semibold">Round Details</th>
                  <th className="text-left py-4 px-6 text-gray-700 font-semibold">Phase & Status</th>
                  <th className="text-left py-4 px-6 text-gray-700 font-semibold">Schedule</th>
                  <th className="text-left py-4 px-6 text-gray-700 font-semibold min-w-[140px]">Metrics</th>
                  <th className="text-left py-4 px-6 text-gray-700 font-semibold">Performance</th>
                  <th className="text-center py-4 px-6 text-gray-700 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRounds.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-600">
                      <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-semibold mb-2">No evaluation rounds found</p>
                      <p className="text-sm">Create your first evaluation round to get started</p>
                    </td>
                  </tr>
                ) : (
                  filteredRounds.map((round) => (
                    <tr 
                      key={round.id} 
                      className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-200"
                    >
                      {/* Round Details */}
                      <td className="py-6 px-6">
                        <div className="space-y-2">
                          <h3 className="text-gray-900 font-semibold text-lg leading-tight">
                            {round.roundName}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {round.description || 'No description provided'}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            Created {format(round.createdAt, 'MMM d, yyyy')}
                          </div>
                        </div>
                      </td>

                      {/* Phase & Status */}
                      <td className="py-6 px-6">
                        <div className="space-y-3">
                          <Badge 
                            className={`${
                              round.phase === 'Application' ? 'bg-blue-100 text-blue-800 border-blue-200 border' :
                              round.phase === 'Screening' ? 'bg-amber-100 text-amber-800 border-amber-200 border' :
                              round.phase === 'Pitch' ? 'bg-purple-100 text-purple-800 border-purple-200 border' :
                              round.phase === 'Demo' ? 'bg-indigo-100 text-indigo-800 border-indigo-200 border' :
                              round.phase === 'Due Diligence' ? 'bg-orange-100 text-orange-800 border-orange-200 border' :
                              'bg-green-100 text-green-800 border-green-200 border'
                            } px-3 py-1 rounded-lg text-xs font-medium`}
                          >
                            {round.phase}
                          </Badge>
                          <div className="flex items-center gap-2">
                            {round.status === 'Active' && <Activity className="w-4 h-4 text-green-600" />}
                            {round.status === 'Completed' && <CheckCircle className="w-4 h-4 text-blue-600" />}
                            {round.status === 'Draft' && <Clock className="w-4 h-4 text-amber-600" />}
                            {round.status === 'Cancelled' && <AlertCircle className="w-4 h-4 text-red-600" />}
                            <span className={`text-sm font-medium ${
                              round.status === 'Active' ? 'text-green-700' :
                              round.status === 'Completed' ? 'text-blue-700' :
                              round.status === 'Draft' ? 'text-amber-700' :
                              'text-red-700'
                            }`}>
                              {round.status}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Schedule */}
                      <td className="py-6 px-6">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span>{format(round.scheduledAt, 'MMM d, yyyy')}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <Clock className="w-4 h-4 text-orange-600" />
                            <span>{format(round.scheduledAt, 'HH:mm')}</span>
                          </div>
                          {round.evaluationDeadline && (
                            <div className="text-xs text-gray-500">
                              Deadline: {format(round.evaluationDeadline, 'MMM d')}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Metrics */}
                      <td className="py-6 px-6 min-w-[140px]">
                        <div className="space-y-2">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center">
                            <div className="text-blue-600 font-semibold text-sm">{round.submissionCount || 0}</div>
                            <div className="text-blue-500 text-xs">Submissions</div>
                          </div>
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 text-center">
                            <div className="text-purple-600 font-semibold text-sm">{round.evaluatorCount || 0}</div>
                            <div className="text-purple-500 text-xs">Evaluators</div>
                          </div>
                          <div className="text-xs text-gray-500 text-center">
                            {round.criteriaCount || 0} criteria • {round.evaluationPeriod}d
                          </div>
                        </div>
                      </td>

                      {/* Performance */}
                      <td className="py-6 px-6">
                        <div className="space-y-2">
                          {round.averageScore && round.averageScore > 0 ? (
                            <>
                              <div className="flex items-center gap-2">
                                <Star className="w-4 h-4 text-amber-500" />
                                <span className="text-gray-900 font-semibold">
                                  {round.averageScore.toFixed(1)}
                                </span>
                                <span className="text-gray-500 text-sm">/ {round.maxScore}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${(round.averageScore / round.maxScore) * 100}%` }}
                                ></div>
                              </div>
                            </>
                          ) : (
                            <div className="text-gray-500 text-sm">No scores yet</div>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-6 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleViewRound(round)}
                            title="View Details"
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-2 transition-all duration-200 shadow-sm"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            size="sm"
                            onClick={() => handleEditRound(round)}
                            title="Edit Round"
                            className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-3 py-2 transition-all duration-200 shadow-sm"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>

                          <div className="relative more-actions-dropdown">
                            <Button
                              size="sm"
                              onClick={() => setShowMoreActions(showMoreActions === round.id ? null : round.id)}
                              title="More Actions"
                              className={`${
                                showMoreActions === round.id
                                  ? 'bg-gray-400 shadow-sm'
                                  : 'bg-gray-600 hover:bg-gray-700 shadow-sm'
                              } text-white rounded-lg px-3 py-2 transition-all duration-200`}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>

                            {showMoreActions === round.id && (
                              <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                                <div className="py-2">
                                  <button
                                    onClick={() => handleDuplicateRound(round)}
                                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 flex items-center gap-3"
                                  >
                                    <Copy className="w-4 h-4" />
                                    <span>Duplicate</span>
                                  </button>
                                  <button
                                    onClick={() => handleArchiveRound(round)}
                                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-all duration-200 flex items-center gap-3"
                                  >
                                    <Archive className="w-4 h-4" />
                                    <span>Archive</span>
                                  </button>
                                  <button
                                    onClick={() => handleExportRound(round)}
                                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-700 transition-all duration-200 flex items-center gap-3"
                                  >
                                    <Download className="w-4 h-4" />
                                    <span>Export</span>
                                  </button>
                                  <div className="border-t border-gray-200 my-2"></div>
                                  <button
                                    onClick={() => handleDeleteRound(round.id)}
                                    className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 flex items-center gap-3"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Evaluation Modal */}
        {isModalOpen && (
          <CreateEvaluationModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setError(null);
            }}
            onSubmit={handleCreateEvaluation}
          />
        )}

        {/* View Round Modal */}
        <ViewRoundModal
          round={selectedRound}
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedRound(null);
          }}
        />

        {/* Edit Round Modal */}
        <EditRoundModal
          round={selectedRound}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedRound(null);
          }}
          onSave={handleSaveEditedRound}
        />

        {/* Confirmation Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
          variant={confirmDialog.variant}
        />

        {/* Toast Notification */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
}
