"use client";

import React, { useState } from "react";
import { 
  Users, Code, Lightbulb, MessageSquare, 
  Briefcase, Compass, Search, Bell, Settings,
  Zap, Star, Filter, ArrowRight, CheckCircle2,
  Video
} from "lucide-react";

export default function MockAppPreview() {
  const [activeTab, setActiveTab] = useState("AI Matches");

  const matches = [
    {
      id: 1,
      name: "Sarah Jenkins",
      role: "Technical Co-founder",
      company: "Startup Stealth",
      matchScore: 98,
      lookingFor: ["Marketing Growth", "Sales Strategy"],
      offering: ["Full-stack React", "AWS / DevOps"],
      avatar: "https://i.pravatar.cc/150?img=47"
    },
    {
      id: 2,
      name: "David Chen",
      role: "Growth Hacker",
      company: "GrowthX",
      matchScore: 94,
      lookingFor: ["Mobile App Dev", "UI/UX Design"],
      offering: ["GTM Strategy", "SEO & Ads"],
      avatar: "https://i.pravatar.cc/150?img=11"
    },
    {
      id: 3,
      name: "Elena Rodriguez",
      role: "Product Designer",
      company: "Studio Flow",
      matchScore: 89,
      lookingFor: ["Backend Engineering", "Data Science"],
      offering: ["Figma Prototyping", "User Research"],
      avatar: "https://i.pravatar.cc/150?img=32"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F4F7FC] flex font-sans text-slate-900">
      {/* Sidebar - Hidden on small screens to fit inside the builder preview */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-[#0F172A] border-r border-[#1E293B] flex-col text-slate-300">
        <div className="h-16 flex items-center px-6 border-b border-[#1E293B]">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex justify-center items-center mr-3 shadow-lg shadow-indigo-500/20">
            <Zap className="text-white w-4 h-4" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">FounderSync</span>
        </div>
        
        <div className="pt-8 pb-4 px-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 pl-3">Network</p>
          <div className="space-y-1">
            {["AI Matches", "Skill Directory", "Community Feed"].map((item) => (
              <button
                key={item}
                onClick={() => setActiveTab(item)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === item 
                    ? "bg-indigo-500/10 text-indigo-400" 
                    : "hover:bg-[#1E293B] hover:text-white"
                }`}
              >
                {item === "AI Matches" && <Star size={18} />}
                {item === "Skill Directory" && <Compass size={18} />}
                {item === "Community Feed" && <Users size={18} />}
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="py-4 px-4 border-t border-[#1E293B] mt-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 pl-3">Communicate</p>
          <div className="space-y-1">
            {["Messages", "Video Calls"].map((item) => (
              <button
                key={item}
                onClick={() => setActiveTab(item)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:bg-[#1E293B] hover:text-white`}
              >
                <div className="flex items-center gap-3">
                  {item === "Messages" && <MessageSquare size={18} />}
                  {item === "Video Calls" && <Video size={18} />}
                  {item}
                </div>
                {item === "Messages" && (
                  <span className="bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">3</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto p-4 border-t border-[#1E293B]">
           <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-[#1E293B] transition-colors">
              <Settings size={18} />
              Settings
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0 relative z-10 shadow-sm shadow-slate-100/50">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-slate-800 text-lg">{activeTab}</h2>
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="relative hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 rounded-full text-sm outline-none transition-all w-48 lg:w-72"
              />
            </div>
            <button className="relative p-2 text-slate-400 hover:text-indigo-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold overflow-hidden shadow-sm border border-indigo-100 cursor-pointer hover:opacity-90 shrink-0">
                A
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 relative">
          
          {/* Header Banner */}
          <div className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 sm:p-8 text-white mb-6 sm:mb-8 shadow-lg shadow-indigo-200">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Find your missing piece.</h1>
            <p className="text-indigo-100 max-w-xl text-base sm:text-lg">We analyzed your startup profile. Here are the top founders offering the exact skills you need to build your MVP.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="bg-white text-indigo-600 px-4 sm:px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:shadow-md transition-all flex items-center gap-2">
                <Filter size={16}/> Refine Matches
              </button>
              <button className="bg-indigo-700/50 backdrop-blur-sm border border-indigo-500/50 text-white px-4 sm:px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all">
                Update My Profile
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold tracking-tight text-slate-800">Top Matches for You</h3>
            <span className="text-sm font-medium text-slate-500">Updated exactly now</span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {matches.map((match) => (
              <div key={match.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col group">
                {/* Match Score Badge */}
                <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-100/50 flex justify-between items-center">
                  <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-sm">
                    <Star size={14} className="fill-indigo-600 text-indigo-600" />
                    {match.matchScore}% Synergy
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Perfect Match</span>
                </div>
                
                <div className="p-6 flex-1">
                  <div className="flex gap-4 mb-5">
                    <img src={match.avatar} alt={match.name} className="w-14 h-14 rounded-full border-2 border-white shadow-sm object-cover" />
                    <div>
                      <h4 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">{match.name}</h4>
                      <p className="text-sm font-medium text-slate-500 flex items-center gap-1">
                        <Briefcase size={12}/> {match.role}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">They Can Offer</p>
                      <div className="flex flex-wrap gap-2">
                        {match.offering.map(skill => (
                          <span key={skill} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100/50 text-xs rounded-md font-medium flex items-center gap-1">
                            <CheckCircle2 size={12}/> {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">They Need</p>
                      <div className="flex flex-wrap gap-2">
                        {match.lookingFor.map(skill => (
                          <span key={skill} className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-100/50 text-xs rounded-md font-medium flex items-center gap-1">
                            <Lightbulb size={12}/> {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                  <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm">
                    <MessageSquare size={16} /> Pitch Swap
                  </button>
                  <button className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-colors shadow-sm">
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}
