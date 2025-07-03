"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "./ui/animated-sidebar";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconUserBolt,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import '../styles/admin-dashboard-theme.css';

export function SidebarDemo() {
  const [open, setOpen] = useState(false);
  
  const links = [
    {
      label: "Dashboard",
      href: "#",
      icon: (
        <IconBrandTabler className="h-5 w-5 shrink-0 text-blue-600" />
      ),
    },
    {
      label: "Profile",
      href: "#",
      icon: (
        <IconUserBolt className="h-5 w-5 shrink-0 text-blue-600" />
      ),
    },
    {
      label: "Settings",
      href: "#",
      icon: (
        <IconSettings className="h-5 w-5 shrink-0 text-blue-600" />
      ),
    },
    {
      label: "Logout",
      href: "#",
      icon: (
        <IconArrowLeft className="h-5 w-5 shrink-0 text-blue-600" />
      ),
    },
  ];
  
  return (
    <div
      className={cn(
        "flex w-full h-screen flex-1 flex-col overflow-hidden md:flex-row admin-theme",
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: "Manu Arora",
                href: "#",
                icon: (
                  <img
                    src="https://assets.aceternity.com/manu.png"
                    className="h-7 w-7 shrink-0 rounded-full"
                    width={50}
                    height={50}
                    alt="Avatar"
                  />
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <Dashboard />
    </div>
  );
}

export const Logo = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-gray-800"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-blue-600" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-semibold whitespace-pre text-gray-800"
      >
        Admin Panel
      </motion.span>
    </a>
  );
};

export const LogoIcon = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-gray-800"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-blue-600" />
    </a>
  );
};

// Professional dashboard component with modern admin light theme
const Dashboard = () => {
  return (
    <div className="flex flex-1">
      <div className="admin-container w-full">
        {/* Professional Header Section */}
        <div className="admin-header">
          <h1>Dashboard Overview</h1>
          <p>Welcome to your professional admin panel</p>
        </div>
        
        {/* Stats Cards Grid */}
        <div className="admin-grid admin-grid-4 mb-8">
          {[
            { label: "Total", value: "3", change: "+2.5%", color: "blue", icon: "📊" },
            { label: "Pending", value: "0", change: "+2.5%", color: "amber", icon: "⏳" },
            { label: "Accepted", value: "3", change: "+2.5%", color: "green", icon: "✅" },
            { label: "Rejected", value: "0", change: "+2.5%", color: "red", icon: "❌" }
          ].map((stat, idx) => (
            <div
              key={"stats-card-" + idx}
              className="admin-card group cursor-pointer admin-float"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              {/* Shimmer effect on hover */}
              <div className="admin-shimmer absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl"></div>
              
              <div className="relative z-10 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className={`admin-icon admin-icon-${stat.color}`}>
                    {stat.icon}
                  </div>
                  <div className="admin-badge admin-badge-neutral">
                    {stat.change}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</h3>
                  <p className={`text-4xl font-black transition-all duration-300 group-hover:scale-110 ${
                    stat.color === 'blue' ? 'text-blue-600' :
                    stat.color === 'amber' ? 'text-amber-600' :
                    stat.color === 'green' ? 'text-green-600' :
                    'text-red-600'
                  }`}>
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Professional Submissions Table with Enhanced Light Theme */}
        <div className="admin-card overflow-hidden">
          <div className="admin-header">
            <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center">
              <div className="flex items-center gap-4">
                <div className="admin-icon admin-icon-blue">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text h-5 w-5">
                    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                    <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                    <path d="M10 9H8"></path>
                    <path d="M16 13H8"></path>
                    <path d="M16 17H8"></path>
                  </svg>
                </div>
                <div>
                  <h2 className="text-3xl font-black mb-1">Submissions</h2>
                  <p className="font-semibold text-lg text-muted-foreground">Review applications</p>
                </div>
              </div>
              <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-base font-normal ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 py-2 admin-btn admin-btn-primary group mt-4 sm:mt-0">
                <span className="group-hover:rotate-180 transition-transform duration-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw h-5 w-5">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                    <path d="M21 3v5h-5"></path>
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                    <path d="M8 16H3v5"></path>
                  </svg>
                </span>
                Refresh
              </button>
            </div>
          </div>
          
          <div className="admin-card overflow-hidden glass-card glass-card-hover rounded-xl shadow-md border border-gray-200/40">
            <div className="overflow-x-auto admin-scrollbar">
              <table className="admin-table w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="p-4 text-left font-semibold text-gray-700">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 rounded-md bg-blue-50">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-user h-4 w-4 text-blue-600">
                            <circle cx="12" cy="12" r="10"></circle>
                            <circle cx="12" cy="10" r="3"></circle>
                            <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"></path>
                          </svg>
                        </div>
                        <span>Applicant</span>
                      </div>
                    </th>
                    <th className="p-4 text-left font-semibold text-gray-700">Company</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Domain</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Startup Idea</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Status</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Submitted</th>
                    <th className="p-4 text-right font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    {
                      name: "test",
                      email: "utkarshpatikar71@gmail.com",
                      company: "test",
                      domain: "EdTech",
                      idea: "testtest",
                      status: "Accepted",
                      date: "Jul 1, 2025, 12:30:34 PM"
                    },
                    {
                      name: "test",
                      email: "utkarshpatikar@gmail.com",
                      company: "testut",
                      domain: "EdTech",
                      idea: "test",
                      status: "Accepted",
                      date: "Jul 1, 2025, 12:27:19 PM"
                    },
                    {
                      name: "testet",
                      email: "utkarshpatikar71@gmail.com",
                      company: "test",
                      domain: "E-commerce",
                      idea: "test",
                      status: "Accepted",
                      date: "Jun 28, 2025, 1:08:25 PM"
                    }
                  ].map((row, idx) => (
                    <tr key={idx} className="group transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-indigo-50/30">
                      <td className="p-5">
                        <div className="flex items-center space-x-3 cursor-pointer hover:bg-blue-100/30 -m-2 p-2 rounded-lg transition-colors" type="button" aria-haspopup="dialog" aria-expanded="false" data-state="closed">
                          <div className="admin-icon admin-icon-blue w-10 h-10 text-lg font-bold flex items-center justify-center shadow-sm">
                            <span>T</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-800 group-hover:text-gray-900 transition-colors truncate">{row.name}</div>
                            <div className="text-xs text-gray-500 truncate">{row.email}</div>
                          </div>
                          <div className="bg-white/80 p-1 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye h-4 w-4 text-blue-500">
                              <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">{row.company}</div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 border border-blue-200/40 shadow-sm">{row.domain}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm text-gray-700 max-w-xs group-hover:text-gray-900">
                          <div className="truncate">{row.idea}</div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-2">
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-green-50 to-green-100 text-green-600 border border-green-100/40 shadow-sm">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-big h-3 w-3 mr-1.5">
                                <path d="M21.801 10A10 10 0 1 1 17 3.335"></path>
                                <path d="m9 11 3 3L22 4"></path>
                              </svg>
                              {row.status}
                            </span>
                            <span className="text-xs text-gray-500">{row.date.split(',')[0]}</span>
                          </div>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 border border-blue-100/40 shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-landmark h-3 w-3 mr-1.5">
                              <line x1="3" x2="21" y1="22" y2="22"></line>
                              <line x1="6" x2="6" y1="18" y2="11"></line>
                              <line x1="10" x2="10" y1="18" y2="11"></line>
                              <line x1="14" x2="14" y1="18" y2="11"></line>
                              <line x1="18" x2="18" y1="18" y2="11"></line>
                              <polygon points="12 2 20 7 4 7"></polygon>
                            </svg>
                            Campus
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm text-gray-500 group-hover:text-gray-700">{row.date}</div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border bg-white h-9 px-4 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 shadow-sm hover:shadow-md" type="button" aria-haspopup="dialog" aria-expanded="false" data-state="closed">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye h-4 w-4 mr-1">
                              <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            View
                          </button>
                          <div className="flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-big h-3.5 w-3.5 mr-1.5 text-green-500">
                              <path d="M21.801 10A10 10 0 1 1 17 3.335"></path>
                              <path d="m9 11 3 3L22 4"></path>
                            </svg>
                            Processed
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium text-gray-700">3</span> of <span className="font-medium text-gray-700">3</span> entries
              </div>
              <div className="flex items-center gap-2">
                <button className="inline-flex items-center justify-center p-2 rounded-md border border-gray-200 text-gray-400 bg-white shadow-sm hover:bg-gray-50 disabled:opacity-50">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left">
                    <path d="m15 18-6-6 6-6"/>
                  </svg>
                </button>
                <div className="flex items-center">
                  <span className="px-3 py-1.5 bg-blue-50 text-blue-600 font-medium rounded-md border border-blue-100">1</span>
                </div>
                <button className="inline-flex items-center justify-center p-2 rounded-md border border-gray-200 text-gray-400 bg-white shadow-sm hover:bg-gray-50 disabled:opacity-50">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
