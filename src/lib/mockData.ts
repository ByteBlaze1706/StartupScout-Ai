export interface Competitor {
  name: string;
  website: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  pricing: string;
  funding: string;
  position: string;
}

export interface SWOT {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface Persona {
  name: string;
  age: number;
  occupation: string;
  goals: string[];
  painPoints: string[];
  motivations: string[];
  behavior: string;
}

export interface RevenueModel {
  name: string;
  strategy: string;
  monthlyPricing: string;
  yearlyPricing: string;
  potential: string;
}

export interface MVPPhase {
  title: string;
  duration: string;
  features: string[];
}

export interface MVPRoadmap {
  phase1: MVPPhase;
  phase2: MVPPhase;
  phase3: MVPPhase;
  timeline: string;
  resources: string[];
  launchPlan: string[];
}

export interface StartupScore {
  overall: number;
  validation: number;
  demand: number;
  competition: number;
  revenue: number;
  scalability: number;
  difficulty: number;
  appeal: number;
}

export interface PitchDeckSlide {
  id: number;
  title: string;
  bullets: string[];
  visualType?: 'chart' | 'matrix' | 'grid' | 'list' | 'text';
  visualData?: any;
}

export interface StartupAnalysisReport {
  projectName: string;
  idea: string;
  industry: string;
  country: string;
  targetAudience: string;
  budget: string;
  stage: string;
  score: StartupScore;
  industryOverview: string;
  marketSize: string;
  growthRate: string;
  trends: string[];
  opportunities: string[];
  competitors: Competitor[];
  swot: SWOT;
  personas: Persona[];
  reviewMining: {
    loved: string[];
    complaints: string[];
    painPoints: string[];
    gaps: string[];
    opportunities: string[];
  };
  revenueModels: RevenueModel[];
  features: {
    mustHave: string[];
    goodToHave: string[];
    future: string[];
  };
  roadmap: MVPRoadmap;
  domains: {
    com: string[];
    ai: string[];
    io: string[];
    suggestions: string[];
  };
  elevatorPitches: {
    s30: string;
    s60: string;
    investor: string;
    sales: string;
  };
  pitchDeck: PitchDeckSlide[];
  chatHistory: { role: 'user' | 'assistant'; content: string }[];
}

export const generateMockReport = (
  name: string,
  idea: string,
  industry: string,
  country: string,
  targetAudience: string,
  budget: string,
  stage: string
): StartupAnalysisReport => {
  // Normalize values
  const cleanName = name || "Un-named Venture";
  const cleanIndustry = industry || "Tech";
  const cleanAudience = targetAudience || "General Users";
  const cleanCountry = country || "Global";

  // Generate scores based on details
  const scoreSeed = Math.floor(Math.random() * 20);
  const scores: StartupScore = {
    overall: 70 + scoreSeed,
    validation: 75 + Math.floor(Math.random() * 15),
    demand: 68 + Math.floor(Math.random() * 20),
    competition: 55 + Math.floor(Math.random() * 30),
    revenue: 72 + Math.floor(Math.random() * 18),
    scalability: 80 + Math.floor(Math.random() * 15),
    difficulty: 60 + Math.floor(Math.random() * 25),
    appeal: 74 + Math.floor(Math.random() * 16)
  };

  // Custom market sizing based on industry
  let marketSizeVal = "$12.4 Billion";
  let growthRateVal = "14.2% CAGR";
  if (cleanIndustry.toLowerCase().includes("health") || cleanIndustry.toLowerCase().includes("med")) {
    marketSizeVal = "$45.8 Billion";
    growthRateVal = "18.5% CAGR";
  } else if (cleanIndustry.toLowerCase().includes("finance") || cleanIndustry.toLowerCase().includes("fintech")) {
    marketSizeVal = "$120 Billion";
    growthRateVal = "11.8% CAGR";
  } else if (cleanIndustry.toLowerCase().includes("education") || cleanIndustry.toLowerCase().includes("edtech")) {
    marketSizeVal = "$8.5 Billion";
    growthRateVal = "16.1% CAGR";
  }

  return {
    projectName: cleanName,
    idea: idea,
    industry: cleanIndustry,
    country: cleanCountry,
    targetAudience: cleanAudience,
    budget: budget,
    stage: stage,
    score: scores,
    industryOverview: `The ${cleanIndustry} sector in ${cleanCountry} is undergoing a massive shift towards automation and intelligence. With the rapid democratization of AI interfaces, customer expectations have evolved. Clients now demand personalized, instant solutions that solve pain points directly instead of relying on legacy, human-intensive setups. ${cleanName} is positioning itself at the convergence of this technological shift and high-volume demand.`,
    marketSize: marketSizeVal,
    growthRate: growthRateVal,
    trends: [
      `Adoption of decentralized AI workflows`,
      `Shift towards hyper-personalized micro-SaaS applications`,
      `Increasing regulatory compliance around data sovereignty`,
      `Integration of zero-touch automated billing interfaces`
    ],
    opportunities: [
      `First-mover advantage in targeting ${cleanAudience} with specialized AI helpers`,
      `Low acquisition costs via organic community building and viral referral loops`,
      `Expansion into adjacent ${cleanIndustry} sectors using the same underlying engine`,
      `Enterprise licensing opportunities for dedicated instances`
    ],
    competitors: [
      {
        name: `${cleanIndustry}Pro`,
        website: `https://www.comp-pro-example.com`,
        description: `A legacy enterprise player providing static dashboard solutions in the ${cleanIndustry} space.`,
        strengths: [`Strong established enterprise client list`, `High budget for sales operations`],
        weaknesses: [`Slow product iteration cycles`, `No native AI or automated workflows`],
        pricing: `$150/user/month (Annual only)`,
        funding: `$25M Series B`,
        position: `Market Leader`
      },
      {
        name: `Flow${cleanIndustry.slice(0, 4)}`,
        website: `https://www.flow-example.io`,
        description: `A newer SaaS player that automates basic tasks.`,
        strengths: [`Sleek user interface`, `Affordable entry-level tier`],
        weaknesses: [`Lacks deep analytical reporting`, `Poor multi-tenant architecture`],
        pricing: `$29/month`,
        funding: `$2M Seed`,
        position: `Challenger`
      }
    ],
    swot: {
      strengths: [
        `Direct AI-driven value proposition targeting ${cleanAudience}`,
        `Lower cost of delivery and maintenance via serverless architecture`,
        `Proprietary workflow models tailored for ${cleanIndustry}`
      ],
      weaknesses: [
        `Dependency on third-party AI models (Gemini API)`,
        `Limited initial brand awareness compared to enterprise giants`,
        `Bootstrapped initial budget constraints (${budget})`
      ],
      opportunities: [
        `Capturing underserved micro-segments within ${cleanCountry}`,
        `White-labeling the API engine for B2B distributors`,
        `Creating content networks around automated ${cleanIndustry} reporting`
      ],
      threats: [
        `Rapid change in LLM model performance and pricing`,
        `Low barrier to entry for clone applications`,
        `Potential data privacy concerns from enterprise clients`
      ]
    },
    personas: [
      {
        name: `Sarah Jenkins`,
        age: 32,
        occupation: `Operations Manager`,
        goals: [
          `Reduce manual reporting times by at least 50%`,
          `Integrate workflow data with existing business dashboards`
        ],
        painPoints: [
          `Spends 8 hours weekly copy-pasting data across systems`,
          `Current tools are too complex and require SQL training`
        ],
        motivations: [
          `Wants to be promoted to Director of Operations`,
          `Needs tool that works out-of-the-box with zero setup`
        ],
        behavior: `Usually researches tools on Product Hunt and reads reviews on G2. Prefers a 7-day free trial without a credit card.`
      },
      {
        name: `David Chen`,
        age: 45,
        occupation: `Independent Consultant / Founder`,
        goals: [
          `Scale client operations without hiring full-time staff`,
          `Deliver premium-grade reports directly to enterprise partners`
        ],
        painPoints: [
          `Limited time to spend on operational administration`,
          `High software subscription fees eating into consulting margins`
        ],
        motivations: [
          `Maximized net profit margin`,
          `Aesthetic consistency across all client touchpoints`
        ],
        behavior: `Relies on recommendations from Twitter/X and newsletter updates. High budget, but highly critical of product design.`
      }
    ],
    reviewMining: {
      loved: [
        `Clean dashboard and visually satisfying analytics.`,
        `Automated exports save hours of presentation preparation.`,
        `Flexible pricing model compared to heavy legacy competitors.`
      ],
      complaints: [
        `Initial learning curve is too steep.`,
        `Lack of native integrations with Zapier or Slack.`,
        `Slight latency in AI response times during peak hours.`
      ],
      painPoints: [
        `Difficulty demonstrating immediate ROI to managers.`,
        `Complex configurations needed to get custom reports.`,
        `Hard to collaborate on shared projects with internal teams.`
      ],
      gaps: [
        `No competitor is offering autonomous research that runs in the background.`,
        `Existing tools only show historical data rather than forecasting trends.`
      ],
      opportunities: [
        `Offer real-time email alerts when competitor status changes.`,
        `Introduce collaborative board views to share validation results with stakeholders.`
      ]
    },
    revenueModels: [
      {
        name: `Freemium Starter`,
        strategy: `Free access to 1 validation report with limited features, driving high-volume signups.`,
        monthlyPricing: `$0`,
        yearlyPricing: `$0`,
        potential: `Low immediate MRR, high customer acquisition loop.`
      },
      {
        name: `Professional Tier`,
        strategy: `Unlimited validations, PDF exports, custom competitor trackers, and AI Copilot access.`,
        monthlyPricing: `$39`,
        yearlyPricing: `$349`,
        potential: `Primary growth driver (Estimated 70% of paying users).`
      },
      {
        name: `Enterprise Suite`,
        strategy: `Dedicated API keys, white-labeled PDFs, compliance reporting, and shared team workspaces.`,
        monthlyPricing: `$199`,
        yearlyPricing: `$1,890`,
        potential: `High margin, contract-driven LTV growth.`
      }
    ],
    features: {
      mustHave: [
        `Real-time competitor tracking table with automated search`,
        `Comprehensive SWOT layout showing risk factors`,
        `One-click PDF exporter for investor presentations`
      ],
      goodToHave: [
        `AI Chat assistant referencing report datasets`,
        `Brand and domain suggestion tool`,
        `Custom customer persona profiles`
      ],
      future: [
        `Automatic daily alerts for competitor price changes`,
        `Interactive collaborative sandbox with live edits`,
        `Multi-lingual pitch deck translations`
      ]
    },
    roadmap: {
      phase1: {
        title: `Validation & Foundation (Month 1-2)`,
        duration: `60 Days`,
        features: [
          `Build responsive landing page & core workflow wizard`,
          `Set up LLM prompting routines and mock system controls`,
          `Deploy initial dashboard and project saving mechanics`
        ]
      },
      phase2: {
        title: `Integration & Export (Month 3-4)`,
        duration: `60 Days`,
        features: [
          `Build advanced PDF document print system`,
          `Introduce interactive AI Copilot helper drawer`,
          `Add custom competitor comparator and metrics adjustments`
        ]
      },
      phase3: {
        title: `Scale & Automation (Month 5-6)`,
        duration: `60 Days`,
        features: [
          `Enable real-time background scrapers and notifications`,
          `Launch collaborative workspaces and domain registrars linkage`,
          `Establish API hub for enterprise dashboard embeds`
        ]
      },
      timeline: `6 Months to Public Launch`,
      resources: [
        `1 Lead Full-Stack Developer`,
        `1 UI/UX Product Designer`,
        `Estimated cloud hosting budget: $150/month`,
        `API consumption budget: $200/month`
      ],
      launchPlan: [
        `Week 1: Product Hunt Pre-Launch signup campaign`,
        `Week 3: Private Beta release to 100 select users`,
        `Week 5: Official public launch & hacker community promotion`
      ]
    },
    domains: {
      com: [
        `get${cleanName.replace(/\s+/g, '').toLowerCase()}.com`,
        `try${cleanName.replace(/\s+/g, '').toLowerCase()}.com`,
        `${cleanName.replace(/\s+/g, '').toLowerCase()}app.com`
      ],
      ai: [
        `${cleanName.replace(/\s+/g, '').toLowerCase()}.ai`,
        `${cleanName.replace(/\s+/g, '').toLowerCase()}hq.ai`
      ],
      io: [
        `${cleanName.replace(/\s+/g, '').toLowerCase()}.io`,
        `${cleanName.replace(/\s+/g, '').toLowerCase()}labs.io`
      ],
      suggestions: [
        `${cleanName} Scout`,
        `VentureScout ${cleanName}`,
        `Validi${cleanName.slice(0,5)}`
      ]
    },
    elevatorPitches: {
      s30: `For ${cleanAudience} who struggle with manual operations in ${cleanIndustry}, ${cleanName} is an AI-powered SaaS platform that automates workflows. Unlike legacy competitors, our solution reduces task times by 50% out-of-the-box.`,
      s60: `Every day, ${cleanAudience} waste hours manually copy-pasting data across systems because current tools in the ${cleanIndustry} market are too complex and expensive. ${cleanName} solves this by providing a zero-setup, AI-driven automation dashboard. Our customers save up to 8 hours a week, allowing them to focus on high-impact strategy. We offer a simple monthly subscription that pays for itself within the first week.`,
      investor: `We are raising a Seed round to capture the fast-growing ${marketSizeVal} market for ${cleanIndustry} software. In ${cleanCountry}, companies are desperate to trim operational overhead. ${cleanName} uses autonomous agent technology to automate these flows for a fraction of the cost of traditional hires. We have built the foundation and are ready to scale customer acquisition.`,
      sales: `Tired of spending your weekends copy-pasting data? ${cleanName} was built specifically for ${cleanAudience} like you. Get back your time and eliminate human error with our one-click automation dashboard. Sign up today and get your first analysis completely free.`
    },
    pitchDeck: [
      {
        id: 1,
        title: "The Problem",
        bullets: [
          `Target users (${cleanAudience}) waste substantial resources on manual operations.`,
          `Existing tools in the ${cleanIndustry} space are built for large corporations and are too complex.`,
          `No affordable, automated solution exists for early-stage teams or solo operators.`
        ],
        visualType: 'list',
        visualData: [`8+ hours lost weekly`, `No simple alternatives`, `High subscription fees`]
      },
      {
        id: 2,
        title: "The Solution",
        bullets: [
          `${cleanName}: An autonomous, AI-guided workspace.`,
          `One-click templates that generate custom workflow integrations instantly.`,
          `Designed specifically for speed, accessibility, and high visual clarity.`
        ],
        visualType: 'text',
        visualData: `A premium, zero-setup platform that automates operations for ${cleanAudience}.`
      },
      {
        id: 3,
        title: "Market Opportunity",
        bullets: [
          `Total Addressable Market size estimated at ${marketSizeVal}.`,
          `Staggering growth velocity driven by a ${growthRateVal}.`,
          `Substantial demand in ${cleanCountry} for operational intelligence.`
        ],
        visualType: 'chart',
        visualData: { marketSize: marketSizeVal, cagr: growthRateVal }
      },
      {
        id: 4,
        title: "The Product",
        bullets: [
          `Real-time dashboards showing active workflow statistics.`,
          `Interactive SWOT assessments and domain helpers built-in.`,
          `AI Copilot chat that acts as an on-demand operations consultant.`
        ],
        visualType: 'grid',
        visualData: [`Real-time Dashboard`, `SWOT Tool`, `AI Copilot`]
      },
      {
        id: 5,
        title: "Competitors",
        bullets: [
          `Legacy players like ${cleanIndustry}Pro are too expensive and hard to configure.`,
          `Challengers like Flow${cleanIndustry.slice(0, 4)} lack advanced AI insights.`,
          `${cleanName} sits at the intersection of ease-of-use and deep automation.`
        ],
        visualType: 'matrix',
        visualData: [
          { name: `${cleanIndustry}Pro`, price: "High", ease: "Low", ai: "No" },
          { name: `Flow${cleanIndustry.slice(0, 4)}`, price: "Medium", ease: "Medium", ai: "Basic" },
          { name: cleanName, price: "Affordable", ease: "High", ai: "Advanced" }
        ]
      },
      {
        id: 6,
        title: "Revenue Model",
        bullets: [
          `Freemium model to capture large volume of signups.`,
          `Professional Tier at $39/month for individual operators.`,
          `Enterprise tier at $199/month for shared workspaces and API features.`
        ],
        visualType: 'grid',
        visualData: [`Free ($0)`, `Pro ($39/mo)`, `Enterprise ($199/mo)`]
      },
      {
        id: 7,
        title: "Go-To-Market Strategy",
        bullets: [
          `Leverage organic community marketing on Product Hunt, IndieHackers, and Twitter.`,
          `Direct outreach to consulting agencies managing ${cleanAudience}.`,
          `A SEO content flywheel built around ${cleanIndustry} automation templates.`
        ],
        visualType: 'list',
        visualData: [`Product Hunt launch`, `Direct agency outreach`, `SEO template network`]
      },
      {
        id: 8,
        title: "Development Roadmap",
        bullets: [
          `Phase 1: Launch MVP dashboard and agentic form workflow (Month 1-2).`,
          `Phase 2: Add interactive AI Copilot and advanced report exports (Month 3-4).`,
          `Phase 3: Introduce multi-user support and API developer dashboard (Month 5-6).`
        ],
        visualType: 'list',
        visualData: [`Month 1-2: Core MVP`, `Month 3-4: Exports & Copilot`, `Month 5-6: API & Scale`]
      },
      {
        id: 9,
        title: "Investment Opportunity",
        bullets: [
          `Seeking initial Seed capital to scale engineering and marketing.`,
          `Funds will directly support API consumption cost optimizations and sales operations.`,
          `High growth opportunity with low burn rate.`
        ],
        visualType: 'text',
        visualData: `Partner with us to automate the future of ${cleanIndustry}.`
      },
      {
        id: 10,
        title: "Closing",
        bullets: [
          `${cleanName} turns manual overhead into automated speed.`,
          `Contact: info@${cleanName.replace(/\s+/g, '').toLowerCase()}.com`,
          `Visit: www.${cleanName.replace(/\s+/g, '').toLowerCase()}.com`
        ],
        visualType: 'text',
        visualData: `StartupScout AI: Turn Startup Ideas Into Validated Businesses.`
      }
    ],
    chatHistory: [
      { role: 'assistant', content: `Hello! I am your StartupScout AI Copilot. I have analyzed your startup idea: "${idea}" in the ${cleanIndustry} industry. How can I help you refine this business model today?` }
    ]
  };
};

export const DEMO_PROJECTS = {
  tutor: generateMockReport(
    "AI Tutor",
    "An AI tutor that creates personalized lesson plans, quizzes, and exercises for students based on their specific learning style and progress, adapting dynamically to their strengths and weaknesses.",
    "Education Technology",
    "United States",
    "K-12 and College Students",
    "$5,000",
    "Idea Stage"
  ),
  fitness: generateMockReport(
    "AI Fitness Coach",
    "A computer-vision powered mobile app that acts as a personal trainer. It watches the user perform exercises, corrects their form in real-time via audio feedback, and generates dynamic daily workouts.",
    "Fitness & Digital Health",
    "Europe",
    "Home Workout Enthusiasts",
    "$10,000",
    "Prototype Stage"
  ),
  scholarship: generateMockReport(
    "Scholarship Finder AI",
    "A platform that uses AI to match students with niche scholarship opportunities, drafts customized application essays, and tracks deadlines to maximize funding chances.",
    "Finance / Education",
    "Canada",
    "High School & University Students",
    "$2,500",
    "Idea Stage"
  ),
  mentor: generateMockReport(
    "AI Startup Mentor",
    "An autonomous business advisor that analyzes startup metrics, reviews landing pages, suggest growth hacks, and provides daily step-by-step instructions to scale operations.",
    "Business Software / AI",
    "Global",
    "Solo founders and bootstrappers",
    "$15,000",
    "Pre-seed Stage"
  )
};
