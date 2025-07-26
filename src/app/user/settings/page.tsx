
"use client";

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Users, 
  Building2, 
  FileText, 
  Award, 
  Edit3, 
  Save, 
  X, 
  Plus,
  Calendar,
  MapPin,
  Globe,
  Mail,
  Phone,
  Linkedin,
  Twitter,
  Upload,
  Star,
  TrendingUp,
  Target,
  DollarSign,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';


const StartupProfile = () => {
  const { userData, loading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [startupData, setStartupData] = useState({
    companyName: '',
    tagline: 'Revolutionizing the future of AI-driven solutions', // Placeholder
    description: '',
    industry: '',
    stage: '',
    location: '',
    founded: '',
    website: '',
    email: '',
    phone: '',
    socialLinks: {
      linkedin: '',
      twitter: '',
    },
    logo: null
  });

  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);

  useEffect(() => {
    if (userData) {
      const submissionData = (userData as any).submissionData;
      setStartupData({
        companyName: submissionData?.companyName || userData.name || '',
        description: submissionData?.startupIdea || submissionData?.idea || 'No description provided.',
        industry: submissionData?.domain || 'Not specified',
        stage: submissionData?.currentStage || 'Ideation',
        location: 'Nagpur, India', // Placeholder
        founded: submissionData?.createdAt ? new Date(submissionData.createdAt).getFullYear().toString() : 'N/A',
        website: submissionData?.portfolioUrl || '',
        email: submissionData?.companyEmail || userData.email || '',
        phone: submissionData?.phone || '',
        socialLinks: {
          linkedin: submissionData?.linkedinUrl || '',
          twitter: '', // No twitter field in submission
        },
        tagline: 'Revolutionizing the future', // Placeholder
        logo: null // Logo should be handled
      });
      setTeamMembers(submissionData?.founderNames ? [{
        id: 1,
        name: submissionData.founderNames,
        role: 'Founder',
        bio: submissionData.founderBio || '',
        linkedin: submissionData.linkedinUrl || '',
        image: null
      }] : []);
    }
  }, [userData]);


  const handleInputChange = (field: string, value: any) => {
    setStartupData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to a backend
    console.log('Saving startup data:', startupData);
  };

  const addTeamMember = () => {
    const newMember = {
      id: Date.now(),
      name: '',
      role: '',
      bio: '',
      linkedin: '',
      image: null
    };
    setTeamMembers([...teamMembers, newMember]);
  };

  const updateTeamMember = (id: number, field: string, value: any) => {
    setTeamMembers(prev => prev.map(member => 
      member.id === id ? { ...member, [field]: value } : member
    ));
  };

  const removeTeamMember = (id: number) => {
    setTeamMembers(prev => prev.filter(member => member.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'text-green-600 bg-green-100';
      case 'Under Review': return 'text-yellow-600 bg-yellow-100';
      case 'Pending': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };
  
  if (authLoading) {
      return (
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading your profile...</p>
            </div>
          </div>
      )
  }

  if (!userData) {
      return <div className="text-center py-10">User data could not be loaded. Please try again later.</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{startupData.companyName}</h1>
                <p className="text-gray-600">{startupData.tagline}</p>
              </div>
            </div>
            <button
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium ${
                isEditing 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isEditing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              <span>{isEditing ? 'Save Changes' : 'Edit Profile'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: Building2 },
              { id: 'team', label: 'Team', icon: Users },
              { id: 'documents', label: 'Documents', icon: FileText },
              { id: 'milestones', label: 'Milestones', icon: Award }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Information */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Company Overview</h2>
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="companyName" className="text-sm font-medium text-gray-700">Company Name</Label>
                      <Input
                        id="companyName"
                        type="text"
                        value={startupData.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        className="mt-1 bg-white text-black border-gray-300 rounded-md focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tagline" className="text-sm font-medium text-gray-700">Tagline</Label>
                      <Input
                        id="tagline"
                        type="text"
                        value={startupData.tagline}
                        onChange={(e) => handleInputChange('tagline', e.target.value)}
                        className="mt-1 bg-white text-black border-gray-300 rounded-md focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
                      <Textarea
                        id="description"
                        value={startupData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={4}
                        className="mt-1 bg-white text-black border-gray-300 rounded-md focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700 leading-relaxed">{startupData.description}</p>
                )}
              </div>

              {/* Key Metrics */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Key Metrics</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600">{teamMembers.length}</div>
                    <div className="text-sm text-gray-600">Team Size</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <Award className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-orange-600">{milestones.length}</div>
                    <div className="text-sm text-gray-600">Milestones</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Company Details */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Company Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Industry:</span>
                    <span className="text-sm font-medium">{startupData.industry}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Stage:</span>
                    <span className="text-sm font-medium">{startupData.stage}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Location:</span>
                    <span className="text-sm font-medium">{startupData.location}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Founded:</span>
                    <span className="text-sm font-medium">{startupData.founded}</span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <a href={startupData.website} className="text-sm text-blue-600 hover:underline">
                      {startupData.website || 'Not Provided'}
                    </a>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a href={`mailto:${startupData.email}`} className="text-sm text-blue-600 hover:underline">
                      {startupData.email}
                    </a>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{startupData.phone || 'Not Provided'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Linkedin className="w-4 h-4 text-gray-400" />
                    <a href={startupData.socialLinks.linkedin} className="text-sm text-blue-600 hover:underline">
                      LinkedIn
                    </a>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Twitter className="w-4 h-4 text-gray-400" />
                    <a href={startupData.socialLinks.twitter} className="text-sm text-blue-600 hover:underline">
                      Twitter
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Team Tab */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Team Members</h2>
              {isEditing && (
                <button
                  onClick={addTeamMember}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Member</span>
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map(member => (
                <div key={member.id} className="bg-white rounded-lg shadow p-6">
                  {isEditing && (
                    <div className="flex justify-end mb-2">
                      <button
                        onClick={() => removeTeamMember(member.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <User className="w-10 h-10 text-white" />
                    </div>
                    
                    {isEditing ? (
                      <div className="space-y-3">
                        <Label htmlFor={`name-${member.id}`} className="sr-only">Name</Label>
                        <Input
                          id={`name-${member.id}`}
                          placeholder="Name"
                          value={member.name}
                          onChange={(e) => updateTeamMember(member.id, 'name', e.target.value)}
                          className="w-full text-center bg-white text-black border-gray-300 rounded-md focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
                        />
                        <Label htmlFor={`role-${member.id}`} className="sr-only">Role</Label>
                        <Input
                          id={`role-${member.id}`}
                          placeholder="Role"
                          value={member.role}
                          onChange={(e) => updateTeamMember(member.id, 'role', e.target.value)}
                          className="w-full text-center bg-white text-black border-gray-300 rounded-md focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
                        />
                        <Label htmlFor={`bio-${member.id}`} className="sr-only">Bio</Label>
                        <Textarea
                          id={`bio-${member.id}`}
                          placeholder="Bio"
                          value={member.bio}
                          onChange={(e) => updateTeamMember(member.id, 'bio', e.target.value)}
                          rows={3}
                          className="w-full bg-white text-black border-gray-300 rounded-md focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
                        />
                        <Label htmlFor={`linkedin-${member.id}`} className="sr-only">LinkedIn URL</Label>
                        <Input
                          id={`linkedin-${member.id}`}
                          placeholder="LinkedIn URL"
                          value={member.linkedin}
                          onChange={(e) => updateTeamMember(member.id, 'linkedin', e.target.value)}
                          className="w-full bg-white text-black border-gray-300 rounded-md focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
                        />
                      </div>
                    ) : (
                      <>
                        <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                        <p className="text-blue-600 font-medium mb-2">{member.role}</p>
                        <p className="text-gray-600 text-sm mb-4">{member.bio}</p>
                        {member.linkedin && (
                          <a 
                            href={member.linkedin}
                            className="inline-flex items-center space-x-1 text-blue-600 hover:underline"
                          >
                            <Linkedin className="w-4 h-4" />
                            <span className="text-sm">LinkedIn</span>
                          </a>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Documents</h2>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Upload className="w-4 h-4" />
                <span>Upload Document</span>
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Document Library</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {documents.map(doc => (
                  <div key={doc.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <FileText className="w-8 h-8 text-blue-500" />
                      <div>
                        <h4 className="font-medium text-gray-900">{doc.name}</h4>
                        <p className="text-sm text-gray-600">
                          {doc.type} • Uploaded {doc.uploadDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                        {doc.status}
                      </span>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Milestones Tab */}
        {activeTab === 'milestones' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Milestone Badges</h2>
            <p className="text-gray-600">Achievement badges awarded by mentors for reaching key milestones.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {milestones.map(milestone => (
                <div key={milestone.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`w-16 h-16 ${milestone.badgeColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <Award className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{milestone.title}</h3>
                      <p className="text-gray-600 mb-3">{milestone.description}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>Awarded by {milestone.mentorName}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{milestone.dateAchieved}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {milestones.length === 0 && (
              <div className="text-center py-12">
                <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No milestones yet</h3>
                <p className="text-gray-600">Keep working towards your goals! Mentors will award badges as you achieve key milestones.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StartupProfile;
