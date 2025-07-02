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

  // Debug logging for modal state changes
  useEffect(() => {
    if (isOpen) {
      console.log("🎯 Evaluation Modal OPENED - Navigation Ready!");
      console.log(`📍 Current Step: ${currentStep}/${totalSteps}`);
    } else {
      console.log("❌ Evaluation Modal CLOSED");
    }
  }, [isOpen]);

  // Debug logging for step changes
  useEffect(() => {
    console.log(`📈 Step Changed: ${currentStep}/${totalSteps} | Valid: ${isStepValid(currentStep)}`);
  }, [currentStep]);

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
    console.log(`🚀 Next button clicked! Current step: ${currentStep}, Total steps: ${totalSteps}`);
    if (currentStep < totalSteps) {
      // Check if current step is valid before proceeding
      if (isStepValid(currentStep)) {
        console.log(`✅ Step ${currentStep} is valid, moving to step ${currentStep + 1}`);
        setCurrentStep(currentStep + 1);
      } else {
        console.warn(`❌ Step ${currentStep} validation failed - missing required fields`);
        // You could add a toast notification here for better UX
      }
    } else {
      console.log(`⚠️ Already at final step (${totalSteps})`);
    }
  };

  const handlePrevious = () => {
    console.log(`⬅️ Previous button clicked! Current step: ${currentStep}`);
    if (currentStep > 1) {
      console.log(`✅ Moving from step ${currentStep} to step ${currentStep - 1}`);
      setCurrentStep(currentStep - 1);
    } else {
      console.log(`⚠️ Already at first step (1)`);
    }
  };

  const handleSubmit = () => {
    console.log("🎯 Creating advanced evaluation round:", formData);
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
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-4xl max-h-[95vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex-shrink-0 relative p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Create Evaluation Round</h2>
              <p className="text-gray-600">Step {currentStep} of {totalSteps} • {stepConfig[currentStep - 1]?.description}</p>
            </div>
            <button 
              onClick={onClose} 
              className="group relative w-18 h-18 bg-gradient-to-br from-white via-slate-50/95 to-gray-100/90 hover:from-red-50/98 hover:via-rose-100/95 hover:to-pink-200/98 border-4 border-slate-300/80 hover:border-rose-400/90 rounded-full shadow-3xl hover:shadow-4xl hover:shadow-rose-600/40 transition-all duration-800 ease-out transform hover:scale-125 hover:rotate-[25deg] active:scale-85 active:rotate-[12deg] backdrop-blur-4xl overflow-hidden"
              style={{
                backdropFilter: 'blur(35px) saturate(250%) brightness(115%)',
                background: `
                  conic-gradient(from 0deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.95) 20%, rgba(241,245,249,0.98) 40%, rgba(226,232,240,0.95) 60%, rgba(203,213,225,0.98) 80%, rgba(255,255,255,0.95) 100%),
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6) 0%, transparent 50%),
                  linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.85) 100%)
                `,
                boxShadow: `
                  0 35px 70px -15px rgba(0, 0, 0, 0.3), 
                  inset 0 2px 0 rgba(255, 255, 255, 0.8), 
                  inset 0 -2px 0 rgba(0, 0, 0, 0.05),
                  0 0 0 2px rgba(255, 255, 255, 0.1),
                  0 8px 32px rgba(0, 0, 0, 0.12)
                `
              }}
              title="Close modal"
            >
              {/* Ultra-premium crystalline inner surface */}
              <div className="absolute inset-1 bg-gradient-to-br from-white/90 via-slate-50/70 to-gray-100/50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-800 shadow-inner"></div>
              <div className="absolute inset-2 bg-gradient-to-tl from-white/60 via-transparent to-slate-100/40 rounded-full opacity-90 group-hover:opacity-100 transition-all duration-800"></div>
              
              {/* Multi-layer quantum glow system */}
              <div className="absolute -inset-1 bg-gradient-to-r from-rose-500/0 via-pink-500/0 to-red-500/0 group-hover:from-rose-500/50 group-hover:via-pink-500/60 group-hover:to-red-500/50 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-all duration-800 -z-10 animate-pulse"></div>
              <div className="absolute -inset-2 bg-gradient-to-r from-rose-400/0 via-pink-400/0 to-red-400/0 group-hover:from-rose-400/35 group-hover:via-pink-400/45 group-hover:to-red-400/35 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-900 -z-20"></div>
              <div className="absolute -inset-3 bg-gradient-to-r from-rose-300/0 via-pink-300/0 to-red-300/0 group-hover:from-rose-300/25 group-hover:via-pink-300/35 group-hover:to-red-300/25 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-1000 -z-30"></div>
              
              {/* Advanced diamond shimmer cascade */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full opacity-0 group-hover:opacity-100 transform -skew-x-12 translate-x-full group-hover:translate-x-[-300%] transition-all duration-1000 ease-out"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-200/30 to-transparent rounded-full opacity-0 group-hover:opacity-100 transform -skew-x-12 translate-x-full group-hover:translate-x-[-300%] transition-all duration-1200 ease-out delay-150"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-200/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transform -skew-x-12 translate-x-full group-hover:translate-x-[-300%] transition-all duration-1400 ease-out delay-300"></div>
              
              {/* Layered depth shadow system */}
              <div className="absolute inset-1.5 bg-gradient-to-tl from-slate-300/40 via-transparent to-slate-200/50 rounded-full"></div>
              <div className="absolute inset-2.5 bg-gradient-to-br from-white/50 via-transparent to-gray-200/30 rounded-full"></div>
              <div className="absolute inset-3.5 bg-gradient-to-tr from-slate-100/30 via-transparent to-white/40 rounded-full"></div>
              
              {/* Premium floating particles constellation */}
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-800">
                <div className="absolute top-3 left-4 w-1.5 h-1.5 bg-white/70 rounded-full animate-ping delay-100"></div>
                <div className="absolute top-5 right-3 w-1 h-1 bg-rose-300/90 rounded-full animate-ping delay-300"></div>
                <div className="absolute bottom-4 left-3 w-1 h-1 bg-pink-200/80 rounded-full animate-ping delay-500"></div>
                <div className="absolute bottom-3 right-4 w-1.5 h-1.5 bg-white/60 rounded-full animate-ping delay-700"></div>
                <div className="absolute top-1/2 left-2 w-0.5 h-0.5 bg-blue-200/70 rounded-full animate-ping delay-900"></div>
                <div className="absolute top-1/2 right-2 w-0.5 h-0.5 bg-purple-200/60 rounded-full animate-ping delay-1100"></div>
              </div>
              
              {/* Ultra-enhanced icon with liquid motion */}
              <X className="h-8 w-8 text-slate-700 group-hover:text-rose-700 transition-all duration-800 relative z-40 transform group-hover:scale-150 group-hover:rotate-[360deg] drop-shadow-xl group-hover:drop-shadow-3xl filter group-hover:brightness-125 group-hover:contrast-150 group-hover:saturate-125" />
              
              {/* Morphing quantum background layers */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-rose-500/0 via-pink-600/0 to-red-700/0 group-hover:from-rose-500/25 group-hover:via-pink-600/35 group-hover:to-red-700/30 transition-all duration-800 animate-pulse opacity-0 group-hover:opacity-100"></div>
              <div className="absolute inset-1 rounded-full bg-gradient-to-tl from-rose-400/0 via-pink-500/0 to-red-600/0 group-hover:from-rose-400/20 group-hover:via-pink-500/30 group-hover:to-red-600/25 transition-all duration-900 animate-pulse opacity-0 group-hover:opacity-100"></div>
              
              {/* Prismatic quantum aura system */}
              <div className="absolute -inset-4 bg-gradient-conic from-rose-300/0 via-pink-400/0 via-purple-300/0 via-blue-300/0 to-rose-300/0 group-hover:from-rose-300/40 group-hover:via-pink-400/50 group-hover:via-purple-300/45 group-hover:via-blue-300/35 group-hover:to-rose-300/40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-1200 -z-40 animate-spin-slow"></div>
              
              {/* Ultra-premium glass reflection */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-transparent to-transparent rounded-full opacity-70 group-hover:opacity-100 transition-opacity duration-600"></div>
              <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-transparent to-white/20 rounded-full opacity-50 group-hover:opacity-80 transition-opacity duration-600"></div>
              
              {/* Holographic edge enhancement */}
              <div className="absolute inset-0 rounded-full border border-white/40 group-hover:border-white/60 transition-all duration-600"></div>
              <div className="absolute inset-1 rounded-full border border-white/20 group-hover:border-white/40 transition-all duration-600"></div>
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between mb-2">
              {stepConfig.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = index + 1 === currentStep;
                const isCompleted = index + 1 < currentStep;
                
                return (
                  <div key={index} className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isActive 
                        ? `bg-gradient-to-r ${step.color} border-transparent shadow-lg` 
                        : isCompleted 
                          ? 'bg-green-500 border-green-400 shadow-lg' 
                          : 'bg-gray-100 border-gray-300'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-white" />
                      ) : (
                        <StepIcon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                      )}
                    </div>
                    <span className={`text-xs mt-1 transition-colors duration-300 ${
                      isActive ? 'text-gray-900 font-medium' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-1 rounded-full transition-all duration-500 shadow-lg"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto min-h-0">
          {renderStep()}
        </div>

        {/* Footer - Enhanced Navigation */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-t-2 border-blue-200 bg-gradient-to-r from-gray-50 to-blue-50 shadow-lg">
          {/* Previous Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`group relative flex items-center gap-3 transition-all duration-300 px-8 py-4 text-lg font-medium rounded-xl ${
              currentStep === 1 
                ? 'bg-gray-100 border-2 border-gray-300 text-gray-400 cursor-not-allowed opacity-40' 
                : 'bg-gradient-to-r from-white via-gray-50 to-white hover:from-blue-50 hover:via-blue-100 hover:to-blue-50 border-2 border-gray-300 hover:border-blue-400 text-gray-700 hover:text-blue-700 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl backdrop-blur-sm'
            }`}
            title={currentStep > 1 ? `Go back to step ${currentStep - 1}` : 'This is the first step'}
          >
            {currentStep > 1 && (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/10 group-hover:to-indigo-500/10 rounded-xl transition-all duration-300"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </>
            )}
            <ArrowLeft className={`h-5 w-5 transition-all duration-300 relative z-10 ${
              currentStep > 1 ? 'group-hover:scale-110 group-hover:-translate-x-1' : ''
            }`} />
            <span className={`transition-all duration-300 relative z-10 ${
              currentStep > 1 ? 'group-hover:translate-x-0.5' : ''
            }`}>Previous</span>
          </Button>

          {/* Step Counter with Validation Status */}
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-600">Step {currentStep} of {totalSteps}</span>
            <div className="flex gap-1">
              {Array.from({ length: totalSteps }, (_, i) => {
                const stepNumber = i + 1;
                const isComplete = stepNumber < currentStep;
                const isCurrent = stepNumber === currentStep;
                const isValid = isStepValid(stepNumber);
                
                return (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full transition-all duration-200 flex items-center justify-center ${
                      isComplete 
                        ? 'bg-green-500 shadow-sm' 
                        : isCurrent 
                          ? isValid 
                            ? 'bg-blue-500 ring-2 ring-blue-300 ring-opacity-50' 
                            : 'bg-yellow-500 animate-pulse ring-2 ring-yellow-300 ring-opacity-50'
                          : 'bg-gray-400'
                    }`}
                    title={
                      isComplete 
                        ? `Step ${stepNumber}: Complete` 
                        : isCurrent 
                          ? isValid 
                            ? `Step ${stepNumber}: Ready to continue` 
                            : `Step ${stepNumber}: Please complete required fields`
                          : `Step ${stepNumber}: Not reached`
                    }
                  >
                    {isComplete && (
                      <CheckCircle className="w-2 h-2 text-white" />
                    )}
                  </div>
                );
              })}
            </div>
            <span className={`text-xs ${isStepValid(currentStep) ? 'text-green-600' : 'text-yellow-600'}`}>
              {isStepValid(currentStep) ? '✓ Ready' : '⚠ Complete required fields'}
            </span>
          </div>

          {/* Next/Submit Button */}
          {currentStep === totalSteps ? (
            <Button
              onClick={handleSubmit}
              disabled={!formData.roundName.trim()}
              className={`flex items-center gap-2 transition-all duration-200 px-8 py-4 text-lg font-medium ${
                !formData.roundName.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50 border-gray-400'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 hover:scale-105 active:scale-95 text-white border-0 shadow-xl shadow-green-500/25'
              }`}
              title={
                !formData.roundName.trim() 
                  ? 'Please enter a round name to create the evaluation round' 
                  : 'Create the evaluation round'
              }
            >
              <CheckCircle className="h-5 w-5" />
              Create Round
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!isStepValid(currentStep)}
              className={`flex items-center gap-2 transition-all duration-200 px-8 py-4 text-lg font-medium ${
                !isStepValid(currentStep) 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50 animate-pulse border-gray-400' 
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 hover:scale-105 active:scale-95 text-white border-0 shadow-xl shadow-blue-500/25'
              }`}
              title={
                !isStepValid(currentStep) 
                  ? 'Please complete all required fields to continue' 
                  : `Continue to step ${currentStep + 1}`
              }
            >
              Next
              <ArrowRight className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default NewEvaluationModal;
