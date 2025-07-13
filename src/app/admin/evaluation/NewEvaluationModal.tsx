"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Sparkles, 
  Calendar, 
  Target, 
  Settings, 
  Eye,
  Zap,
  Trophy,
  Star,
  Clock,
  Users,
  FileText,
  Shield,
  DollarSign,
  Briefcase,
  Building,
  TrendingUp,
  Mail,
  Globe,
  Info,
  Plus,
  Minus,
  PieChart,
  Code,
  Database
} from "lucide-react";

interface EvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

interface Criteria {
  name: string;
  weight: number;
  description: string;
}

interface Prize {
  name: string;
  value: string;
  description: string;
}

// ===============================================
// ADVANCED 5-STEP INCUBATOR PRO EVALUATION MODAL
// ===============================================

function NewEvaluationModal({ isOpen, onClose, onSubmit }: EvaluationModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5; // Advanced 5-step process
  
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    roundName: '',
    description: '',
    category: 'General' as const,
    tags: [] as string[],
    language: 'English' as const,
    timezone: 'UTC' as const,
    
    // Step 2: Timeline & Scheduling
    phase: 'Application' as const,
    startDate: '',
    endDate: '',
    evaluationDeadline: '',
    evaluationPeriod: 14,
    applicationDeadline: '',
    notificationDate: '',
    
    // Step 3: Criteria & Requirements
    maxScore: 100,
    minimumScore: 60,
    passingGrade: 70,
    scoringMethod: 'weighted' as const,
    weightedCriteria: [
      { name: 'Innovation & Technology', weight: 25, description: 'Novelty and technical excellence' },
      { name: 'Market Opportunity', weight: 20, description: 'Market size and potential' },
      { name: 'Business Model', weight: 20, description: 'Revenue model and sustainability' },
      { name: 'Team Capability', weight: 15, description: 'Team experience and skills' },
      { name: 'Financial Projections', weight: 10, description: 'Financial planning and metrics' },
      { name: 'Presentation Quality', weight: 10, description: 'Communication and presentation' }
    ],
    requiredDocuments: [] as string[],
    allowedSubmissionTypes: ['Pitch Deck'] as string[],
    maxFileSize: 10,
    allowedFileTypes: ['pdf', 'pptx', 'docx'] as string[],
    
    // Step 4: Evaluators & Access
    evaluatorRoles: [] as string[],
    evaluatorCount: 3,
    blindEvaluation: true,
    evaluatorInstructions: '',
    autoAssignEvaluators: true,
    evaluatorDeadline: '',
    allowSelfNomination: false,
    requireEvaluatorJustification: true,
    
    // Step 5: Advanced Settings
    autoAdvance: false,
    autoReject: false,
    allowResubmission: true,
    resubmissionLimit: 2,
    sendNotifications: true,
    publicResults: false,
    generateReports: true,
    enableFeedback: true,
    allowAppeals: true,
    appealDeadline: '',
    industry: [] as string[],
    fundingStage: [] as string[],
    eligibilityCriteria: [] as string[],
    prizes: [] as { name: string; value: string; description: string }[],
    mentorshipOffered: false,
    networkingEvents: false,
    followUpActions: [] as string[]
  });

  // Enhanced step validation - DEFINED BEFORE ANY useEffect
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1: // Basic Information
        return formData.roundName.trim().length > 0 && formData.description.trim().length > 0;
      case 2: // Timeline & Phases
        return formData.startDate !== '' && formData.endDate !== '';
      case 3: // Criteria & Requirements
        return formData.weightedCriteria.length > 0;
      case 4: // Evaluators & Process
        return formData.evaluatorCount > 0;
      case 5: // Advanced Settings
        return true; // Always valid as it contains optional settings
      default:
        return false;
    }
  };





  // Enhanced keyboard navigation (MUST be before early return)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      
      // Close modal with Escape
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      // Check if current step is valid before proceeding
      if (isStepValid(currentStep)) {
        setCurrentStep(currentStep + 1);
      } else {
        // You could add a toast notification here for better UX
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
    setCurrentStep(1);
    // Reset form to initial state
    setFormData({
      roundName: '',
      description: '',
      category: 'General',
      tags: [],
      language: 'English',
      timezone: 'UTC',
      phase: 'Application',
      startDate: '',
      endDate: '',
      evaluationDeadline: '',
      evaluationPeriod: 14,
      applicationDeadline: '',
      notificationDate: '',
      maxScore: 100,
      minimumScore: 60,
      passingGrade: 70,
      scoringMethod: 'weighted',
      weightedCriteria: [
        { name: 'Innovation & Technology', weight: 25, description: 'Novelty and technical excellence' },
        { name: 'Market Opportunity', weight: 20, description: 'Market size and potential' },
        { name: 'Business Model', weight: 20, description: 'Revenue model and sustainability' },
        { name: 'Team Capability', weight: 15, description: 'Team experience and skills' },
        { name: 'Financial Projections', weight: 10, description: 'Financial planning and metrics' },
        { name: 'Presentation Quality', weight: 10, description: 'Communication and presentation' }
      ],
      requiredDocuments: [],
      allowedSubmissionTypes: ['Pitch Deck'],
      maxFileSize: 10,
      allowedFileTypes: ['pdf', 'pptx', 'docx'],
      evaluatorRoles: [],
      evaluatorCount: 3,
      blindEvaluation: true,
      evaluatorInstructions: '',
      autoAssignEvaluators: true,
      evaluatorDeadline: '',
      allowSelfNomination: false,
      requireEvaluatorJustification: true,
      autoAdvance: false,
      autoReject: false,
      allowResubmission: true,
      resubmissionLimit: 2,
      sendNotifications: true,
      publicResults: false,
      generateReports: true,
      enableFeedback: true,
      allowAppeals: true,
      appealDeadline: '',
      industry: [],
      fundingStage: [],
      eligibilityCriteria: [],
      prizes: [],
      mentorshipOffered: false,
      networkingEvents: false,
      followUpActions: []
    });
  };

  const stepConfig = [
    { 
      title: "Basic Info", 
      icon: Sparkles, 
      color: "from-purple-500 to-pink-500",
      description: "Round details and categorization"
    },
    { 
      title: "Timeline", 
      icon: Calendar, 
      color: "from-blue-500 to-cyan-500",
      description: "Scheduling and deadlines"
    },
    { 
      title: "Criteria", 
      icon: Target, 
      color: "from-orange-500 to-red-500",
      description: "Scoring and requirements"
    },
    { 
      title: "Evaluators", 
      icon: Users, 
      color: "from-green-500 to-emerald-500",
      description: "Evaluation team setup"
    },
    { 
      title: "Advanced", 
      icon: Settings, 
      color: "from-indigo-500 to-purple-500",
      description: "Final configuration"
    }
  ];

  // Helper functions
  const addCriteria = () => {
    setFormData({
      ...formData,
      weightedCriteria: [
        ...formData.weightedCriteria,
        { name: '', weight: 0, description: '' }
      ]
    });
  };

  const removeCriteria = (index: number) => {
    setFormData({
      ...formData,
      weightedCriteria: formData.weightedCriteria.filter((_, i) => i !== index)
    });
  };

  const updateCriteria = (index: number, field: string, value: any) => {
    const updated = [...formData.weightedCriteria];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({
      ...formData,
      weightedCriteria: updated
    });
  };

  const addPrize = () => {
    setFormData({
      ...formData,
      prizes: [
        ...formData.prizes,
        { name: '', value: '', description: '' }
      ]
    });
  };

  const removePrize = (index: number) => {
    setFormData({
      ...formData,
      prizes: formData.prizes.filter((_, i) => i !== index)
    });
  };

  const updatePrize = (index: number, field: string, value: string) => {
    const updated = [...formData.prizes];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({
      ...formData,
      prizes: updated
    });
  };

  const toggleArrayItem = (array: string[], item: string, setter: (arr: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item));
    } else {
      setter([...array, item]);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4 shadow-lg">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Round Information</h3>
              <p className="text-gray-600">Set up the foundation of your evaluation round</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label htmlFor="roundName" className="text-gray-700 font-medium mb-2 block">
                  Round Name *
                </Label>
                <Input
                  id="roundName"
                  value={formData.roundName}
                  onChange={(e) => setFormData({ ...formData, roundName: e.target.value })}
                  placeholder="e.g., Q1 2024 FinTech Innovation Challenge"
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 backdrop-blur-sm transition-all duration-300 shadow-sm hover:shadow-md"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category" className="text-gray-700 font-medium mb-2 block">
                  <Building className="inline h-4 w-4 mr-1" />
                  Category
                </Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 backdrop-blur-sm transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <option value="General">🌐 General Innovation</option>
                  <option value="Technology">💻 Technology & Software</option>
                  <option value="FinTech">💰 Financial Technology</option>
                  <option value="HealthTech">🏥 Health & Medical</option>
                  <option value="EdTech">📚 Education Technology</option>
                  <option value="Sustainability">🌱 Sustainability & Green Tech</option>
                  <option value="Social Impact">❤️ Social Impact</option>
                  <option value="Hardware">🔧 Hardware & IoT</option>
                </select>
              </div>

              <div>
                <Label htmlFor="language" className="text-gray-700 font-medium mb-2 block">
                  <Globe className="inline h-4 w-4 mr-1" />
                  Language
                </Label>
                <select
                  id="language"
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value as any })}
                  className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 backdrop-blur-sm transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <option value="English">🇺🇸 English</option>
                  <option value="Spanish">🇪🇸 Spanish</option>
                  <option value="French">🇫🇷 French</option>
                  <option value="German">🇩🇪 German</option>
                  <option value="Mandarin">🇨🇳 Mandarin</option>
                  <option value="Portuguese">🇧🇷 Portuguese</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="description" className="text-gray-700 font-medium mb-2 block">
                  Description & Objectives
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the evaluation round goals, target participants, key objectives, and what makes this round unique..."
                  rows={4}
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 backdrop-blur-sm transition-all duration-300 resize-none shadow-sm hover:shadow-md"
                />
              </div>

              <div className="md:col-span-2">
                <Label className="text-gray-700 font-medium mb-3 block">
                  <Star className="inline h-4 w-4 mr-1" />
                  Industry Focus (Select all that apply)
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    'FinTech', 'HealthTech', 'EdTech', 'AgriTech', 'CleanTech', 'IoT', 'AI/ML', 'Blockchain',
                    'E-commerce', 'Gaming', 'Media', 'Real Estate', 'Transportation', 'Food & Beverage', 'Fashion', 'Sports'
                  ].map((industry) => (
                    <label key={industry} className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg border border-blue-200 hover:border-blue-400 hover:bg-blue-100 transition-colors cursor-pointer shadow-sm">
                      <input
                        type="checkbox"
                        checked={formData.industry.includes(industry)}
                        onChange={() => toggleArrayItem(formData.industry, industry, (arr) => setFormData({ ...formData, industry: arr }))}
                        className="rounded border-gray-300 text-blue-500 focus:ring-blue-500/20"
                      />
                      <span className="text-gray-700 text-sm">{industry}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mb-4 shadow-lg">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Timeline & Scheduling</h3>
              <p className="text-gray-600">Configure all important dates and deadlines</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="phase" className="text-gray-700 font-medium mb-2 block">
                  <Target className="inline h-4 w-4 mr-1" />
                  Evaluation Phase
                </Label>
                <select
                  id="phase"
                  value={formData.phase}
                  onChange={(e) => setFormData({ ...formData, phase: e.target.value as any })}
                  className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 backdrop-blur-sm transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <option value="Application">📋 Application Review</option>
                  <option value="Screening">🔍 Initial Screening</option>
                  <option value="Pitch">🎤 Pitch Presentation</option>
                  <option value="Demo">🖥️ Product Demo</option>
                  <option value="Due Diligence">📊 Due Diligence</option>
                  <option value="Final">🏆 Final Evaluation</option>
                </select>
              </div>

              <div>
                <Label htmlFor="evaluationPeriod" className="text-gray-700 font-medium mb-2 block">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Evaluation Period (days)
                </Label>
                <Input
                  id="evaluationPeriod"
                  type="number"
                  value={formData.evaluationPeriod}
                  onChange={(e) => setFormData({ ...formData, evaluationPeriod: parseInt(e.target.value) || 1 })}
                  min="1"
                  max="90"
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 backdrop-blur-sm transition-all duration-300 shadow-sm hover:shadow-md"
                />
              </div>

              <div>
                <Label htmlFor="startDate" className="text-gray-700 font-medium mb-2 block">
                  Round Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 backdrop-blur-sm transition-all duration-300 shadow-sm hover:shadow-md"
                />
              </div>

              <div>
                <Label htmlFor="endDate" className="text-gray-700 font-medium mb-2 block">
                  Round End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 backdrop-blur-sm transition-all duration-300 shadow-sm hover:shadow-md"
                />
              </div>

              <div>
                <Label htmlFor="applicationDeadline" className="text-gray-700 font-medium mb-2 block">
                  Application Deadline
                </Label>
                <Input
                  id="applicationDeadline"
                  type="datetime-local"
                  value={formData.applicationDeadline}
                  onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                  className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 backdrop-blur-sm transition-all duration-300 shadow-sm hover:shadow-md"
                />
              </div>

              <div>
                <Label htmlFor="evaluationDeadline" className="text-gray-700 font-medium mb-2 block">
                  Evaluation Deadline
                </Label>
                <Input
                  id="evaluationDeadline"
                  type="datetime-local"
                  value={formData.evaluationDeadline}
                  onChange={(e) => setFormData({ ...formData, evaluationDeadline: e.target.value })}
                  className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 backdrop-blur-sm transition-all duration-300 shadow-sm hover:shadow-md"
                />
              </div>

              <div>
                <Label htmlFor="notificationDate" className="text-gray-700 font-medium mb-2 block">
                  Results Notification Date
                </Label>
                <Input
                  id="notificationDate"
                  type="date"
                  value={formData.notificationDate}
                  onChange={(e) => setFormData({ ...formData, notificationDate: e.target.value })}
                  className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 backdrop-blur-sm transition-all duration-300 shadow-sm hover:shadow-md"
                />
              </div>

              <div>
                <Label htmlFor="timezone" className="text-gray-700 font-medium mb-2 block">
                  Timezone
                </Label>
                <select
                  id="timezone"
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value as any })}
                  className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 backdrop-blur-sm transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <option value="UTC">🌍 UTC (Coordinated Universal Time)</option>
                  <option value="EST">🇺🇸 EST (Eastern Standard Time)</option>
                  <option value="PST">🇺🇸 PST (Pacific Standard Time)</option>
                  <option value="GMT">🇬🇧 GMT (Greenwich Mean Time)</option>
                  <option value="CET">🇪🇺 CET (Central European Time)</option>
                  <option value="JST">🇯🇵 JST (Japan Standard Time)</option>
                  <option value="IST">🇮🇳 IST (India Standard Time)</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-blue-800 font-medium">Timeline Tips</h4>
                  <p className="text-gray-700 text-sm mt-1">
                    Allow sufficient time between deadlines. Recommended: 2-3 days between application deadline and evaluation start, 
                    1 week for evaluation period, and 2-3 days for result compilation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mb-4 shadow-lg">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Criteria & Requirements</h3>
              <p className="text-gray-600">Define scoring criteria and submission requirements</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="maxScore" className="text-gray-700 font-medium mb-2 block">
                  <Trophy className="inline h-4 w-4 mr-1" />
                  Maximum Score
                </Label>
                <Input
                  id="maxScore"
                  type="number"
                  value={formData.maxScore}
                  onChange={(e) => setFormData({ ...formData, maxScore: parseInt(e.target.value) || 100 })}
                  min="1"
                  max="1000"
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 backdrop-blur-sm transition-all duration-300 shadow-sm hover:shadow-md"
                />
              </div>
              
              <div>
                <Label htmlFor="minimumScore" className="text-gray-700 font-medium mb-2 block">
                  <Zap className="inline h-4 w-4 mr-1" />
                  Minimum Score
                </Label>
                <Input
                  id="minimumScore"
                  type="number"
                  value={formData.minimumScore}
                  onChange={(e) => setFormData({ ...formData, minimumScore: parseInt(e.target.value) || 0 })}
                  min="0"
                  max={formData.maxScore}
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 backdrop-blur-sm transition-all duration-300 shadow-sm hover:shadow-md"
                />
              </div>

              <div>
                <Label htmlFor="passingGrade" className="text-gray-700 font-medium mb-2 block">
                  <Star className="inline h-4 w-4 mr-1" />
                  Passing Grade
                </Label>
                <Input
                  id="passingGrade"
                  type="number"
                  value={formData.passingGrade}
                  onChange={(e) => setFormData({ ...formData, passingGrade: parseInt(e.target.value) || 70 })}
                  min={formData.minimumScore}
                  max={formData.maxScore}
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 backdrop-blur-sm transition-all duration-300 shadow-sm hover:shadow-md"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="scoringMethod" className="text-gray-700 font-medium mb-2 block">
                <Settings className="inline h-4 w-4 mr-1" />
                Scoring Method
              </Label>
              <select
                id="scoringMethod"
                value={formData.scoringMethod}
                onChange={(e) => setFormData({ ...formData, scoringMethod: e.target.value as any })}
                className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 backdrop-blur-sm transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <option value="weighted">⚖️ Weighted Average (Recommended)</option>
                <option value="simple">➕ Simple Average</option>
                <option value="consensus">🤝 Consensus Based</option>
                <option value="median">📊 Median Score</option>
              </select>
            </div>
            
            {formData.scoringMethod === 'weighted' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-gray-700 font-medium">
                    <PieChart className="inline h-4 w-4 mr-1" />
                    Weighted Criteria (Total: {formData.weightedCriteria.reduce((sum, c) => sum + c.weight, 0)}%)
                  </Label>
                  <Button
                    type="button"
                    onClick={addCriteria}
                    size="sm"
                    className="bg-orange-100 hover:bg-orange-200 text-orange-700 border border-orange-300 shadow-sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Criteria
                  </Button>
                </div>
                
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {formData.weightedCriteria.map((criteria, index) => (
                    <div key={index} className="p-4 bg-orange-50 rounded-lg border border-orange-200 shadow-sm">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                        <div className="md:col-span-4">
                          <Label className="text-gray-600 text-xs mb-1 block">Criteria Name</Label>
                          <Input
                            value={criteria.name}
                            onChange={(e) => updateCriteria(index, 'name', e.target.value)}
                            placeholder="e.g., Innovation & Technology"
                            className="bg-white border-gray-300 text-gray-900 text-sm shadow-sm"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label className="text-gray-600 text-xs mb-1 block">Weight (%)</Label>
                          <Input
                            type="number"
                            value={criteria.weight}
                            onChange={(e) => updateCriteria(index, 'weight', parseInt(e.target.value) || 0)}
                            min="0"
                            max="100"
                            className="bg-white border-gray-300 text-gray-900 text-sm shadow-sm"
                          />
                        </div>
                        <div className="md:col-span-5">
                          <Label className="text-gray-600 text-xs mb-1 block">Description</Label>
                          <Input
                            value={criteria.description}
                            onChange={(e) => updateCriteria(index, 'description', e.target.value)}
                            placeholder="Brief description..."
                            className="bg-white border-gray-300 text-gray-900 text-sm shadow-sm"
                          />
                        </div>
                        <div className="md:col-span-1">
                          <Button
                            type="button"
                            onClick={() => removeCriteria(index)}
                            size="sm"
                            variant="outline"
                            className="w-full text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

              <div>
                <Label className="text-gray-700 text-sm font-medium mb-2 block">Required Documents</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['Pitch Deck', 'Business Plan', 'Executive Summary', 'Financial Projections', 'Technical Documentation', 'Product Demo Video', 'Team Bios', 'Market Research'].map((doc) => (
                    <label key={doc} className="flex items-center space-x-2 text-sm p-2 bg-orange-50 rounded-lg border border-orange-200 hover:border-orange-400 hover:bg-orange-100 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.requiredDocuments.includes(doc)}
                        onChange={() => toggleArrayItem(formData.requiredDocuments, doc, (arr) => setFormData({ ...formData, requiredDocuments: arr }))}
                        className="rounded border-gray-300 text-orange-500 focus:ring-orange-500/20"
                      />
                      <span className="text-gray-700">{doc}</span>
                    </label>
                  ))}
                </div>
              </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="maxFileSize" className="text-gray-700 font-medium mb-2 block">
                  <Database className="inline h-4 w-4 mr-1" />
                  Max File Size (MB)
                </Label>
                <Input
                  id="maxFileSize"
                  type="number"
                  value={formData.maxFileSize}
                  onChange={(e) => setFormData({ ...formData, maxFileSize: parseInt(e.target.value) || 10 })}
                  min="1"
                  max="100"
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 backdrop-blur-sm transition-all duration-300 shadow-sm hover:shadow-md"
                />
              </div>

              <div>
                <Label className="text-gray-700 font-medium mb-2 block">
                  <Code className="inline h-4 w-4 mr-1" />
                  Allowed File Types
                </Label>
                <div className="flex flex-wrap gap-2">
                  {['pdf', 'docx', 'pptx', 'xlsx', 'jpg', 'png', 'mp4', 'zip'].map((type) => (
                    <label key={type} className="flex items-center space-x-2 px-3 py-1 bg-orange-50 rounded-full border border-orange-200 hover:border-orange-400 hover:bg-orange-100 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.allowedFileTypes.includes(type)}
                        onChange={() => {
                          const newTypes = formData.allowedFileTypes.includes(type) 
                            ? formData.allowedFileTypes.filter(t => t !== type)
                            : [...formData.allowedFileTypes, type];
                          setFormData({ ...formData, allowedFileTypes: newTypes });
                        }}
                        className="rounded border-gray-300 text-orange-500 focus:ring-orange-500/20"
                      />
                      <span className="text-gray-700 text-xs uppercase">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4 shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Evaluators & Access</h3>
              <p className="text-gray-600">Configure evaluation team and access controls</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="evaluatorCount" className="text-gray-700 font-medium mb-2 block">
                  <Users className="inline h-4 w-4 mr-1" />
                  Number of Evaluators
                </Label>
                <Input
                  id="evaluatorCount"
                  type="number"
                  value={formData.evaluatorCount}
                  onChange={(e) => setFormData({ ...formData, evaluatorCount: parseInt(e.target.value) || 1 })}
                  min="1"
                  max="20"
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 backdrop-blur-sm transition-all duration-300 shadow-sm hover:shadow-md"
                />
              </div>

              <div>
                <Label htmlFor="evaluatorDeadline" className="text-gray-700 font-medium mb-2 block">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Evaluator Deadline
                </Label>
                <Input
                  id="evaluatorDeadline"
                  type="datetime-local"
                  value={formData.evaluatorDeadline}
                  onChange={(e) => setFormData({ ...formData, evaluatorDeadline: e.target.value })}
                  className="bg-white border-gray-300 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 backdrop-blur-sm transition-all duration-300 shadow-sm hover:shadow-md"
                />
              </div>
            </div>

              <div>
                <Label className="text-gray-700 text-sm font-medium mb-2 block">Evaluator Roles</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['Industry Expert', 'Technical Reviewer', 'Business Analyst', 'Financial Advisor', 'Market Specialist', 'Product Manager', 'Venture Capitalist', 'Academic Researcher'].map((role) => (
                    <label key={role} className="flex items-center space-x-2 text-sm p-2 bg-green-50 rounded-lg border border-green-200 hover:border-green-400 hover:bg-green-100 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.evaluatorRoles.includes(role)}
                        onChange={() => toggleArrayItem(formData.evaluatorRoles, role, (arr) => setFormData({ ...formData, evaluatorRoles: arr }))}
                        className="rounded border-gray-300 text-green-500 focus:ring-green-500/20"
                      />
                      <span className="text-gray-700">{role}</span>
                    </label>
                  ))}
                </div>
              </div>

            <div>
              <Label htmlFor="evaluatorInstructions" className="text-gray-700 font-medium mb-2 block">
                <FileText className="inline h-4 w-4 mr-1" />
                Instructions for Evaluators
              </Label>
              <Textarea
                id="evaluatorInstructions"
                value={formData.evaluatorInstructions}
                onChange={(e) => setFormData({ ...formData, evaluatorInstructions: e.target.value })}
                placeholder="Provide detailed instructions for evaluators including evaluation criteria, expectations, and any specific guidelines..."
                rows={4}
                className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 backdrop-blur-sm transition-all duration-300 resize-none shadow-sm hover:shadow-md"
              />
            </div>

            <div className="space-y-4">
              <h4 className="text-gray-900 font-semibold flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Evaluation Settings
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg shadow-sm">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.blindEvaluation}
                      onChange={(e) => setFormData({ ...formData, blindEvaluation: e.target.checked })}
                      className="rounded border-gray-300 text-green-500 focus:ring-green-500/20"
                    />
                    <div>
                      <span className="text-gray-900 font-medium">Blind Evaluation</span>
                      <p className="text-gray-600 text-sm">Hide applicant identities from evaluators</p>
                    </div>
                  </label>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg shadow-sm">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.autoAssignEvaluators}
                      onChange={(e) => setFormData({ ...formData, autoAssignEvaluators: e.target.checked })}
                      className="rounded border-gray-300 text-green-500 focus:ring-green-500/20"
                    />
                    <div>
                      <span className="text-gray-900 font-medium">Auto-assign Evaluators</span>
                      <p className="text-gray-600 text-sm">Automatically assign based on expertise</p>
                    </div>
                  </label>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg shadow-sm">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allowSelfNomination}
                      onChange={(e) => setFormData({ ...formData, allowSelfNomination: e.target.checked })}
                      className="rounded border-gray-300 text-green-500 focus:ring-green-500/20"
                    />
                    <div>
                      <span className="text-gray-900 font-medium">Allow Self-nomination</span>
                      <p className="text-gray-600 text-sm">Let experts nominate themselves as evaluators</p>
                    </div>
                  </label>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg shadow-sm">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.requireEvaluatorJustification}
                      onChange={(e) => setFormData({ ...formData, requireEvaluatorJustification: e.target.checked })}
                      className="rounded border-gray-300 text-green-500 focus:ring-green-500/20"
                    />
                    <div>
                      <span className="text-gray-900 font-medium">Require Justification</span>
                      <p className="text-gray-600 text-sm">Evaluators must justify their scores</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mb-4 shadow-lg">
                <Settings className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Advanced Configuration</h3>
              <p className="text-gray-600">Final settings and review your evaluation round</p>
            </div>
            
            <div className="space-y-6">
              {/* Process Settings */}
              <div>
                <h4 className="text-gray-900 font-semibold mb-4 flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Process Automation
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg shadow-sm">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.autoAdvance}
                        onChange={(e) => setFormData({ ...formData, autoAdvance: e.target.checked })}
                        className="rounded border-gray-300 text-indigo-500 focus:ring-indigo-500/20"
                      />
                      <div>
                        <span className="text-gray-900 font-medium">Auto-advance Participants</span>
                        <p className="text-gray-600 text-sm">Automatically advance qualifying participants</p>
                      </div>
                    </label>
                  </div>

                  <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg shadow-sm">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.autoReject}
                        onChange={(e) => setFormData({ ...formData, autoReject: e.target.checked })}
                        className="rounded border-gray-300 text-indigo-500 focus:ring-indigo-500/20"
                      />
                      <div>
                        <span className="text-gray-900 font-medium">Auto-reject Below Minimum</span>
                        <p className="text-gray-600 text-sm">Automatically reject below minimum score</p>
                      </div>
                    </label>
                  </div>

                  <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg shadow-sm">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.allowResubmission}
                        onChange={(e) => setFormData({ ...formData, allowResubmission: e.target.checked })}
                        className="rounded border-gray-300 text-indigo-500 focus:ring-indigo-500/20"
                      />
                      <div>
                        <span className="text-gray-900 font-medium">Allow Resubmission</span>
                        <p className="text-gray-600 text-sm">Participants can resubmit if needed</p>
                      </div>
                    </label>
                  </div>

                  <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg shadow-sm">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.sendNotifications}
                        onChange={(e) => setFormData({ ...formData, sendNotifications: e.target.checked })}
                        className="rounded border-gray-300 text-indigo-500 focus:ring-indigo-500/20"
                      />
                      <div>
                        <span className="text-gray-900 font-medium">Send Notifications</span>
                        <p className="text-gray-600 text-sm">Email notifications for status updates</p>
                      </div>
                    </label>
                  </div>
                </div>

                {formData.allowResubmission && (
                  <div className="mt-4">
                    <Label htmlFor="resubmissionLimit" className="text-gray-700 font-medium mb-2 block">
                      Resubmission Limit
                    </Label>
                    <Input
                      id="resubmissionLimit"
                      type="number"
                      value={formData.resubmissionLimit}
                      onChange={(e) => setFormData({ ...formData, resubmissionLimit: parseInt(e.target.value) || 1 })}
                      min="1"
                      max="5"
                      className="bg-white border-gray-300 text-gray-900 w-32 shadow-sm"
                    />
                  </div>
                )}
              </div>

              {/* Outcomes & Follow-up */}
              <div>
                <h4 className="text-gray-900 font-semibold mb-4 flex items-center">
                  <Trophy className="h-5 w-5 mr-2" />
                  Outcomes & Incentives
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-gray-700 font-medium">
                        <DollarSign className="inline h-4 w-4 mr-1" />
                        Prizes & Awards
                      </Label>
                      <Button
                        type="button"
                        onClick={addPrize}
                        size="sm"
                        className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 border border-indigo-300 shadow-sm"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Prize
                      </Button>
                    </div>
                    
                    {formData.prizes.length > 0 && (
                      <div className="space-y-3">
                        {formData.prizes.map((prize, index) => (
                          <div key={index} className="p-4 bg-indigo-50 rounded-lg border border-indigo-200 shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                              <div className="md:col-span-3">
                                <Label className="text-gray-600 text-xs mb-1 block">Prize Name</Label>
                                <Input
                                  value={prize.name}
                                  onChange={(e) => updatePrize(index, 'name', e.target.value)}
                                  placeholder="e.g., First Place"
                                  className="bg-white border-gray-300 text-gray-900 text-sm shadow-sm"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <Label className="text-gray-600 text-xs mb-1 block">Value</Label>
                                <Input
                                  value={prize.value}
                                  onChange={(e) => updatePrize(index, 'value', e.target.value)}
                                  placeholder="$10,000"
                                  className="bg-white border-gray-300 text-gray-900 text-sm shadow-sm"
                                />
                              </div>
                              <div className="md:col-span-6">
                                <Label className="text-gray-600 text-xs mb-1 block">Description</Label>
                                <Input
                                  value={prize.description}
                                  onChange={(e) => updatePrize(index, 'description', e.target.value)}
                                  placeholder="Prize description..."
                                  className="bg-white border-gray-300 text-gray-900 text-sm shadow-sm"
                                />
                              </div>
                              <div className="md:col-span-1">
                                <Button
                                  type="button"
                                  onClick={() => removePrize(index)}
                                  size="sm"
                                  variant="outline"
                                  className="w-full text-red-600 border-red-300 hover:bg-red-50"
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg shadow-sm">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.mentorshipOffered}
                          onChange={(e) => setFormData({ ...formData, mentorshipOffered: e.target.checked })}
                          className="rounded border-gray-300 text-indigo-500 focus:ring-indigo-500/20"
                        />
                        <div>
                          <span className="text-gray-900 font-medium">Mentorship Program</span>
                          <p className="text-gray-600 text-sm">Offer mentorship to participants</p>
                        </div>
                      </label>
                    </div>

                    <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg shadow-sm">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.networkingEvents}
                          onChange={(e) => setFormData({ ...formData, networkingEvents: e.target.checked })}
                          className="rounded border-gray-300 text-indigo-500 focus:ring-indigo-500/20"
                        />
                        <div>
                          <span className="text-gray-900 font-medium">Networking Events</span>
                          <p className="text-gray-600 text-sm">Host networking sessions</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Review */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 backdrop-blur-sm border border-blue-200 rounded-xl p-6 shadow-lg">
                <h4 className="text-gray-900 font-semibold mb-4 flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Configuration Summary
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div className="p-3 bg-purple-100 border border-purple-200 rounded-lg shadow-sm">
                    <h5 className="text-purple-700 font-medium mb-2">Basic Info</h5>
                    <p className="text-gray-900 font-medium">{formData.roundName || 'Untitled Round'}</p>
                    <p className="text-gray-600">{formData.category} • {formData.language}</p>
                  </div>
                  
                  <div className="p-3 bg-blue-100 border border-blue-200 rounded-lg shadow-sm">
                    <h5 className="text-blue-700 font-medium mb-2">Timeline</h5>
                    <p className="text-gray-900">{formData.phase} Phase</p>
                    <p className="text-gray-600">{formData.evaluationPeriod} days evaluation</p>
                  </div>
                  
                  <div className="p-3 bg-orange-100 border border-orange-200 rounded-lg shadow-sm">
                    <h5 className="text-orange-700 font-medium mb-2">Scoring</h5>
                    <p className="text-gray-900">{formData.maxScore} max points</p>
                    <p className="text-gray-600">{formData.scoringMethod} method</p>
                  </div>
                  
                  <div className="p-3 bg-green-100 border border-green-200 rounded-lg shadow-sm">
                    <h5 className="text-green-700 font-medium mb-2">Evaluators</h5>
                    <p className="text-gray-900">{formData.evaluatorCount} evaluators</p>
                    <p className="text-gray-600">{formData.blindEvaluation ? 'Blind' : 'Open'} evaluation</p>
                  </div>
                  
                  <div className="p-3 bg-indigo-100 border border-indigo-200 rounded-lg shadow-sm">
                    <h5 className="text-indigo-700 font-medium mb-2">Requirements</h5>
                    <p className="text-gray-900">{formData.requiredDocuments.length} required docs</p>
                    <p className="text-gray-600">{formData.maxFileSize}MB max size</p>
                  </div>
                  
                  <div className="p-3 bg-pink-100 border border-pink-200 rounded-lg shadow-sm">
                    <h5 className="text-pink-700 font-medium mb-2">Incentives</h5>
                    <p className="text-gray-900">{formData.prizes.length} prizes</p>
                    <p className="text-gray-600">{formData.mentorshipOffered ? 'With' : 'No'} mentorship</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-500 hover:text-red-500 transition"
          aria-label="Close modal"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Stepper */}
        <div className="px-8 pt-8 pb-4 border-b border-gray-100 bg-white">
          <div className="flex items-center justify-between">
            {stepConfig.map((step, idx) => {
              const StepIcon = step.icon;
              const isActive = idx + 1 === currentStep;
              const isCompleted = idx + 1 < currentStep;
              return (
                <div key={idx} className="flex flex-col items-center flex-1">
                  <div className={`w-9 h-9 flex items-center justify-center rounded-full border-2 transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                      : isCompleted
                        ? 'bg-green-500 border-green-500 text-white shadow-md'
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}>
                    {isCompleted ? <CheckCircle className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
                  </div>
                  <span className={`mt-1 text-xs ${isActive ? 'text-blue-700 font-semibold' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>{step.title}</span>
                </div>
              );
            })}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1 mt-4">
            <div
              className="bg-blue-500 h-1 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6 bg-white">
          {renderStep()}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between px-8 py-4 border-t border-gray-100 bg-gray-50">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="px-6 py-2 rounded-lg text-base disabled:opacity-40"
          >
            <ArrowLeft className="h-5 w-5 mr-1" /> Previous
          </Button>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            Step {currentStep} of {totalSteps}
            <span className={`ml-2 text-xs ${isStepValid(currentStep) ? 'text-green-600' : 'text-yellow-600'}`}>{isStepValid(currentStep) ? '✓ Ready' : '⚠ Required fields'}</span>
          </div>
          {currentStep === totalSteps ? (
            <Button
              onClick={handleSubmit}
              disabled={!formData.roundName.trim()}
              className="px-6 py-2 rounded-lg text-base bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-300 disabled:text-gray-500"
            >
              <CheckCircle className="h-5 w-5 mr-1" /> Create Round
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!isStepValid(currentStep)}
              className="px-6 py-2 rounded-lg text-base bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:text-gray-500"
            >
              Next <ArrowRight className="h-5 w-5 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default NewEvaluationModal;
