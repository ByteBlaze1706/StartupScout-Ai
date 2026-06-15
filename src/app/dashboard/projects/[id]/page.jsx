'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Download, Send, MessageSquare, Plus, Users,
  Check, Compass, DollarSign, Award,
  ChevronRight, Presentation, Clock,
  Sparkles, CheckCircle2, Zap, Loader2 } from
'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from


'recharts';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { exportReportToPDF, exportPitchDeckToPDF } from '@/lib/pdfExport';





export default function ProjectDetailsPage(props) {
  const router = useRouter();
  const [projectId, setProjectId] = useState('');
  const [project, setProject] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Tab control
  const [activeTab, setActiveTab] = useState('score');

  // AI Copilot State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef(null);

  // Pitch Deck Slide controller
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreenSlide, setIsFullscreenSlide] = useState(false);

  // Collaboration State
  const [newComment, setNewComment] = useState('');
  const [teammateEmail, setTeammateEmail] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Resolve dynamic URL params
  useEffect(() => {
    props.params.then((resolvedParams) => {
      setProjectId(resolvedParams.id);
    });
    setCurrentUser(auth.getUser());
  }, [props.params]);

  // Load project data
  useEffect(() => {
    if (!projectId) return;
    const loadProject = async () => {
      const data = await db.getProject(projectId);
      if (!data) {
        router.push('/dashboard');
      } else {
        setProject(data);
        setChatHistory(data.report?.chatHistory || []);
      }
    };
    loadProject();
  }, [projectId, router]);

  // Scroll chat to bottom
  useEffect(() => {
    if (chatOpen && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatOpen, chatHistory]);

  if (!project) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>);

  }

  const report = project.report;

  // Handle Copilot Question Submission
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = chatInput.trim();
    setChatInput('');

    // Add user message to state
    const updatedHistory = [...chatHistory, { role: 'user', content: userMsg }];
    setChatHistory(updatedHistory);
    setChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report,
          chatHistory: updatedHistory,
          message: userMsg
        })
      });
      const data = await response.json();

      const assistantMsg = data.reply || 'Sorry, I could not process that request.';
      const finalHistory = [...updatedHistory, { role: 'assistant', content: assistantMsg }];

      setChatHistory(finalHistory);

      // Persist conversation history to database
      const updatedProject = {
        ...project,
        report: {
          ...report,
          chatHistory: finalHistory
        }
      };
      await db.saveProject(updatedProject);
    } catch (err) {
      console.error(err);
      setChatHistory((prev) => [...prev, { role: 'assistant', content: 'Connection issue. Please check API settings.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Add Comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment = {
      id: `c_${Math.random().toString(36).substring(2, 11)}`,
      user: currentUser?.fullName || 'Founder',
      text: newComment.trim(),
      date: new Date().toISOString()
    };

    const updatedProject = {
      ...project,
      comments: [...(project.comments || []), comment]
    };

    const success = await db.saveProject(updatedProject);
    if (success) {
      setProject(updatedProject);
    }
    setNewComment('');
  };

  // Invite Teammate
  const handleInviteTeammate = async (e) => {
    e.preventDefault();
    if (!teammateEmail.trim()) return;

    const namePrefix = teammateEmail.split('@')[0];
    const invitedName = namePrefix.charAt(0).toUpperCase() + namePrefix.slice(1);

    const updatedProject = {
      ...project,
      teamMembers: [...(project.teamMembers || []), `${invitedName} (${teammateEmail})`]
    };

    const success = await db.saveProject(updatedProject);
    if (success) {
      setProject(updatedProject);
    }
    setTeammateEmail('');
    setShowInviteModal(false);
    alert(`Invite sent to ${teammateEmail}!`);
  };

  // Trigger PDF Exporter library
  const handleExportPDF = async () => {
    if (activeTab === 'pitch') {
      exportPitchDeckToPDF(project);
    } else {
      exportReportToPDF(project);
      try {
        await fetch(`/api/projects/${projectId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'increment_export' })
        });
        const data = await db.getProject(projectId);
        if (data) setProject(data);
      } catch (e) {
        console.error('Failed to increment export count', e);
      }
    }
  };

  // Color mappings for Recharts Cell components
  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  // Score breakdown radar data
  const scoreRadarData = [
  { subject: 'Problem Validation', score: report.score?.validation || 70, fullMark: 100 },
  { subject: 'Market Demand', score: report.score?.demand || 70, fullMark: 100 },
  { subject: 'Scalability', score: report.score?.scalability || 80, fullMark: 100 },
  { subject: 'Revenue potential', score: report.score?.revenue || 70, fullMark: 100 },
  { subject: 'Investor Appeal', score: report.score?.appeal || 70, fullMark: 100 },
  { subject: 'Execution Ease', score: 100 - (report.score?.difficulty || 40), fullMark: 100 }];


  return (
    <div className="flex flex-col gap-6 no-print">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors">
            
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-[10px] uppercase font-mono text-zinc-500 font-semibold">{report.industry} | {report.country}</span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
              <span>{project.name}</span>
              <span className={`
                text-[10px] px-2 py-0.5 rounded-full font-bold
                ${report.score?.overall >= 80 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
              report.score?.overall >= 65 ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' :
              'bg-amber-500/10 text-amber-400 border border-amber-500/20'}
              `}>
                Score: {report.score?.overall}/100
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('pitch')}
            className="px-4 py-2.5 rounded-xl glass-card text-zinc-300 hover:text-white border-zinc-800 text-xs font-semibold flex items-center gap-2">
            
            <Presentation className="w-4 h-4 text-violet-400" />
            <span>Open Pitch Slides</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-violet-600/15">
            
            <Download className="w-4 h-4" />
            <span>Export Report PDF</span>
          </button>
        </div>
      </div>

      {/* Tab select bar */}
      <div className="border-b border-zinc-900 bg-zinc-950/20 p-1.5 rounded-xl flex flex-wrap gap-1">
        {[
        { id: 'score', label: 'Score Engine', icon: <Award className="w-3.5 h-3.5" /> },
        { id: 'report', label: 'Market Report', icon: <Compass className="w-3.5 h-3.5" /> },
        { id: 'mvp', label: 'MVP Roadmap', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
        { id: 'pitch', label: 'Pitch Deck', icon: <Presentation className="w-3.5 h-3.5" /> },
        { id: 'team', label: 'Team Room', icon: <Users className="w-3.5 h-3.5" /> }].
        map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border transition-all
                ${isActive ?
              'bg-zinc-900 border-zinc-800 text-violet-400 font-bold' :
              'bg-transparent border-transparent text-zinc-400 hover:text-white hover:bg-zinc-900/40'}
              `
              }>
              
              {tab.icon}
              <span>{tab.label}</span>
            </button>);

        })}
      </div>

      {/* Tab Panels */}
      <div className="min-h-[60vh] flex flex-col gap-6">
        {/* TAB 1: Score Engine */}
        {activeTab === 'score' &&
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Left Column: Overall score gauge */}
            <div className="glass-card p-6 rounded-2xl border border-zinc-900 flex flex-col items-center justify-center text-center gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/5 rounded-full blur-xl" />
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 font-bold">Overall Viability</span>
                <h3 className="text-3xl font-black text-white mt-1">Viability Score</h3>
              </div>
              
              {/* Score circle gauge */}
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="88" cy="88" r="76" stroke="#18181b" strokeWidth="12" fill="transparent" />
                  <circle
                  cx="88"
                  cy="88"
                  r="76"
                  stroke="#8b5cf6"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 76}
                  strokeDashoffset={2 * Math.PI * 76 * (1 - report.score?.overall / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-1000" />
                
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-white">{report.score?.overall}</span>
                  <span className="text-[10px] uppercase font-mono text-zinc-500 mt-0.5">out of 100</span>
                </div>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed max-w-xs font-light">
                {report.score?.overall >= 80 ?
              "Highly validated business model. Strong market parameters, high customer demand, and manageable barrier factors." :
              report.score?.overall >= 65 ?
              "Healthy project layout. Some vulnerabilities or competition factors detected, but has strong path to monetizing." :
              "Caution recommended. High entry difficulty or small addressable market size could impede rapid scaling."}
              </p>
            </div>

            {/* Middle Column: Radar details */}
            <div className="glass-card p-6 rounded-2xl border border-zinc-900 flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-bold text-white">Viability Parameters</h3>
                <p className="text-[10px] text-zinc-500">Breakdown of metrics compared to industry averages</p>
              </div>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={scoreRadarData}>
                    <PolarGrid stroke="#27272a" />
                    <PolarAngleAxis dataKey="subject" stroke="#a1a1aa" fontSize={8} />
                    <Radar name="Startup" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right Column: Score list metrics */}
            <div className="glass-card p-6 rounded-2xl border border-zinc-900 flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-bold text-white">Analysis Indexes</h3>
                <p className="text-[10px] text-zinc-500">Scores by validation indicator</p>
              </div>
              <div className="flex flex-col gap-3.5 mt-2">
                {[
              { label: "Problem Validation", val: report.score?.validation, desc: "Severity of user issue" },
              { label: "Market Demand", val: report.score?.demand, desc: "Search index and volume trends" },
              { label: "Competition Level", val: report.score?.competition, desc: "Market density factors (Higher is less intense)" },
              { label: "Revenue Potential", val: report.score?.revenue, desc: "Strategy monetization index" },
              { label: "Scalability", val: report.score?.scalability, desc: "Expansion and unit margin capabilities" },
              { label: "Investor Appeal", val: report.score?.appeal, desc: "Early-stage financing attraction" }].
              map((item, idx) =>
              <div key={idx} className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-zinc-300">{item.label}</span>
                      <span className="text-violet-400 font-bold">{item.val}/100</span>
                    </div>
                    <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-violet-600 h-full rounded-full" style={{ width: `${item.val}%` }} />
                    </div>
                  </div>
              )}
              </div>
            </div>
          </div>
        }

        {/* TAB 2: Market Report */}
        {activeTab === 'report' &&
        <div className="flex flex-col gap-6 animate-fade-in">
            {/* Market size overview grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card p-5 rounded-2xl border border-zinc-900 flex flex-col gap-1">
                <span className="text-[9px] uppercase font-mono tracking-widest text-zinc-500">Industry Sector</span>
                <div className="text-base font-bold text-white truncate">{report.industry}</div>
              </div>
              <div className="glass-card p-5 rounded-2xl border border-zinc-900 flex flex-col gap-1">
                <span className="text-[9px] uppercase font-mono tracking-widest text-cyan-400">Total Market Size</span>
                <div className="text-base font-bold text-cyan-400">{report.marketSize}</div>
              </div>
              <div className="glass-card p-5 rounded-2xl border border-zinc-900 flex flex-col gap-1">
                <span className="text-[9px] uppercase font-mono tracking-widest text-emerald-400">Growth Velocity</span>
                <div className="text-base font-bold text-emerald-400">{report.growthRate}</div>
              </div>
            </div>

            {/* Overview & SWOT Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Overview text */}
              <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-zinc-900 flex flex-col gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Market Overview</h3>
                  <p className="text-[10px] text-zinc-500">Autonomous landscape assessment</p>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-light whitespace-pre-line">
                  {report.industryOverview}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-zinc-900/60 pt-4 mt-2">
                  <div className="flex flex-col gap-2">
                    <h4 className="text-[10px] uppercase font-mono tracking-widest text-violet-400 font-bold">Emerging Trends</h4>
                    <ul className="flex flex-col gap-1.5">
                      {report.trends?.map((tr, idx) =>
                    <li key={idx} className="text-xs text-zinc-400 flex items-start gap-2 font-light leading-normal">
                          <span className="text-violet-500 mt-1 shrink-0">•</span>
                          <span>{tr}</span>
                        </li>
                    )}
                    </ul>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h4 className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 font-bold">Key Opportunities</h4>
                    <ul className="flex flex-col gap-1.5">
                      {report.opportunities?.map((op, idx) =>
                    <li key={idx} className="text-xs text-zinc-400 flex items-start gap-2 font-light leading-normal">
                          <span className="text-cyan-500 mt-1 shrink-0">•</span>
                          <span>{op}</span>
                        </li>
                    )}
                    </ul>
                  </div>
                </div>
              </div>

              {/* SWOT Grid */}
              <div className="glass-card p-6 rounded-2xl border border-zinc-900 flex flex-col gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white">SWOT Analysis</h3>
                  <p className="text-[10px] text-zinc-500">Key strategic quadrants</p>
                </div>
                
                {/* 2x2 Grid */}
                <div className="grid grid-cols-2 gap-3.5 mt-2">
                  <div className="p-3.5 rounded-xl bg-violet-950/10 border border-violet-950/20 flex flex-col gap-1.5">
                    <span className="text-[9px] font-bold text-violet-400 uppercase font-mono tracking-widest">Strengths</span>
                    <p className="text-[10px] text-zinc-400 font-light leading-snug line-clamp-4">{report.swot?.strengths?.[0] || 'Internal values'}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-amber-950/10 border border-amber-950/20 flex flex-col gap-1.5">
                    <span className="text-[9px] font-bold text-amber-400 uppercase font-mono tracking-widest">Weaknesses</span>
                    <p className="text-[10px] text-zinc-400 font-light leading-snug line-clamp-4">{report.swot?.weaknesses?.[0] || 'Internal constraints'}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-cyan-950/10 border border-cyan-950/20 flex flex-col gap-1.5">
                    <span className="text-[9px] font-bold text-cyan-400 uppercase font-mono tracking-widest">Opportunities</span>
                    <p className="text-[10px] text-zinc-400 font-light leading-snug line-clamp-4">{report.swot?.opportunities?.[0] || 'External assets'}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-rose-950/10 border border-rose-950/20 flex flex-col gap-1.5">
                    <span className="text-[9px] font-bold text-rose-400 uppercase font-mono tracking-widest">Threats</span>
                    <p className="text-[10px] text-zinc-400 font-light leading-snug line-clamp-4">{report.swot?.threats?.[0] || 'Market hazards'}</p>
                  </div>
                </div>
                <div className="text-[9px] text-zinc-500 font-light italic mt-1 text-center">Check the PDF export to view full SWOT bullet lists.</div>
              </div>
            </div>

            {/* Competitor Analysis comparison table */}
            <div className="glass-card rounded-2xl border border-zinc-900 overflow-hidden flex flex-col gap-4 p-6">
              <div>
                <h3 className="text-sm font-bold text-white">Competitor Intelligence</h3>
                <p className="text-[10px] text-zinc-500">Live competitor comparisons table</p>
              </div>

              <div className="overflow-x-auto border border-zinc-900 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-zinc-900 bg-zinc-950/40 text-zinc-500 uppercase font-mono text-[9px]">
                      <th className="p-3 font-semibold">Competitor</th>
                      <th className="p-3 font-semibold">Funding</th>
                      <th className="p-3 font-semibold">Strengths</th>
                      <th className="p-3 font-semibold">Weaknesses</th>
                      <th className="p-3 font-semibold">Pricing</th>
                      <th className="p-3 font-semibold">Market Position</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.competitors?.map((comp, idx) =>
                  <tr key={idx} className="border-b border-zinc-900/60 last:border-b-0 hover:bg-zinc-950/10 transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-zinc-200">{comp.name}</div>
                          <a href={comp.website} target="_blank" rel="noopener noreferrer" className="text-[9px] text-zinc-500 hover:text-violet-400 font-mono flex items-center gap-0.5 mt-0.5">
                            <span>Link</span>
                            <ChevronRight className="w-2.5 h-2.5" />
                          </a>
                        </td>
                        <td className="p-3 text-zinc-400 font-light truncate max-w-[100px]">{comp.funding}</td>
                        <td className="p-3 text-zinc-400 max-w-[200px]">
                          <div className="line-clamp-2 leading-relaxed text-[11px]">{comp.strengths?.join(', ')}</div>
                        </td>
                        <td className="p-3 text-zinc-400 max-w-[200px]">
                          <div className="line-clamp-2 leading-relaxed text-[11px]">{comp.weaknesses?.join(', ')}</div>
                        </td>
                        <td className="p-3 text-zinc-400 font-mono text-[11px]">{comp.pricing}</td>
                        <td className="p-3 text-zinc-300 font-bold">{comp.position}</td>
                      </tr>
                  )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Review Mining & Customer Persona */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Review Mining */}
              <div className="glass-card p-6 rounded-2xl border border-zinc-900 flex flex-col gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Review Mining Analysis</h3>
                  <p className="text-[10px] text-zinc-500">Insights extracted from consumer reviews of alternative platforms</p>
                </div>

                <div className="flex flex-col gap-4 mt-2">
                  <div className="flex gap-4 items-start border-l-2 border-emerald-500 pl-3">
                    <div className="flex-1 flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase font-mono">Most Loved Features</span>
                      <p className="text-xs text-zinc-400 font-light leading-normal">{report.reviewMining?.loved?.[0]}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start border-l-2 border-rose-500 pl-3">
                    <div className="flex-1 flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-rose-400 uppercase font-mono">Core Complaints</span>
                      <p className="text-xs text-zinc-400 font-light leading-normal">{report.reviewMining?.complaints?.[0]}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start border-l-2 border-violet-500 pl-3">
                    <div className="flex-1 flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-violet-400 uppercase font-mono">Unserved Market Gaps</span>
                      <p className="text-xs text-zinc-400 font-light leading-normal">{report.reviewMining?.gaps?.[0]}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Persona */}
              <div className="glass-card p-6 rounded-2xl border border-zinc-900 flex flex-col gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Target Customer Persona</h3>
                  <p className="text-[10px] text-zinc-500">Demographic profile based on buyer mining</p>
                </div>

                {report.personas?.[0] &&
              <div className="flex flex-col gap-3 mt-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-violet-600/30 flex items-center justify-center font-bold text-sm text-violet-400">
                        {report.personas[0].name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{report.personas[0].name}</h4>
                        <span className="text-[10px] text-zinc-500 font-mono">{report.personas[0].occupation} | Age: {report.personas[0].age}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 mt-2">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] uppercase font-mono text-zinc-500 font-bold">Primary Goal</span>
                        <p className="text-xs text-zinc-400 font-light leading-normal">{report.personas[0].goals?.[0]}</p>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] uppercase font-mono text-zinc-500 font-bold">Key Obstacle</span>
                        <p className="text-xs text-zinc-400 font-light leading-normal">{report.personas[0].painPoints?.[0]}</p>
                      </div>
                    </div>
                  </div>
              }
              </div>
            </div>

            {/* Revenue Models Generator */}
            <div className="glass-card p-6 rounded-2xl border border-zinc-900 flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-bold text-white">Monetization Engine</h3>
                <p className="text-[10px] text-zinc-500">Synthesized pricing strategies</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
                {report.revenueModels?.map((model, idx) =>
              <div key={idx} className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-900 flex flex-col justify-between gap-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-xs font-bold text-white">
                        <span>{model.name}</span>
                        <span className="text-violet-400 font-mono">{model.monthlyPricing}</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 font-light leading-relaxed">{model.strategy}</p>
                    </div>
                    <div className="text-[9px] text-zinc-500 font-mono pt-2 border-t border-zinc-900">
                      Potential: <span className="font-bold text-zinc-400">{model.potential}</span>
                    </div>
                  </div>
              )}
              </div>
            </div>

            {/* Domain Suggestions */}
            <div className="glass-card p-6 rounded-2xl border border-zinc-900 flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-bold text-white">Domain &amp; Naming Suggestions</h3>
                <p className="text-[10px] text-zinc-500">Available brand hooks</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                {[
              { ext: '.com', list: report.domains?.com, color: 'text-violet-400 bg-violet-950/20' },
              { ext: '.ai', list: report.domains?.ai, color: 'text-cyan-400 bg-cyan-950/20' },
              { ext: '.io', list: report.domains?.io, color: 'text-emerald-400 bg-emerald-950/20' }].
              map((item, idx) =>
              <div key={idx} className="flex flex-col gap-2 p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-900">
                    <span className={`text-[9px] px-2 py-0.5 rounded font-bold self-start ${item.color}`}>{item.ext}</span>
                    <div className="flex flex-col gap-1 mt-1 font-mono text-[10px] text-zinc-400">
                      {item.list?.map((dom) =>
                  <div key={dom} className="truncate">{dom}</div>
                  )}
                    </div>
                  </div>
              )}
              </div>
            </div>
          </div>
        }

        {/* TAB 3: MVP Roadmap Planner */}
        {activeTab === 'mvp' &&
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Left: Feature priorization list */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="glass-card p-6 rounded-2xl border border-zinc-900 flex flex-col gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Feature Recommendation Engine</h3>
                  <p className="text-[10px] text-zinc-500">Prioritized implementation catalog</p>
                </div>

                <div className="flex flex-col gap-4 mt-2">
                  {[
                { label: "Must-Have (Core MVP)", list: report.features?.mustHave, color: 'border-l-2 border-violet-500' },
                { label: "Good-To-Have", list: report.features?.goodToHave, color: 'border-l-2 border-cyan-500' },
                { label: "Future Extensions", list: report.features?.future, color: 'border-l-2 border-zinc-700' }].
                map((group, idx) =>
                <div key={idx} className={`p-4 rounded-xl bg-zinc-950/40 border border-zinc-900 ${group.color} flex flex-col gap-2`}>
                      <span className="text-[10px] font-bold text-white uppercase font-mono tracking-widest">{group.label}</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                        {group.list?.map((feat) =>
                    <div key={feat} className="text-xs text-zinc-400 flex items-center gap-2 font-light">
                            <Check className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                            <span>{feat}</span>
                          </div>
                    )}
                      </div>
                    </div>
                )}
                </div>
              </div>

              {/* 3-Phase Roadmap stepper */}
              <div className="glass-card p-6 rounded-2xl border border-zinc-900 flex flex-col gap-6">
                <div>
                  <h3 className="text-sm font-bold text-white">MVP Roadmap Timeline</h3>
                  <p className="text-[10px] text-zinc-500">Incremental development checklist</p>
                </div>

                <div className="flex flex-col gap-6 mt-2">
                  {[
                { title: report.roadmap?.phase1?.title || "Phase 1", list: report.roadmap?.phase1?.features },
                { title: report.roadmap?.phase2?.title || "Phase 2", list: report.roadmap?.phase2?.features },
                { title: report.roadmap?.phase3?.title || "Phase 3", list: report.roadmap?.phase3?.features }].
                map((phase, pIdx) =>
                <div key={pIdx} className="flex gap-4 relative">
                      {pIdx < 2 &&
                  <div className="absolute top-8 left-3.5 w-[1px] h-full bg-zinc-900" />
                  }
                      <div className="w-7 h-7 rounded-full bg-violet-950/20 border border-violet-900/40 flex items-center justify-center font-mono text-xs text-violet-400 font-bold shrink-0">
                        {pIdx + 1}
                      </div>
                      <div className="flex flex-col gap-1.5 pt-0.5">
                        <h4 className="text-xs font-bold text-white">{phase.title}</h4>
                        <div className="flex flex-col gap-1">
                          {phase.list?.map((f, fIdx) =>
                      <div key={fIdx} className="text-[11px] text-zinc-400 font-light flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-zinc-800 shrink-0" />
                              <span>{f}</span>
                            </div>
                      )}
                        </div>
                      </div>
                    </div>
                )}
                </div>
              </div>
            </div>

            {/* Right: Resource requirements & launch plan */}
            <div className="flex flex-col gap-6">
              <div className="glass-card p-6 rounded-2xl border border-zinc-900 flex flex-col gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Resource Requirements</h3>
                  <p className="text-[10px] text-zinc-500">Required budget allocations</p>
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  {report.roadmap?.resources?.map((res, idx) =>
                <div key={idx} className="text-xs text-zinc-400 font-light p-3 rounded-lg bg-zinc-950/60 border border-zinc-900">
                      {res}
                    </div>
                )}
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-zinc-900 flex flex-col gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Go-To-Market Plan</h3>
                  <p className="text-[10px] text-zinc-500">Recommended launch workflow</p>
                </div>
                <div className="flex flex-col gap-3.5 mt-2">
                  {report.roadmap?.launchPlan?.map((plan, idx) =>
                <div key={idx} className="flex gap-3 items-start">
                      <span className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold font-mono text-[9px] text-zinc-500 shrink-0 mt-0.5">{idx + 1}</span>
                      <p className="text-xs text-zinc-400 font-light leading-normal">{plan}</p>
                    </div>
                )}
                </div>
              </div>
            </div>
          </div>
        }

        {/* TAB 4: Pitch Deck Slide Viewer */}
        {activeTab === 'pitch' &&
        <div className="flex flex-col gap-6 animate-fade-in">
            {/* Top presentation info */}
            <div className="flex justify-between items-center glass-card px-5 py-4 rounded-2xl border border-zinc-900">
              <div className="flex items-center gap-3">
                <Presentation className="w-5 h-5 text-violet-400" />
                <div>
                  <h3 className="text-xs font-bold text-white">Investor Pitch Presentation</h3>
                  <p className="text-[9px] text-zinc-500">Auto-generated 10-slide core showcase</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <button
                onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
                disabled={currentSlide === 0}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 border border-zinc-850 text-[10px]">
                
                  Prev
                </button>
                <span className="text-[10px] text-zinc-400 font-mono font-semibold px-2">{currentSlide + 1} / 10</span>
                <button
                onClick={() => setCurrentSlide((prev) => Math.min(9, prev + 1))}
                disabled={currentSlide === 9}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 border border-zinc-850 text-[10px]">
                
                  Next
                </button>
              </div>
            </div>

            {/* Landscape Presentation Box */}
            <div className="slide-container rounded-2xl border border-zinc-900 bg-[#07070e] flex flex-col justify-between p-8 sm:p-12 shadow-2xl relative overflow-hidden select-none">
              <div className="absolute top-0 left-0 w-64 h-64 bg-violet-600/3 rounded-full blur-[80px]" />
              
              {/* Slide Header */}
              <div className="flex justify-between items-center border-b border-zinc-900 pb-4 z-10">
                <span className="text-[9px] font-bold text-violet-500 uppercase font-mono tracking-widest">
                  Slide {currentSlide + 1}
                </span>
                <span className="text-[9px] text-zinc-600 font-mono">{report.projectName} | Pitch Deck</span>
              </div>

              {/* Slide Body */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-8 items-center py-6 sm:py-8 z-10">
                {/* Left: Bullet contents */}
                <div className="md:col-span-3 flex flex-col gap-4">
                  <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    {report.pitchDeck?.[currentSlide]?.title || "Pitch Slide"}
                  </h2>
                  <ul className="flex flex-col gap-3">
                    {report.pitchDeck?.[currentSlide]?.bullets?.map((bullet, idx) =>
                  <li key={idx} className="text-xs sm:text-sm text-zinc-400 flex items-start gap-2.5 leading-relaxed font-light">
                        <span className="text-violet-500 mt-1.5 shrink-0">•</span>
                        <span>{bullet}</span>
                      </li>
                  )}
                  </ul>
                </div>

                {/* Right: Graphic helpers */}
                <div className="md:col-span-2 p-5 rounded-xl bg-zinc-950/60 border border-zinc-900 flex flex-col justify-center items-center text-center aspect-[4/3] relative overflow-hidden">
                  {currentSlide === 0 &&
                <div className="flex flex-col gap-2">
                      <div className="text-3xl font-black text-rose-500 animate-pulse">8+ Hours</div>
                      <span className="text-[10px] text-zinc-500 uppercase font-mono">Wasted Weekly by Customers</span>
                    </div>
                }
                  {currentSlide === 1 &&
                <div className="flex flex-col gap-2">
                      <Zap className="w-10 h-10 text-violet-400 animate-bounce" />
                      <span className="text-[10px] text-zinc-400 font-semibold">{report.projectName} Solution</span>
                    </div>
                }
                  {currentSlide === 2 &&
                <div className="flex flex-col gap-1">
                      <div className="text-2xl font-black text-cyan-400">{report.marketSize}</div>
                      <span className="text-[9px] text-zinc-500 uppercase font-mono">{report.growthRate} Market</span>
                    </div>
                }
                  {currentSlide === 4 &&
                <div className="flex flex-col gap-1.5 w-full text-left font-mono text-[9px] text-zinc-400">
                      <div className="flex justify-between border-b border-zinc-900 pb-1 font-bold text-white">
                        <span>Startup</span>
                        <span>AI Score</span>
                      </div>
                      <div className="flex justify-between text-violet-400 font-bold">
                        <span>{report.projectName}</span>
                        <span>{report.score?.overall}</span>
                      </div>
                      <div className="flex justify-between text-zinc-600">
                        <span>{report.competitors?.[0]?.name || 'Legacy'}</span>
                        <span>{report.competitors?.[0]?.pricing ? 'Low' : '60'}</span>
                      </div>
                    </div>
                }
                  {currentSlide === 5 &&
                <div className="flex flex-col gap-2">
                      <DollarSign className="w-8 h-8 text-emerald-400" />
                      <span className="text-xs font-bold text-zinc-300">{report.revenueModels?.[1]?.name || 'SaaS'}</span>
                      <span className="text-[9px] text-zinc-500 font-mono">{report.revenueModels?.[1]?.monthlyPricing || '$39'}/mo</span>
                    </div>
                }
                  {currentSlide > 5 &&
                <div className="flex flex-col gap-1">
                      <div className="text-lg font-bold text-violet-400">{report.projectName}</div>
                      <span className="text-[9px] text-zinc-500 uppercase font-mono">Ready to Scale</span>
                    </div>
                }
                </div>
              </div>

              {/* Slide Footer */}
              <div className="flex justify-between items-center text-[8px] text-zinc-600 font-mono pt-4 border-t border-zinc-900/60 z-10">
                <span>CONFIDENTIAL &amp; PROPRIETARY</span>
                <span>Page {currentSlide + 1}</span>
              </div>
            </div>

            {/* Elevator pitch cards */}
            <div className="glass-card p-6 rounded-2xl border border-zinc-900 flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-bold text-white">Elevator Pitch Templates</h3>
                <p className="text-[10px] text-zinc-500">Pre-structured voiceovers for pitches</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-900 flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-violet-400 uppercase font-mono">30-Second Elevator Pitch</span>
                  <p className="text-xs text-zinc-400 font-light leading-relaxed italic">&ldquo;{report.elevatorPitches?.s30}&rdquo;</p>
                </div>
                <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-900 flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase font-mono">Investor Value Pitch</span>
                  <p className="text-xs text-zinc-400 font-light leading-relaxed italic">&ldquo;{report.elevatorPitches?.investor}&rdquo;</p>
                </div>
              </div>
            </div>
          </div>
        }

        {/* TAB 5: Team Room Collaboration */}
        {activeTab === 'team' &&
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Left Column: Comments Panel */}
            <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-zinc-900 flex flex-col gap-6">
              <div>
                <h3 className="text-sm font-bold text-white">Workspace Comments</h3>
                <p className="text-[10px] text-zinc-500">Leave feedback or notes on specific validation metrics</p>
              </div>

              {/* Comments list */}
              <div className="flex-1 flex flex-col gap-4 max-h-[350px] overflow-y-auto pr-2">
                {!project.comments || project.comments.length === 0 ?
              <div className="text-center py-12 text-zinc-600 flex flex-col items-center gap-2">
                    <MessageSquare className="w-8 h-8 text-zinc-800" />
                    <span className="text-[10px] font-light font-mono">No comments logged in this workspace yet.</span>
                  </div> :

              project.comments.map((comment) =>
              <div key={comment.id} className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-900 flex flex-col gap-1">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="font-bold text-violet-400">{comment.user}</span>
                        <span className="text-zinc-600">{new Date(comment.date).toLocaleDateString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-xs text-zinc-400 font-light leading-relaxed">{comment.text}</p>
                    </div>
              )
              }
              </div>

              {/* Add Comment input */}
              <form onSubmit={handleAddComment} className="flex gap-2 border-t border-zinc-900/60 pt-4 mt-2">
                <input
                type="text"
                placeholder="Ask teammates or log a checklist note..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-950/60 border border-zinc-900 focus:border-violet-600 focus:outline-none text-xs text-white" />
              
                <button
                type="submit"
                className="p-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition-all shrink-0">
                
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Right Column: Teammates lists & timeline */}
            <div className="flex flex-col gap-6">
              {/* Teammates List */}
              <div className="glass-card p-6 rounded-2xl border border-zinc-900 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-white">Active Teammates</h3>
                    <p className="text-[10px] text-zinc-500">Shared workspace collaborators</p>
                  </div>
                  <button
                  onClick={() => setShowInviteModal(true)}
                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
                  
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <div className="w-6 h-6 rounded-full bg-violet-600/30 flex items-center justify-center font-bold text-[10px] text-violet-400">
                      Y
                    </div>
                    <span className="font-medium text-zinc-300">You (Owner)</span>
                  </div>
                  {project.teamMembers?.map((member, idx) =>
                <div key={idx} className="flex items-center gap-2 text-xs text-zinc-400">
                      <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-[10px] text-zinc-500">
                        {member.charAt(0)}
                      </div>
                      <span className="truncate max-w-[180px]">{member}</span>
                    </div>
                )}
                </div>
              </div>

              {/* Shared Activities Timeline */}
              <div className="glass-card p-6 rounded-2xl border border-zinc-900 flex flex-col gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Activity Timeline</h3>
                  <p className="text-[10px] text-zinc-500">Audit logs of project modifications</p>
                </div>

                <div className="flex flex-col gap-4 mt-2 font-mono text-[9px] text-zinc-500">
                  <div className="flex gap-2 items-start">
                    <Clock className="w-3.5 h-3.5 mt-0.5 text-violet-400 shrink-0" />
                    <div className="flex-1">
                      <span className="text-zinc-400">Project duplicated</span>
                      <span className="block text-[8px] mt-0.5 text-zinc-650">Today</span>
                    </div>
                  </div>
                  <div className="flex gap-2 items-start">
                    <Clock className="w-3.5 h-3.5 mt-0.5 text-violet-400 shrink-0" />
                    <div className="flex-1">
                      <span className="text-zinc-400">AI analysis completed</span>
                      <span className="block text-[8px] mt-0.5 text-zinc-650">Today</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      </div>

      {/* Floating AI Copilot Chat Button & Drawer */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="w-12 h-12 rounded-full bg-gradient-to-tr from-violet-600 to-cyan-500 text-white flex items-center justify-center shadow-xl shadow-violet-600/20 hover:scale-105 transition-transform"
          title="Ask AI Copilot">
          
          {chatOpen ?
          <span className="font-bold text-sm">✕</span> :

          <MessageSquare className="w-6 h-6 text-white" />
          }
        </button>
      </div>

      {/* Slide-out AI Copilot Drawer */}
      {chatOpen &&
      <div className="fixed top-0 right-0 bottom-0 z-40 w-full max-w-sm border-l border-zinc-900 bg-[#06060c] shadow-2xl flex flex-col justify-between p-5 animate-slide-in">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <div>
                <h4 className="text-xs font-bold text-white">AI Startup Copilot</h4>
                <span className="text-[8px] text-zinc-500 uppercase font-mono">Referencing {project.name} report</span>
              </div>
            </div>
            <button
            onClick={() => setChatOpen(false)}
            className="p-1 rounded-md bg-zinc-950 hover:bg-zinc-900 text-zinc-500 hover:text-white">
            
              ✕
            </button>
          </div>

          {/* Chat scroll history area */}
          <div className="flex-1 overflow-y-auto my-4 flex flex-col gap-3 pr-2 scrollbar-thin select-none">
            {chatHistory.map((item, idx) =>
          <div
            key={idx}
            className={`p-3 rounded-xl text-xs leading-relaxed max-w-[85%] ${
            item.role === 'user' ?
            'bg-violet-600 text-white self-end font-medium' :
            'bg-zinc-950 border border-zinc-900 text-zinc-300 self-start font-light'}`
            }>
            
                {item.content}
              </div>
          )}
            {chatLoading &&
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-500 self-start font-light text-xs flex items-center gap-1.5 animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" />
                <span>Copilot is analyzing...</span>
              </div>
          }
            <div ref={chatBottomRef} />
          </div>

          {/* Chat form field */}
          <form onSubmit={handleChatSubmit} className="flex gap-2 pt-3 border-t border-zinc-900">
            <input
            type="text"
            placeholder="How can I monetize this?..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-900 focus:border-violet-600 focus:outline-none text-[11px] text-white" />
          
            <button
            type="submit"
            disabled={chatLoading || !chatInput.trim()}
            className="p-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-bold transition-all">
            
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      }

      {/* Invite Teammate Modal */}
      {showInviteModal &&
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowInviteModal(false)} />
          <div className="relative glass-card border border-zinc-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl z-10">
            <h3 className="font-bold text-sm text-white mb-2">Invite Collaborator</h3>
            <p className="text-[10px] text-zinc-500 mb-4 leading-normal font-light">Invite team members to view and comment on this startup validation workspace.</p>
            
            <form onSubmit={handleInviteTeammate} className="flex flex-col gap-3">
              <input
              type="email"
              required
              placeholder="co-founder@startup.com"
              value={teammateEmail}
              onChange={(e) => setTeammateEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-900 focus:border-violet-600 focus:outline-none text-xs text-white" />
            
              <div className="flex justify-end gap-2 mt-2">
                <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 rounded-lg text-xs text-zinc-500 hover:text-white">
                
                  Cancel
                </button>
                <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold">
                
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      {/* ============================================================== */}
      {/* HIDDEN PRINT VIEW: Portrait Report & Landscape Presentation Slides */}
      {/* ============================================================== */}
      <div className="hidden print:block text-black bg-white min-h-screen p-8 text-left">
        {/* Printable Portrait validation report */}
        <div className="print-page flex flex-col gap-8 text-black bg-white">
          <div className="flex justify-between items-start border-b-2 border-black pb-4">
            <div>
              <h1 className="text-3xl font-black">{report.projectName}</h1>
              <p className="text-sm font-mono uppercase text-gray-600 mt-1">{report.industry} | {report.country}</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-black text-gray-800">Score: {report.score?.overall}/100</h2>
              <p className="text-xs text-gray-500">StartupScout AI Validation Report</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold border-b border-gray-300 pb-1">Market Overview</h3>
            <p className="text-xs leading-relaxed text-gray-750">{report.industryOverview}</p>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase font-mono">Market Size</span>
                <span className="text-sm font-bold">{report.marketSize}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase font-mono">CAGR Growth</span>
                <span className="text-sm font-bold">{report.growthRate}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold border-b border-gray-300 pb-1">SWOT Quadrant Analysis</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border border-gray-350 rounded-lg">
                <span className="text-[10px] font-bold uppercase text-gray-500 font-mono">Strengths</span>
                <ul className="text-[10px] text-gray-700 flex flex-col gap-1 list-disc pl-4 mt-2">
                  {report.swot?.strengths?.map((s, idx) => <li key={idx}>{s}</li>)}
                </ul>
              </div>
              <div className="p-3 border border-gray-350 rounded-lg">
                <span className="text-[10px] font-bold uppercase text-gray-500 font-mono font-mono">Weaknesses</span>
                <ul className="text-[10px] text-gray-700 flex flex-col gap-1 list-disc pl-4 mt-2">
                  {report.swot?.weaknesses?.map((w, idx) => <li key={idx}>{w}</li>)}
                </ul>
              </div>
              <div className="p-3 border border-gray-350 rounded-lg">
                <span className="text-[10px] font-bold uppercase text-gray-500 font-mono">Opportunities</span>
                <ul className="text-[10px] text-gray-700 flex flex-col gap-1 list-disc pl-4 mt-2">
                  {report.swot?.opportunities?.map((o, idx) => <li key={idx}>{o}</li>)}
                </ul>
              </div>
              <div className="p-3 border border-gray-350 rounded-lg">
                <span className="text-[10px] font-bold uppercase text-gray-500 font-mono">Threats</span>
                <ul className="text-[10px] text-gray-700 flex flex-col gap-1 list-disc pl-4 mt-2">
                  {report.swot?.threats?.map((t, idx) => <li key={idx}>{t}</li>)}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold border-b border-gray-300 pb-1">Competitors Comparison Matrix</h3>
            <table className="w-full text-left border-collapse text-[10px] border border-gray-300">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="p-2 font-bold uppercase">Name</th>
                  <th className="p-2 font-bold uppercase">Pricing</th>
                  <th className="p-2 font-bold uppercase">Funding</th>
                  <th className="p-2 font-bold uppercase">Market Position</th>
                </tr>
              </thead>
              <tbody>
                {report.competitors?.map((comp, idx) =>
                <tr key={idx} className="border-b border-gray-200">
                    <td className="p-2 font-bold">{comp.name}</td>
                    <td className="p-2 font-mono">{comp.pricing}</td>
                    <td className="p-2">{comp.funding}</td>
                    <td className="p-2">{comp.position}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Printable landscape 10-slide Pitch Deck */}
        {report.pitchDeck?.map((slide) =>
        <div key={slide.id} className="print-page flex flex-col justify-between aspect-[16/9] w-full border border-gray-300 p-8 my-8 text-black bg-white">
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="text-[10px] font-bold uppercase font-mono tracking-widest text-gray-500">Slide {slide.id}</span>
              <span className="text-[10px] text-gray-500 font-mono">{report.projectName} | Pitch Deck</span>
            </div>
            
            <div className="flex-1 grid grid-cols-5 gap-8 items-center py-6">
              <div className="col-span-3 flex flex-col gap-4">
                <h2 className="text-xl font-bold">{slide.title}</h2>
                <ul className="text-xs text-gray-700 flex flex-col gap-2 list-disc pl-4">
                  {slide.bullets?.map((b, bIdx) =>
                <li key={bIdx} className="leading-relaxed">{b}</li>
                )}
                </ul>
              </div>
              <div className="col-span-2 p-4 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center text-center aspect-[4/3]">
                {slide.id === 1 && <span className="text-sm font-bold text-gray-800">Problem Focus: User Overhead</span>}
                {slide.id === 2 && <span className="text-sm font-bold text-gray-800">Solution Focus: {report.projectName}</span>}
                {slide.id === 3 && <span className="text-sm font-bold text-gray-800">TAM Size: {report.marketSize}</span>}
                {slide.id > 3 && <span className="text-sm font-bold text-gray-800">{report.projectName} Venture Growth</span>}
              </div>
            </div>

            <div className="flex justify-between items-center text-[8px] text-gray-400 font-mono pt-2 border-t border-gray-150">
              <span>CONFIDENTIAL</span>
              <span>Slide {slide.id} of 10</span>
            </div>
          </div>
        )}
      </div>
    </div>);

}