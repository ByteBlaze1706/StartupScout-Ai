'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, ArrowRight, ArrowLeft, ShieldCheck, 
  Loader2, Sparkles, Terminal, CheckCircle, HelpCircle
} from 'lucide-react';
import { db, DBProject } from '@/lib/db';
import { z } from 'zod';

// Zod schema for client-side form validation matching the backend
const analyzeFormSchema = z.object({
  name: z.string().min(1, 'Startup Name is required.').max(100, 'Name must be under 100 characters.'),
  idea: z.string().min(10, 'Idea description must be at least 10 characters long.').max(1000, 'Idea must be under 1000 characters.'),
  industry: z.string().min(1, 'Please select an industry.'),
  country: z.string().min(1, 'Please select a target country.'),
  targetAudience: z.string().min(5, 'Target audience description must be at least 5 characters.').max(200),
  budget: z.string().min(1, 'Budget is required.'),
  teamSize: z.string().min(1, 'Team size is required.'),
  stage: z.string().min(1, 'Please select a startup stage.')
});

// Defining the 6 specialized AI Agents
const AGENTS = [
  { id: 'research', label: 'Research Agent', role: 'TAM/SAM/SOM Sizing', desc: 'Queries market indicators, counts target demographic datasets, and measures CAGR ratios.' },
  { id: 'competitor', label: 'Competitor Agent', role: 'Competitive Intelligence', desc: 'Profiles competitive densities, scans digital catalogs, and extracts positioning maps.' },
  { id: 'swot', label: 'SWOT Agent', role: 'Quadrant Synthesis', desc: 'Evaluates internal capabilities against external market constraints and regulatory policies.' },
  { id: 'revenue', label: 'Revenue Agent', role: 'Economics Modeling', desc: 'Builds subscription models, forecasts lifetime contract values, and charts unit economics.' },
  { id: 'roadmap', label: 'Roadmap Agent', role: 'MVP Pipeline', desc: 'Constructs chronological milestone sprints, product feature tiers, and launch checklists.' },
  { id: 'pitch', label: 'Pitch Deck Agent', role: 'Presentation Architect', desc: 'Structures 10 slide grids, outlines elevator hooks, and drafts investor grading reports.' }
];

const MOCK_LOGS: Record<string, string[]> = {
  research: [
    'Spinning up Research Agent core node...',
    'Querying sector indices and market parameters...',
    'Extracting revenue statistics, growth indices, and CAGR values...',
    'Completed TAM/SAM/SOM sizing matrix.'
  ],
  competitor: [
    'Activating Competitor Agent scrapers...',
    'Mapping competitors: CompPro, FlowSaaS, and Incumbents...',
    'Running competitive density indexes and funding matrices...',
    'Competitor matrix assembled successfully.'
  ],
  swot: [
    'Synthesizing SWOT quadrants...',
    'Weighting regulatory constraints and barriers to entry...',
    'Calculating internal strength metrics and opportunities...',
    'SWOT quadrant matrix completed.'
  ],
  revenue: [
    'Modeling unit economics and monetization routes...',
    'Drafting Starter, Pro, and Enterprise subscription pricing plans...',
    'Generating 3-year recurring revenue projections...',
    'Revenue models completed.'
  ],
  roadmap: [
    'Configuring MVP roadmap pipelines...',
    'Phase 1: Validation and core features (60 days)...',
    'Phase 2: Growth integration (60 days)...',
    'Roadmap features and timeline completed.'
  ],
  pitch: [
    'Assembling 10 landscape pitch deck slides...',
    'Drafting 30s, 60s, and investor elevator pitches...',
    'Weighting score coefficients and generating final validation brief...',
    'PDF report compiled. Finalizing database write...'
  ]
};

const INDUSTRIES = [
  'Tech SaaS', 'Artificial Intelligence', 'Fintech', 'Healthtech', 
  'Edtech', 'E-commerce', 'Web3 / Crypto', 'Clean Energy', 
  'Logistics / Supply Chain', 'B2B Software', 'Developer Tools'
];

const COUNTRIES = [
  'Global', 'United States', 'United Kingdom', 'European Union', 
  'Canada', 'India', 'Singapore', 'Australia', 'Japan', 'Brazil'
];

export default function AnalyzePage() {
  const router = useRouter();
  const [analyzing, setAnalyzing] = useState(false);
  const [currentAgentIndex, setCurrentAgentIndex] = useState(0);
  const [agentProgress, setAgentProgress] = useState<Record<string, number>>({
    research: 0, competitor: 0, swot: 0, revenue: 0, roadmap: 0, pitch: 0
  });
  const [logs, setLogs] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    idea: '',
    industry: 'Tech SaaS',
    country: 'United States',
    targetAudience: 'Early-stage founders and builders',
    budget: '5000',
    teamSize: '3',
    stage: 'Idea Stage'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiResult, setApiResult] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Helper to format currency
  const formatCurrency = (val: string) => {
    const num = parseInt(val);
    if (num >= 500000) return '$500,000+';
    return `$${num.toLocaleString()}`;
  };

  // Step progression simulated agent runs
  useEffect(() => {
    if (!analyzing || apiError) return;

    const currentAgentId = AGENTS[currentAgentIndex].id;
    let progressVal = 0;
    let logIdx = 0;
    const stepLogs = MOCK_LOGS[currentAgentId] || [];

    const interval = setInterval(() => {
      // Progress increment
      progressVal += Math.floor(Math.random() * 15) + 5;
      if (progressVal >= 100) {
        progressVal = 100;
        clearInterval(interval);
      }

      setAgentProgress(prev => ({ ...prev, [currentAgentId]: progressVal }));

      // Add log
      if (logIdx < stepLogs.length && Math.random() > 0.4) {
        setLogs(prev => [...prev, `[${AGENTS[currentAgentIndex].label}] ${stepLogs[logIdx]}`]);
        logIdx++;
      }
    }, 250);

    const stepDuration = 3200;
    const nextTimer = setTimeout(() => {
      clearInterval(interval);
      setAgentProgress(prev => ({ ...prev, [currentAgentId]: 100 }));
      
      // Ensure all logs are printed
      stepLogs.slice(logIdx).forEach(log => {
        setLogs(prev => [...prev, `[${AGENTS[currentAgentIndex].label}] ${log}`]);
      });

      if (currentAgentIndex < AGENTS.length - 1) {
        setLogs(prev => [...prev, `>>> Delegating control to ${AGENTS[currentAgentIndex + 1].label}...`]);
        setCurrentAgentIndex(prev => prev + 1);
      } else {
        // All agents finished
        if (apiResult) {
          handleComplete(apiResult);
        } else {
          setLogs(prev => [...prev, "[System] Waiting for AI analysis payload to finalize..."]);
        }
      }
    }, stepDuration);

    return () => {
      clearInterval(interval);
      clearTimeout(nextTimer);
    };
  }, [analyzing, currentAgentIndex, apiResult]);

  // Handle completion check when API finishes after agents
  useEffect(() => {
    if (apiResult && currentAgentIndex === AGENTS.length - 1 && agentProgress.pitch === 100) {
      handleComplete(apiResult);
    }
  }, [apiResult, currentAgentIndex, agentProgress]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const startAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate using Zod schema
    const validationResult = analyzeFormSchema.safeParse(formData);
    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.issues.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setAnalyzing(true);
    setApiError(null);
    setCurrentAgentIndex(0);
    setAgentProgress({ research: 0, competitor: 0, swot: 0, revenue: 0, roadmap: 0, pitch: 0 });
    setLogs(["[System] Booting secure multi-agent workflow runtime...", "[System] Connecting to Gemini neural analysis matrix..."]);

    const maxRetries = 5;
    const baseDelayMs = 3000;

    const executeFetchWithRetry = async (payload: any, attempt: number): Promise<any> => {
      let response: Response | null = null;
      try {
        response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Validation error');
        }
        return data;
      } catch (err: any) {
        const statusCode = response ? response.status : 0;
        const errMsg = err.message || '';
        const isRateLimitOrBusy = 
          statusCode === 429 || 
          statusCode === 503 || 
          statusCode === 504 || 
          statusCode === 502 || 
          errMsg.includes('exhausted') || 
          errMsg.includes('limit') || 
          errMsg.includes('busy') || 
          errMsg.includes('demand') ||
          errMsg.includes('Too many analysis requests') ||
          errMsg.includes('rate limit') ||
          errMsg.includes('ResourceExhausted') ||
          errMsg.includes('temporary') ||
          errMsg.includes('timeout') ||
          errMsg.includes('504') ||
          errMsg.includes('502');

        if (isRateLimitOrBusy && attempt < maxRetries) {
          const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * 1000;
          setLogs(prev => [
            ...prev,
            `[System] System busy, retrying in ${(delay / 1000).toFixed(1)}s (Attempt ${attempt + 1}/${maxRetries})...`
          ]);
          await new Promise(resolve => setTimeout(resolve, delay));
          return executeFetchWithRetry(payload, attempt + 1);
        }
        throw err;
      }
    };

    try {
      const budgetFormatted = formatCurrency(formData.budget);
      const postPayload = {
        ...formData,
        budget: budgetFormatted
      };

      const data = await executeFetchWithRetry(postPayload, 0);
      setApiResult(data);
    } catch (err: any) {
      console.error('API call failed:', err);
      const errMsg = err.message || 'Unknown network error';
      setLogs(prev => [
        ...prev,
        `[System] ERROR: Analysis failed.`,
        `[System] Reason: ${errMsg}`
      ]);
      setApiError(errMsg);
    }
  };

  const handleComplete = async (reportData: any) => {
    // Save to DB
    const newId = `proj_${Math.random().toString(36).substring(2, 11)}`;
    const newProject: DBProject = {
      id: newId,
      name: formData.name || reportData.projectName || 'Unnamed Venture',
      idea: formData.idea,
      industry: formData.industry,
      country: formData.country,
      targetAudience: formData.targetAudience,
      budget: formatCurrency(formData.budget),
      stage: formData.stage,
      createdAt: new Date().toISOString(),
      report: reportData,
      teamMembers: ['Founder Workspace'],
      comments: []
    };

    await db.saveProject(newProject);
    router.push(`/dashboard/projects/${newId}`);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <AnimatePresence mode="wait">
        {!analyzing ? (
          /* Smart Form Intake Screen */
          <motion.div
            key="wizard-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="flex flex-col gap-6"
          >
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-violet-400 animate-pulse" />
                <span>Analyze Startup Concept</span>
              </h1>
              <p className="text-xs text-zinc-500 font-light mt-1">Submit your value proposition to deploy automated strategic agents.</p>
            </div>

            <form onSubmit={startAnalysis} className="glass-card rounded-2xl border border-zinc-900 p-6 sm:p-8 flex flex-col gap-6 relative">
              
              {/* Form Validation Errors Global Banner */}
              {Object.keys(errors).length > 0 && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                  Please correct the highlighted validation errors before submitting.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Field 1: Name */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase tracking-wider text-zinc-400 font-mono font-semibold">
                      Startup Name <span className="text-rose-500">*</span>
                    </label>
                    <span className="group relative cursor-pointer text-zinc-500 hover:text-zinc-300">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-44 rounded bg-zinc-950 p-2 text-[9px] text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity border border-zinc-900 shadow-xl leading-normal z-20">
                        The public name of your project or legal entity name.
                      </span>
                    </span>
                  </div>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. FitTrack AI"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 rounded-xl bg-zinc-950/60 border ${errors.name ? 'border-rose-500' : 'border-zinc-900'} focus:border-violet-600 focus:outline-none text-xs text-white`}
                  />
                  {errors.name && <span className="text-[10px] text-rose-400 font-semibold">{errors.name}</span>}
                </div>

                {/* Field 2: Industry (Dropdown Select) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-400 font-mono font-semibold">
                    Industry Sector <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950/60 border border-zinc-900 focus:border-violet-600 focus:outline-none text-xs text-white"
                  >
                    {INDUSTRIES.map(ind => (
                      <option key={ind} value={ind} className="bg-zinc-950">{ind}</option>
                    ))}
                  </select>
                </div>

                {/* Field 3: Country (Dropdown Select) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-400 font-mono font-semibold">
                    Target Country <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950/60 border border-zinc-900 focus:border-violet-600 focus:outline-none text-xs text-white"
                  >
                    {COUNTRIES.map(c => (
                      <option key={c} value={c} className="bg-zinc-950">{c}</option>
                    ))}
                  </select>
                </div>

                {/* Field 4: Target Audience */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-400 font-mono font-semibold">
                    Target Audience Demographic <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="targetAudience"
                    placeholder="e.g. Busy software engineering managers"
                    value={formData.targetAudience}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 rounded-xl bg-zinc-950/60 border ${errors.targetAudience ? 'border-rose-500' : 'border-zinc-900'} focus:border-violet-600 focus:outline-none text-xs text-white`}
                  />
                  {errors.targetAudience && <span className="text-[10px] text-rose-400 font-semibold">{errors.targetAudience}</span>}
                </div>

                {/* Field 5: Budget Slider */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-zinc-400 font-mono font-semibold">
                    <span>Validation Budget Limits</span>
                    <span className="text-violet-400 font-bold font-mono">{formatCurrency(formData.budget)}</span>
                  </div>
                  <input
                    type="range"
                    name="budget"
                    min="1000"
                    max="500000"
                    step="5000"
                    value={formData.budget}
                    onChange={handleInputChange}
                    className="w-full h-1.5 rounded bg-zinc-900 appearance-none cursor-pointer accent-violet-500 focus:outline-none"
                  />
                  <div className="flex justify-between text-[9px] text-zinc-600 font-mono">
                    <span>$1k</span>
                    <span>$250k</span>
                    <span>$500k+</span>
                  </div>
                </div>

                {/* Field 6: Team Size Slider */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-zinc-400 font-mono font-semibold">
                    <span>Core Team Members</span>
                    <span className="text-violet-400 font-bold font-mono">{formData.teamSize} member{parseInt(formData.teamSize) > 1 ? 's' : ''}</span>
                  </div>
                  <input
                    type="range"
                    name="teamSize"
                    min="1"
                    max="50"
                    step="1"
                    value={formData.teamSize}
                    onChange={handleInputChange}
                    className="w-full h-1.5 rounded bg-zinc-900 appearance-none cursor-pointer accent-violet-500 focus:outline-none"
                  />
                  <div className="flex justify-between text-[9px] text-zinc-600 font-mono">
                    <span>1 solo</span>
                    <span>25 members</span>
                    <span>50+ corporate</span>
                  </div>
                </div>

                {/* Field 7: Startup Stage Dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-400 font-mono font-semibold">
                    Startup Stage <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="stage"
                    value={formData.stage}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950/60 border border-zinc-900 focus:border-violet-600 focus:outline-none text-xs text-white"
                  >
                    <option value="Idea Stage" className="bg-zinc-950">Idea Stage</option>
                    <option value="MVP / Prototype" className="bg-zinc-950">MVP / Prototype</option>
                    <option value="Pre-seed Stage" className="bg-zinc-950">Pre-seed Stage</option>
                    <option value="Seed Stage" className="bg-zinc-950">Seed Stage</option>
                    <option value="Bootstrapped" className="bg-zinc-950">Bootstrapped</option>
                  </select>
                </div>
              </div>

              {/* Field 8: Startup Idea Textarea with dynamic character counters */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-400 font-mono font-semibold">
                    Startup Idea &amp; Core Value Proposition <span className="text-rose-500">*</span>
                  </label>
                  <span className={`text-[10px] font-mono font-semibold ${
                    formData.idea.length < 10 ? 'text-amber-500' : 
                    formData.idea.length > 900 ? 'text-rose-500' : 'text-zinc-500'
                  }`}>
                    {formData.idea.length}/1000 chars
                  </span>
                </div>
                <textarea
                  name="idea"
                  rows={4}
                  placeholder="Explain exactly what problem your startup solves, how it solves it, and who it is for (Minimum 10 characters)..."
                  value={formData.idea}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl bg-zinc-950/60 border ${errors.idea ? 'border-rose-500' : 'border-zinc-900'} focus:border-violet-600 focus:outline-none text-xs text-white leading-relaxed resize-none`}
                />
                {errors.idea && <span className="text-[10px] text-rose-400 font-semibold">{errors.idea}</span>}
                {formData.idea.length > 0 && formData.idea.length < 10 && (
                  <span className="text-[10px] text-amber-400 font-semibold">Must be at least 10 characters to launch validation engines.</span>
                )}
              </div>

              {/* Form Actions footer */}
              <div className="flex items-center justify-between border-t border-zinc-900/60 pt-6 mt-4">
                <Link
                  href="/dashboard"
                  className="px-4 py-2.5 rounded-xl text-xs text-zinc-500 hover:text-white transition-colors flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Cancel</span>
                </Link>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-violet-600/10 btn-glow"
                >
                  <span>Launch Research Agents</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          /* Premium AI Agent Workflow Console Screen */
          <motion.div
            key="agent-console"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Left Column: List of 6 AI Agents */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="glass-card rounded-2xl border border-zinc-900 p-6 flex flex-col gap-6">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    {apiError ? (
                      <span className="text-rose-500">Analysis Terminated</span>
                    ) : (
                      <>
                        <Loader2 className="w-4.5 h-4.5 text-violet-400 animate-spin" />
                        <span>Agent Workflow Engine</span>
                      </>
                    )}
                  </h2>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    {apiError ? 'The validation process encountered an error.' : 'Deploying autonomous strategic agents to validate parameters'}
                  </p>
                </div>

                {apiError && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-450 text-xs flex flex-col gap-3">
                    <div className="font-semibold text-rose-450">Error Details:</div>
                    <div className="font-mono text-[10px] bg-zinc-950 p-3 rounded-lg border border-rose-500/20 text-zinc-300 break-words leading-relaxed select-all">
                      {apiError}
                    </div>
                    <div className="flex gap-3 mt-1">
                      <button
                        onClick={() => {
                          setAnalyzing(false);
                          setApiError(null);
                        }}
                        className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white text-xs font-bold transition-colors"
                      >
                        Edit Startup Details
                      </button>
                    </div>
                  </div>
                )}

                {/* Agent Cards */}
                <div className="flex flex-col gap-3.5">
                  {AGENTS.map((agent, index) => {
                    const progress = agentProgress[agent.id] || 0;
                    const isPending = index > currentAgentIndex;
                    const isActive = index === currentAgentIndex;
                    const isCompleted = index < currentAgentIndex;

                    return (
                      <div 
                        key={agent.id}
                        className={`flex flex-col gap-2 p-3.5 rounded-xl border transition-all duration-300 ${
                          isActive 
                            ? 'bg-violet-950/10 border-violet-850 shadow-sm shadow-violet-500/5' 
                            : isCompleted 
                              ? 'bg-zinc-950/15 border-zinc-900/60 opacity-60' 
                              : 'bg-transparent border-transparent opacity-25'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="shrink-0 mt-0.5">
                              {isCompleted ? (
                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                              ) : isActive ? (
                                <div className="w-5 h-5 rounded-full border-2 border-violet-400 border-t-transparent animate-spin" />
                              ) : (
                                <div className="w-5 h-5 rounded-full border border-zinc-800 flex items-center justify-center text-[9px] font-bold text-zinc-500">
                                  {index + 1}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-2">
                                <h4 className={`text-xs font-bold ${isActive ? 'text-violet-400' : 'text-zinc-200'}`}>
                                  {agent.label}
                                </h4>
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 font-semibold">{agent.role}</span>
                              </div>
                              <p className="text-[10px] text-zinc-400 leading-normal font-light">
                                {agent.desc}
                              </p>
                            </div>
                          </div>

                          {/* Progress Percentage Badge */}
                          <div className="shrink-0 text-right">
                            <span className={`text-[10px] font-mono font-bold ${
                              isCompleted ? 'text-emerald-400' : isActive ? 'text-violet-400' : 'text-zinc-600'
                            }`}>
                              {progress}%
                            </span>
                          </div>
                        </div>

                        {/* Animated Progress Bar */}
                        {isActive && (
                          <div className="w-full h-1 bg-zinc-950 rounded overflow-hidden mt-1">
                            <motion.div 
                              className="h-full bg-gradient-to-r from-violet-500 to-indigo-500"
                              initial={{ width: '0%' }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.1 }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Live Terminal logs */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="glass-card rounded-2xl border border-zinc-900 bg-zinc-950/80 p-5 flex flex-col gap-4 h-[580px] font-mono relative">
                <div className="flex items-center gap-2 border-b border-zinc-900 pb-3 text-[10px] text-zinc-500 font-semibold">
                  <Terminal className="w-4 h-4 text-zinc-500" />
                  <span>AGENT WORKSPACE CONSOLE</span>
                </div>
                
                <div className="flex-1 overflow-y-auto text-[9.5px] text-zinc-400 leading-relaxed flex flex-col gap-1.5 pr-2 select-none">
                  {logs.map((log, idx) => (
                    <div 
                      key={idx} 
                      className={`
                        ${log.startsWith('>>>') ? 'text-violet-400 font-bold border-l-2 border-violet-500 pl-2 my-1' : 
                          log.startsWith('[System]') ? 'text-cyan-400' : 'text-zinc-400'}
                      `}
                    >
                      {log}
                    </div>
                  ))}
                  <div className="w-1.5 h-3.5 bg-violet-500 animate-pulse ml-0.5 inline-block" />
                </div>
                
                <div className="absolute bottom-4 left-4 right-4 py-2 border-t border-zinc-900 bg-zinc-950/60 text-center rounded-lg">
                  {apiError ? (
                    <button
                      onClick={() => {
                        setAnalyzing(false);
                        setApiError(null);
                      }}
                      className="text-[9px] text-rose-400 uppercase tracking-widest font-bold hover:underline"
                    >
                      Return to intake form
                    </button>
                  ) : (
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">
                      ETA: {Math.max(0, (AGENTS.length - currentAgentIndex) * 3)}s
                    </span>
                  )}
                </div>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
