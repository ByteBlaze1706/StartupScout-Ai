'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Play, Shield, Zap, Search, Target, 
  TrendingUp, Users, ChevronDown, Check, HelpCircle, BarChart3, Download
} from 'lucide-react';
import { auth } from '@/lib/auth';
import { exportReportToPDF } from '@/lib/pdfExport';
import { generateMockReport } from '@/lib/mockData';

export default function LandingPage() {
  const router = useRouter();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoSlide, setDemoSlide] = useState(0);

  useEffect(() => {
    setIsLoggedIn(!!auth.getUser());
  }, []);

  const features = [
    {
      icon: <Search className="w-6 h-6 text-violet-400" />,
      title: "Competitor Intelligence",
      description: "Automatically search, profile, and compile complete profiles on active competitors."
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-indigo-400" />,
      title: "Live Market Sizing",
      description: "Obtain immediate TAM, SAM, and CAGR growth projections based on live industry research."
    },
    {
      icon: <Users className="w-6 h-6 text-cyan-400" />,
      title: "Customer Personas",
      description: "Map target buyer demographics, motivations, purchasing habits, and pain points."
    },
    {
      icon: <Target className="w-6 h-6 text-emerald-400" />,
      title: "Automated SWOT",
      description: "Evaluate your startup's Strengths, Weaknesses, Opportunities, and Threats in a 2x2 grid."
    },
    {
      icon: <Zap className="w-6 h-6 text-amber-400" />,
      title: "MVP Roadmap Builder",
      description: "Define a 3-phase development checklist, resource needs, and your public launch plan."
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-rose-400" />,
      title: "10-Slide Pitch Deck",
      description: "Auto-generate investor slides covering problem, solution, market size, and model."
    }
  ];

  const steps = [
    { num: "01", title: "Submit Your Idea", desc: "Enter your startup name, core concept, target market, budget, and stage." },
    { num: "02", title: "AI Agent Scrapes the Web", desc: "Autonomous agents analyze competitor features, pricing models, and search volume." },
    { num: "03", title: "Review Deep Insights", desc: "Analyze automatically synthesized SWOT, financial models, user feedback, and domains." },
    { num: "04", title: "Export Investor Package", desc: "Download the startup validation report or presentation pitch deck as premium PDFs." }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "$0",
      desc: "Perfect for testing the waters and exploring the platform workflow.",
      features: [
        "1 Custom Startup Analysis",
        "Interactive Dashboard Viewer",
        "Core SWOT & competitor tables",
        "Local browser saves",
        "Online-only access"
      ],
      button: "Get Started Free",
      ctaLink: "/signup",
      popular: false
    },
    {
      name: "Professional",
      price: "$39",
      period: "/mo",
      desc: "For active builders and founders validating multiple ideas.",
      features: [
        "Unlimited Startup Analyses",
        "Full AI Copilot Chat assistant",
        "Complete 10-Slide Pitch Deck generation",
        "Premium PDF Exporter (Reports & Decks)",
        "Domain suggestions engine",
        "Priority Gemini 2.0 processing"
      ],
      button: "Start Free Trial",
      ctaLink: "/signup",
      popular: true
    },
    {
      name: "Enterprise",
      price: "$199",
      period: "/mo",
      desc: "For incubators, accelerators, and startup consultation teams.",
      features: [
        "Everything in Professional",
        "Team Workspace sharing & comments",
        "White-labeled PDF export templates",
        "Custom API access & database triggers",
        "Dedicated account strategist",
        "SLA uptime guarantee"
      ],
      button: "Contact Sales",
      ctaLink: "mailto:sales@startupscout.ai",
      popular: false
    }
  ];

  const faqs = [
    {
      q: "How does the autonomous AI research work?",
      a: "When you submit your idea, StartupScout AI spawns multi-agent workflows. These agents consult the Gemini model, perform simulated competitive intelligence, mine common pain points from similar tools, calculate score indexes across 7 categories, and structure a custom launch strategy."
    },
    {
      q: "Do I need a Gemini API Key to run this app?",
      a: "No! If you don't configure an API key in your environment, the app runs in Demo / Sandbox Mode. It generates customized, high-fidelity mock validation structures tailored to whatever startup details you enter, and lets you view the full project suite for free."
    },
    {
      q: "Can I export the pitch deck to PDF?",
      a: "Yes! StartupScout AI includes a custom print engine. You can download your startup validation report as a formal portrait document and your pitch deck as standard 16:9 landscape presentation sheets."
    },
    {
      q: "Can I share my projects with co-founders?",
      a: "Yes, the platform contains a Team Collaboration module where you can invite teammates to share workspaces, view projects, and leave notes on specific sections."
    }
  ];

  return (
    <div className="flex-1 bg-[#030307] text-[#f4f4f5] overflow-x-hidden selection:bg-violet-500 selection:text-white">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[20%] w-[50%] aspect-square rounded-full bg-violet-600/10 blur-[120px] animate-pulse-slow" />
        <div className="absolute top-[10%] right-[10%] w-[40%] aspect-square rounded-full bg-cyan-600/10 blur-[100px]" />
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full glass-panel border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div onClick={() => router.push('/')} className="flex items-center space-x-2 cursor-pointer">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Zap className="w-5 h-5 text-white animate-pulse" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              StartupScout<span className="text-violet-500 font-medium">.AI</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#workflow" className="hover:text-white transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center space-x-4">
            <Link 
              href={isLoggedIn ? "/dashboard" : "/login"}
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              {isLoggedIn ? "Dashboard" : "Log In"}
            </Link>
            <Link 
              href={isLoggedIn ? "/dashboard" : "/signup"}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-all duration-200 shadow-md shadow-violet-600/20 hover:shadow-violet-600/40 flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 sm:pt-32 sm:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold glass-card text-violet-400 mb-6 border-violet-500/20 shadow-violet-500/5">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-ping" />
            Next-Gen Agentic Validation Engine
          </span>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent max-w-4xl mx-auto leading-[1.1]">
            Validate Startup Ideas Before You Waste Months Building Them
          </h1>
          
          <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto font-light">
            AI-powered market research, competitor analysis, business planning, and startup validation. Turn rough concepts into investor-ready business plans instantly.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={isLoggedIn ? "/dashboard" : "/signup"}
              className="w-full sm:w-auto px-8 py-4 text-base font-bold rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-600/20 hover:shadow-violet-600/40 flex items-center justify-center gap-2 group btn-glow"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button
              onClick={() => setShowDemoModal(true)}
              className="w-full sm:w-auto px-8 py-4 text-base font-semibold rounded-xl glass-card text-zinc-300 hover:text-white border-zinc-800 hover:border-zinc-700 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-zinc-300" />
              <span>Watch Demo</span>
            </button>
          </div>
        </motion.div>

        {/* Dashboard Mockup Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 sm:mt-20 relative rounded-2xl border border-zinc-800/80 bg-zinc-950/40 p-2 backdrop-blur-xl shadow-2xl shadow-violet-500/5 max-w-5xl mx-auto"
        >
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-t from-transparent via-violet-500/10 to-transparent pointer-events-none opacity-70" />
          <div className="rounded-xl overflow-hidden border border-zinc-900 bg-zinc-950 aspect-[16/10] flex flex-col">
            {/* Window chrome */}
            <div className="h-10 border-b border-zinc-900 bg-zinc-900/40 px-4 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/60" />
              <div className="w-3 h-3 rounded-full bg-amber-500/60" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
              <div className="flex-1 max-w-xs mx-auto h-6 rounded-md bg-zinc-950/60 border border-zinc-900/50 flex items-center justify-center text-[10px] text-zinc-500 font-mono">
                startupscout.ai/dashboard
              </div>
            </div>
            
            {/* Mock Dashboard Body */}
            <div className="flex-1 p-6 text-left grid grid-cols-1 md:grid-cols-4 gap-6 bg-[#040409]">
              {/* Mock Sidebar */}
              <div className="hidden md:flex flex-col gap-4 border-r border-zinc-900/80 pr-6">
                <div className="h-6 w-32 rounded bg-zinc-800/40 animate-pulse" />
                <div className="flex flex-col gap-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`h-8 rounded flex items-center px-2 ${i === 1 ? 'bg-violet-950/30 border border-violet-900/30' : 'bg-transparent'}`}>
                      <div className={`w-3 h-3 rounded-sm mr-2 ${i === 1 ? 'bg-violet-400' : 'bg-zinc-800'}`} />
                      <div className="h-3 w-20 rounded bg-zinc-800/40" />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Mock Main Section */}
              <div className="md:col-span-3 flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col gap-1.5">
                    <div className="h-6 w-44 rounded bg-zinc-800/40" />
                    <div className="h-3.5 w-64 rounded bg-zinc-900" />
                  </div>
                  <div className="h-9 w-24 rounded bg-violet-600/40 animate-pulse" />
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="glass-card p-4 rounded-xl border border-zinc-900/60 flex flex-col gap-2">
                      <div className="h-3 w-16 rounded bg-zinc-800/50" />
                      <div className="h-6 w-20 rounded bg-zinc-700/50" />
                    </div>
                  ))}
                </div>

                {/* Agent workflow simulation inside mockup */}
                <div className="glass-card p-5 rounded-xl border border-violet-900/20 bg-zinc-900/10 flex flex-col gap-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/5 rounded-full blur-xl" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
                      <span className="text-xs font-semibold text-violet-400">Agentic Research in Progress...</span>
                    </div>
                    <span className="text-xs text-zinc-500 font-mono">Step 3 of 9</span>
                  </div>
                  <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-900">
                    <div className="bg-gradient-to-r from-violet-600 to-cyan-500 h-full w-[35%] rounded-full animate-pulse" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                      <span>Analyzing Competitor Market Positions</span>
                      <span className="text-cyan-400">Active</span>
                    </div>
                    <div className="text-[10px] text-zinc-500">
                      Querying target directories for &quot;competitive features in digital tutoring platforms&quot;...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Social Proof Stats */}
      <section className="border-t border-b border-zinc-900 bg-zinc-950/40 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {[
            { val: "12,480+", label: "Reports Generated", col: "text-violet-400" },
            { val: "4,850+", label: "Registered Startups", col: "text-cyan-400" },
            { val: "$48M+", label: "Capital Raised by Alumni", col: "text-emerald-400" },
            { val: "99.4%", label: "Investor Appeal Accuracy", col: "text-amber-400" }
          ].map((stat, i) => (
            <div key={i} className="flex flex-col gap-1">
              <span className={`text-2xl sm:text-3xl font-black ${stat.col}`}>{stat.val}</span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 font-semibold">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-28 border-t border-zinc-900 bg-zinc-950/20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 scroll-mt-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Powered By Multi-Agent Orchestration
          </h2>
          <p className="mt-4 text-zinc-400 font-light">
            Our AI validator executes specialized research processes simultaneously, modeling competitor matrices, review analysis, financial strategies, and pitch structures.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, index) => (
            <div 
              key={index}
              className="glass-card p-6 rounded-2xl border border-zinc-900 hover:border-zinc-800/80 flex flex-col gap-4 relative overflow-hidden group"
            >
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-violet-600/5 rounded-full blur-2xl group-hover:bg-violet-600/10 transition-colors" />
              <div className="w-12 h-12 rounded-xl bg-zinc-900/80 border border-zinc-800/60 flex items-center justify-center">
                {feat.icon}
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-violet-400 transition-colors">{feat.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed font-light">{feat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Workflow Section */}
      <section id="workflow" className="py-20 sm:py-28 border-t border-zinc-900 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 scroll-mt-16">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            How StartupScout Validates Ideas
          </h2>
          <p className="mt-4 text-zinc-400 font-light">
            From raw concept to formal investor validation reports in four transparent stages.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((st, index) => (
            <div key={index} className="relative flex flex-col gap-4 p-4">
              {index < 3 && (
                <div className="hidden lg:block absolute top-8 left-[70%] w-full h-[1px] bg-gradient-to-r from-zinc-800 to-transparent" />
              )}
              <span className="text-4xl font-black text-violet-600/30 font-mono tracking-tight">{st.num}</span>
              <h3 className="text-lg font-bold text-white">{st.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed font-light">{st.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 border-t border-zinc-900 bg-zinc-950/20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Loved by Founders &amp; Builders
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              quote: "We saved weeks of tedious Google searches. StartupScout spotted two active competitors we hadn't found and outlined their direct vulnerabilities.",
              author: "Marcus Aurelius",
              role: "CEO, StoicHealth"
            },
            {
              quote: "The automated pitch deck generated is YC-grade. The market validation graphs are exceptionally accurate. We used the PDF export to raise our $500k pre-seed.",
              author: "Elena Rostova",
              role: "Co-Founder, EduFlow AI"
            },
            {
              quote: "As a hackathon regular, this tool is a cheat code. It builds structured SWOT analysis, user review mine templates, and MVP phases in 15 seconds.",
              author: "Sanjay Mehta",
              role: "Full-Stack Dev, Serial Builder"
            }
          ].map((test, index) => (
            <div key={index} className="glass-card p-6 rounded-2xl border border-zinc-900 flex flex-col justify-between">
              <p className="text-zinc-300 text-sm leading-relaxed italic font-light">&ldquo;{test.quote}&rdquo;</p>
              <div className="mt-6 border-t border-zinc-900/60 pt-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-violet-600/30 flex items-center justify-center font-bold text-xs text-violet-400">
                  {test.author.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{test.author}</h4>
                  <span className="text-[10px] text-zinc-500">{test.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 sm:py-28 border-t border-zinc-900 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 scroll-mt-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-zinc-400 font-light">
            Start validating for free. Upgrade whenever you need premium exports and AI Copilot consultations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <div 
              key={index}
              className={`glass-card p-8 rounded-2xl border flex flex-col justify-between relative ${
                plan.popular ? 'border-violet-500 bg-violet-950/5 shadow-lg shadow-violet-500/5' : 'border-zinc-900'
              }`}
            >
              {plan.popular && (
                <span className="absolute top-0 right-6 -translate-y-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold bg-violet-500 text-white tracking-wide uppercase">
                  Most Popular
                </span>
              )}
              
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  <p className="text-xs text-zinc-500 mt-1">{plan.desc}</p>
                </div>
                
                <div className="flex items-baseline">
                  <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                  {plan.period && <span className="text-zinc-500 text-sm ml-1">{plan.period}</span>}
                </div>
                
                <ul className="flex flex-col gap-3 border-t border-zinc-900/60 pt-6">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2.5 text-xs text-zinc-400 font-light">
                      <Check className="w-4 h-4 text-violet-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <Link
                  href={isLoggedIn && !plan.ctaLink.startsWith('mailto:') ? '/dashboard' : plan.ctaLink}
                  className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center transition-all ${
                    plan.popular 
                      ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/10' 
                      : 'glass-card text-zinc-300 hover:text-white border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {plan.button}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 border-t border-zinc-900 max-w-4xl mx-auto px-4 sm:px-6 relative z-10 scroll-mt-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
            <HelpCircle className="w-6 h-6 text-violet-400" />
            <span>Frequently Asked Questions</span>
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div 
                key={index} 
                className="glass-card rounded-xl border border-zinc-900/80 overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="w-full p-5 text-left font-bold text-sm text-zinc-200 hover:text-white flex items-center justify-between gap-4"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-zinc-900/60 bg-zinc-950/30"
                    >
                      <p className="p-5 text-xs text-zinc-400 leading-relaxed font-light">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/40 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div onClick={() => router.push('/')} className="flex items-center space-x-2 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white">
              StartupScout<span className="text-violet-500 font-medium">.AI</span>
            </span>
          </div>
          <span className="text-xs text-zinc-600 font-light font-mono">
            &copy; 2026 StartupScout AI. Designed for YC-grade builders. All rights reserved.
          </span>
        </div>
      </footer>

      {/* Interactive Walkthrough Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={() => { setShowDemoModal(false); setDemoSlide(0); }} />
          <div className="relative glass-card border border-zinc-850 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl z-10 flex flex-col p-6 bg-[#0a0a10]">
            <div className="flex justify-between items-start border-b border-zinc-900 pb-4">
              <div>
                <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-violet-950 text-violet-400 border border-violet-900/50 text-[10px] uppercase font-mono">Interactive Walkthrough</span>
                  <span>How StartupScout Validates Ideas</span>
                </h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">Explore the agentic research flow step-by-step</p>
              </div>
              <button 
                onClick={() => { setShowDemoModal(false); setDemoSlide(0); }}
                className="p-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            {/* Slide content area */}
            <div className="my-6 min-h-[240px] flex flex-col justify-center">
              {demoSlide === 0 && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-violet-400 uppercase font-mono">Step 1: Input Startup Concept</span>
                    <h4 className="text-sm font-bold text-white">Submit your startup parameters to the AI Orchestrator</h4>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-955 border border-zinc-900 flex flex-col gap-3 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[9px] text-zinc-500 uppercase font-mono">Name</span>
                        <div className="font-bold text-zinc-200 mt-0.5">EcoDrive AI</div>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-500 uppercase font-mono">Industry</span>
                        <div className="font-bold text-zinc-200 mt-0.5">CleanTech</div>
                      </div>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-500 uppercase font-mono">Idea Description</span>
                      <p className="text-zinc-300 font-light mt-0.5 leading-normal">
                        An AI-driven software that optimizes battery life and routes for electric vehicles to reduce charging overhead and carbon footprint.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {demoSlide === 1 && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase font-mono">Step 2: Multi-Agent Live Research</span>
                    <h4 className="text-sm font-bold text-white">Simulated agent execution logs running live web crawls</h4>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-900 font-mono text-[10px] text-zinc-400 flex flex-col gap-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-600/5 rounded-full blur-xl animate-pulse" />
                    <div className="flex items-center gap-2 text-cyan-400 font-bold border-b border-zinc-900 pb-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                      <span>AGENTS RUNNING LIVE SCOUTS</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex gap-2"><span className="text-zinc-500">[0.2s]</span><span className="text-violet-400">[ResearchAgent]</span><span>Querying global EV routing directories...</span></div>
                      <div className="flex gap-2"><span className="text-zinc-500">[0.8s]</span><span className="text-emerald-400">[CompetitorSpy]</span><span>Found 3 active competitors (Tesla, ChargePoint, EVNavigation)</span></div>
                      <div className="flex gap-2"><span className="text-zinc-500">[1.4s]</span><span className="text-amber-400">[ReviewMiner]</span><span>Extracting 150+ user reviews: core pain point is "inaccurate ranges".</span></div>
                      <div className="flex gap-2"><span className="text-zinc-500">[2.1s]</span><span className="text-cyan-400">[ReportCompiler]</span><span>Synthesizing SWOT matrix, MVP roadmap, and slides...</span></div>
                    </div>
                    <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden mt-2">
                      <div className="bg-gradient-to-r from-violet-600 to-cyan-500 h-full w-[75%] rounded-full" />
                    </div>
                  </div>
                </div>
              )}

              {demoSlide === 2 && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase font-mono">Step 3: Validation Portfolio Dashboard</span>
                    <h4 className="text-sm font-bold text-white">Interactive reports ready for slide reviews and PDF exports</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-900 flex flex-col gap-1 items-center justify-center text-center">
                      <span className="text-[8px] text-zinc-500 uppercase font-mono">Viability Score</span>
                      <div className="text-base font-black text-violet-400 mt-1">87/100</div>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-900 flex flex-col gap-1 items-center justify-center text-center">
                      <span className="text-[8px] text-zinc-500 uppercase font-mono">TAM Size</span>
                      <div className="text-base font-black text-cyan-400 mt-1">$4.2B</div>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-900 flex flex-col gap-1 items-center justify-center text-center">
                      <span className="text-[8px] text-zinc-500 uppercase font-mono">Pitch Deck</span>
                      <div className="text-[10px] font-bold text-emerald-400 mt-2.5">10 Slides</div>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-violet-950/10 border border-violet-900/20 text-xs text-zinc-300 font-light leading-relaxed">
                    <strong>SWOT Highlights:</strong> Strengths include proprietary range prediction algorithms. Opportunities exist in delivery fleet partnerships to reduce charging downtime.
                  </div>
                </div>
              )}

              {demoSlide === 3 && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-rose-400 uppercase font-mono">Step 4: McKinsey/Sequoia Report Export</span>
                    <h4 className="text-sm font-bold text-white">Download the full validation report instantly to your device</h4>
                  </div>
                  <div className="p-5 rounded-xl bg-zinc-950/80 border border-zinc-900 flex flex-col items-center justify-center gap-4 text-center">
                    <div className="p-3 rounded-2xl bg-violet-600/10 border border-violet-500/20">
                      <Download className="w-8 h-8 text-violet-400" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white">Ready for Export: EcoDrive AI Validation Brief</h5>
                      <p className="text-[10px] text-zinc-500 mt-1">Contains full SWOT, TAM/SAM/SOM, pricing models, and investment grades.</p>
                    </div>
                    <button
                      onClick={() => {
                        const mockReport = generateMockReport(
                          'EcoDrive AI',
                          'An AI-driven software that optimizes battery life and routes for electric vehicles to reduce charging overhead and carbon footprint.',
                          'CleanTech',
                          'Global',
                          'Electric Vehicle Owners',
                          '$5,000',
                          'Idea Stage'
                        );
                        exportReportToPDF({
                          id: 'demo-sample',
                          name: 'EcoDrive AI',
                          idea: 'An AI-driven software that optimizes battery life...',
                          industry: 'CleanTech',
                          country: 'Global',
                          targetAudience: 'Electric Vehicle Owners',
                          budget: '$5,000',
                          stage: 'Idea Stage',
                          createdAt: new Date().toISOString(),
                          report: mockReport
                        });
                      }}
                      className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-violet-600/15"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Sample Sequoia PDF</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Slide controls footer */}
            <div className="flex justify-between items-center border-t border-zinc-900/60 pt-4 mt-2">
              <div className="flex gap-1.5">
                {[0, 1, 2, 3].map((idx) => (
                  <button
                    key={idx}
                    onClick={() => setDemoSlide(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${demoSlide === idx ? 'bg-violet-500 w-4' : 'bg-zinc-800 hover:bg-zinc-700'}`}
                    title={`Go to slide ${idx+1}`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                {demoSlide > 0 && (
                  <button
                    onClick={() => setDemoSlide(prev => prev - 1)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-[10px] font-bold border border-zinc-850"
                  >
                    Back
                  </button>
                )}
                {demoSlide < 3 ? (
                  <button
                    onClick={() => setDemoSlide(prev => prev + 1)}
                    className="px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-bold shadow-md shadow-violet-600/10"
                  >
                    Next Step
                  </button>
                ) : (
                  <Link
                    href="/signup"
                    onClick={() => { setShowDemoModal(false); setDemoSlide(0); }}
                    className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white text-[10px] font-bold shadow-md shadow-violet-600/15"
                  >
                    Get Started Free
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
