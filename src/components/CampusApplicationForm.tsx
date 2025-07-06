
"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";
import { DOMAIN_OPTIONS, SECTOR_OPTIONS } from "@/lib/validation/dropdown-constants";

interface FormData {
  fullName: string;
  phone: string;
  natureOfInquiry: string;
  companyName: string;
  companyEmail: string;
  founderNames: string;
  founderBio: string;
  portfolioUrl: string;
  teamInfo: string;
  startupIdea: string;
  problemSolving: string;
  uniqueness: string;
  domain: string;
  sector: string;
}

export default function CampusApplicationForm() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    phone: "",
    natureOfInquiry: "",
    companyName: "",
    companyEmail: "",
    founderNames: "",
    founderBio: "",
    portfolioUrl: "",
    teamInfo: "",
    startupIdea: "",
    problemSolving: "",
    uniqueness: "",
    domain: "",
    sector: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const campusStatus = typeof window !== 'undefined' ? localStorage.getItem('applicantCampusStatus') : 'campus';

      const submissionData = {
        ...formData,
        campusStatus: campusStatus,
      };

      const response = await fetch('/api/contact-submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submissionData)
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Application Submitted!",
          description: "Thank you for your interest. We'll be in touch soon.",
          variant: "default"
        });
        setFormData({
          fullName: "",
          phone: "",
          natureOfInquiry: "",
          companyName: "",
          companyEmail: "",
          founderNames: "",
          founderBio: "",
          portfolioUrl: "",
          teamInfo: "",
          startupIdea: "",
          problemSolving: "",
          uniqueness: "",
          domain: "",
          sector: "",
        });
      } else {
        toast({
          title: "Submission Failed",
          description: result.message || "There was an error submitting your application.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 backdrop-blur-sm rounded-2xl border border-neutral-700/50 shadow-2xl">
      {/* Header Section */}
      <div className="px-8 py-6 border-b border-neutral-700/50 bg-gradient-to-r from-neutral-800/50 to-neutral-700/50 rounded-t-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-8 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full"></div>
          <div>
            <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Incubation Application
            </h2>
            <p className="text-neutral-400 text-sm mt-1">
              Join our innovation ecosystem and transform your startup vision into reality
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        {/* Personal Information Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></div>
            <h3 className="text-lg font-semibold text-neutral-200">Personal Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300 flex items-center">
                Full Name
                <span className="text-red-400 ml-1">*</span>
              </label>
              <input
                name="fullName"
                type="text"
                required
                placeholder="e.g. Ada Lovelace"
                className="w-full bg-neutral-800/60 border border-neutral-600/50 focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/20 rounded-lg px-4 py-3 text-white placeholder-neutral-500 transition-all duration-200 hover:border-neutral-500"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">Phone Number</label>
              <input
                name="phone"
                type="text"
                placeholder="e.g. +91 9876543210"
                className="w-full bg-neutral-800/60 border border-neutral-600/50 focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/20 rounded-lg px-4 py-3 text-white placeholder-neutral-500 transition-all duration-200 hover:border-neutral-500"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Nature of Inquiry */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300 flex items-center">
              Nature of Inquiry
              <span className="text-red-400 ml-1">*</span>
            </label>
            <select
              name="natureOfInquiry"
              required
              className="w-full bg-neutral-800/60 border border-neutral-600/50 focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/20 rounded-lg px-4 py-3 text-white transition-all duration-200 hover:border-neutral-500"
              value={formData.natureOfInquiry}
              onChange={handleChange}
            >
              <option value="" className="bg-neutral-800">Select your inquiry type...</option>
              <option value="Incubation" className="bg-neutral-800">Incubation</option>
              <option value="Startup Idea" className="bg-neutral-800">Startup Idea</option>
              <option value="General Question" className="bg-neutral-800">General Question</option>
            </select>
          </div>
        </div>

        {/* Company Information Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-1 h-6 bg-gradient-to-b from-purple-400 to-purple-600 rounded-full"></div>
            <h3 className="text-lg font-semibold text-neutral-200">Company Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300 flex items-center">
                Company Name
                <span className="text-red-400 ml-1">*</span>
              </label>
              <input
                name="companyName"
                type="text"
                required
                placeholder="e.g. Tech Innovations Inc."
                className="w-full bg-neutral-800/60 border border-neutral-600/50 focus:border-purple-400/60 focus:ring-2 focus:ring-purple-400/20 rounded-lg px-4 py-3 text-white placeholder-neutral-500 transition-all duration-200 hover:border-neutral-500"
                value={formData.companyName}
                onChange={handleChange}
              />
            </div>

            {/* Company Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300 flex items-center">
                Company Email
                <span className="text-red-400 ml-1">*</span>
              </label>
              <input
                name="companyEmail"
                type="email"
                required
                placeholder="e.g. founder@company.com"
                className="w-full bg-neutral-800/60 border border-neutral-600/50 focus:border-purple-400/60 focus:ring-2 focus:ring-purple-400/20 rounded-lg px-4 py-3 text-white placeholder-neutral-500 transition-all duration-200 hover:border-neutral-500"
                value={formData.companyEmail}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Business Classification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Domain */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300 flex items-center">
                Domain
                <span className="text-red-400 ml-1">*</span>
              </label>
              <select
                name="domain"
                required
                className="w-full bg-neutral-800/60 border border-neutral-600/50 focus:border-purple-400/60 focus:ring-2 focus:ring-purple-400/20 rounded-lg px-4 py-3 text-white transition-all duration-200 hover:border-neutral-500"
                value={formData.domain}
                onChange={handleChange}
              >
                <option value="" className="bg-neutral-800">Select domain...</option>
                {DOMAIN_OPTIONS.map((domain) => (
                  <option key={domain} value={domain} className="bg-neutral-800">{domain}</option>
                ))}
              </select>
            </div>

            {/* Sector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300 flex items-center">
                Sector
                <span className="text-red-400 ml-1">*</span>
              </label>
              <select
                name="sector"
                required
                className="w-full bg-neutral-800/60 border border-neutral-600/50 focus:border-purple-400/60 focus:ring-2 focus:ring-purple-400/20 rounded-lg px-4 py-3 text-white transition-all duration-200 hover:border-neutral-500"
                value={formData.sector}
                onChange={handleChange}
              >
                <option value="" className="bg-neutral-800">Select sector...</option>
                {SECTOR_OPTIONS.map((sector) => (
                  <option key={sector} value={sector} className="bg-neutral-800">{sector}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Founder Information Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-1 h-6 bg-gradient-to-b from-green-400 to-green-600 rounded-full"></div>
            <h3 className="text-lg font-semibold text-neutral-200">Founder Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Founder Names */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300 flex items-center">
                Founder Name(s)
                <span className="text-red-400 ml-1">*</span>
              </label>
              <input
                name="founderNames"
                type="text"
                required
                placeholder="e.g. Ada Lovelace, Alan Turing"
                className="w-full bg-neutral-800/60 border border-neutral-600/50 focus:border-green-400/60 focus:ring-2 focus:ring-green-400/20 rounded-lg px-4 py-3 text-white placeholder-neutral-500 transition-all duration-200 hover:border-neutral-500"
                value={formData.founderNames}
                onChange={handleChange}
              />
            </div>

            {/* Portfolio URL */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">LinkedIn or Portfolio URL</label>
              <input
                name="portfolioUrl"
                type="url"
                placeholder="e.g. https://linkedin.com/in/yourprofile"
                className="w-full bg-neutral-800/60 border border-neutral-600/50 focus:border-green-400/60 focus:ring-2 focus:ring-green-400/20 rounded-lg px-4 py-3 text-white placeholder-neutral-500 transition-all duration-200 hover:border-neutral-500"
                value={formData.portfolioUrl}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Founder Bio */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300 flex items-center">
              Founder Bio
              <span className="text-red-400 ml-1">*</span>
            </label>
            <textarea
              name="founderBio"
              required
              placeholder="Brief bio of the founder(s)..."
              className="w-full bg-neutral-800/60 border border-neutral-600/50 focus:border-green-400/60 focus:ring-2 focus:ring-green-400/20 rounded-lg px-4 py-3 text-white placeholder-neutral-500 transition-all duration-200 hover:border-neutral-500 min-h-[100px] resize-y"
              value={formData.founderBio}
              onChange={handleChange}
            />
          </div>

          {/* Team Information */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">Team Information</label>
            <textarea
              name="teamInfo"
              placeholder="Describe your team (optional)..."
              className="w-full bg-neutral-800/60 border border-neutral-600/50 focus:border-green-400/60 focus:ring-2 focus:ring-green-400/20 rounded-lg px-4 py-3 text-white placeholder-neutral-500 transition-all duration-200 hover:border-neutral-500 min-h-[100px] resize-y"
              value={formData.teamInfo}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Startup Details Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-1 h-6 bg-gradient-to-b from-yellow-400 to-orange-600 rounded-full"></div>
            <h3 className="text-lg font-semibold text-neutral-200">Startup Details</h3>
          </div>
          
          {/* Startup Idea */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300 flex items-center">
              Describe Your Startup Idea
              <span className="text-red-400 ml-1">*</span>
            </label>
            <textarea
              name="startupIdea"
              required
              placeholder="Describe your startup idea in detail..."
              className="w-full bg-neutral-800/60 border border-neutral-600/50 focus:border-yellow-400/60 focus:ring-2 focus:ring-yellow-400/20 rounded-lg px-4 py-3 text-white placeholder-neutral-500 transition-all duration-200 hover:border-neutral-500 min-h-[120px] resize-y"
              value={formData.startupIdea}
              onChange={handleChange}
            />
          </div>

          {/* Problem Solving */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">What Problem Are You Solving?</label>
            <textarea
              name="problemSolving"
              placeholder="Describe the problem your startup addresses (optional)..."
              className="w-full bg-neutral-800/60 border border-neutral-600/50 focus:border-yellow-400/60 focus:ring-2 focus:ring-yellow-400/20 rounded-lg px-4 py-3 text-white placeholder-neutral-500 transition-all duration-200 hover:border-neutral-500 min-h-[80px] resize-y"
              value={formData.problemSolving}
              onChange={handleChange}
            />
          </div>

          {/* Uniqueness */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300 flex items-center">
              What Makes Your Startup Unique?
              <span className="text-red-400 ml-1">*</span>
            </label>
            <textarea
              name="uniqueness"
              required
              placeholder="What differentiates your startup from competitors?"
              className="w-full bg-neutral-800/60 border border-neutral-600/50 focus:border-yellow-400/60 focus:ring-2 focus:ring-yellow-400/20 rounded-lg px-4 py-3 text-white placeholder-neutral-500 transition-all duration-200 hover:border-neutral-500 min-h-[80px] resize-y"
              value={formData.uniqueness}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t border-neutral-700/50">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-neutral-600 disabled:to-neutral-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/25 disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center group"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Submitting Application...
              </>
            ) : (
              <>
                Let's Build the Future Together
                <Send className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
          
          <p className="text-center text-xs text-neutral-500 mt-4">
            By submitting this form, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </form>
    </div>
  );
}
