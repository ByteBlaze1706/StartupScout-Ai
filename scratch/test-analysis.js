const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

let apiKey = process.env.GEMINI_API_KEY;
try {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GEMINI_API_KEY\s*=\s*(.*)/);
    if (match && match[1]) {
      apiKey = match[1].trim();
    }
  }
} catch (e) {
  console.log('Error reading .env.local:', e.message);
}

if (!apiKey) {
  console.error('Error: GEMINI_API_KEY is not defined.');
  process.exit(1);
}

const name = 'EcoDrive AI';
const idea = 'An AI-driven software that optimizes battery life and routes for electric vehicles to reduce charging overhead and carbon footprint.';
const industry = 'CleanTech';
const country = 'Global';
const targetAudience = 'Electric Vehicle Owners';
const budget = '$5,000';
const stage = 'Idea Stage';

async function testAnalysis() {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    console.log(`Sending complete startup analysis for "${name}" using gemini-2.5-flash...`);

    const prompt = `
You are an expert startup validator, venture capitalist, and market researcher. 
Analyze the following startup idea and generate a comprehensive startup validation report.

STARTUP NAME: ${name}
STARTUP IDEA: ${idea}
INDUSTRY: ${industry}
TARGET COUNTRY: ${country}
TARGET AUDIENCE: ${targetAudience}
BUDGET: ${budget}
CURRENT STAGE: ${stage}

Your response must be a single, valid JSON object matching this exact TypeScript structure:
{
  projectName: string;
  idea: string;
  industry: string;
  country: string;
  targetAudience: string;
  budget: string;
  stage: string;
  score: {
    overall: number; // 0-100
    validation: number; // 0-100
    demand: number; // 0-100
    competition: number; // 0-100
    revenue: number; // 0-100
    scalability: number; // 0-100
    difficulty: number; // 0-100
    appeal: number; // 0-100
  };
  industryOverview: string;
  marketSize: string; // e.g. "$12B by 2030"
  growthRate: string; // e.g. "12.5% CAGR"
  trends: string[]; // 4 items
  opportunities: string[]; // 4 items
  competitors: Array<{
    name: string;
    website: string;
    description: string;
    strengths: string[];
    weaknesses: string[];
    pricing: string;
    funding: string;
    position: string; // e.g. "Market Leader", "Challenger"
  }>; // 2-3 competitors
  swot: {
    strengths: string[]; // 3-4 items
    weaknesses: string[]; // 3-4 items
    opportunities: string[]; // 3-4 items
    threats: string[]; // 3-4 items
  };
  personas: Array<{
    name: string;
    age: number;
    occupation: string;
    goals: string[];
    painPoints: string[];
    motivations: string[];
    behavior: string;
  }>; // 2 personas
  reviewMining: {
    loved: string[]; // 3 features
    complaints: string[]; // 3 complaints
    painPoints: string[]; // 3 customer pain points
    gaps: string[]; // 2 market gaps
    opportunities: string[]; // 2 opportunities
  };
  revenueModels: Array<{
    name: string;
    strategy: string;
    monthlyPricing: string;
    yearlyPricing: string;
    potential: string;
  }>; // 3 models
  features: {
    mustHave: string[];
    goodToHave: string[];
    future: string[];
  };
  roadmap: {
    phase1: { title: string; duration: string; features: string[] };
    phase2: { title: string; duration: string; features: string[] };
    phase3: { title: string; duration: string; features: string[] };
    timeline: string;
    resources: string[];
    launchPlan: string[];
  };
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
  pitchDeck: Array<{
    id: number;
    title: string;
    bullets: string[];
    visualType: 'list' | 'text' | 'chart' | 'matrix' | 'grid';
    visualData: any;
  }>;
}

Be realistic, professional, and thorough. Do not return generic or template answers. Ensure every single text block, SWOT point, and competitor description is deeply customized to the EV startup concept.
`;

    const start = Date.now();
    const result = await model.generateContent(prompt);
    const end = Date.now();
    console.log(`API Call completed in ${((end - start)/1000).toFixed(2)}s`);

    const responseText = result.response.text();
    const cleanedText = responseText.trim();
    const parsedData = JSON.parse(cleanedText);

    console.log('\n--- VERIFICATION STATS ---');
    console.log('Project Name:', parsedData.projectName);
    console.log('Viability Score:', parsedData.score.overall);
    console.log('Industry Overview:', parsedData.industryOverview.substring(0, 100) + '...');
    console.log('Market Size:', parsedData.marketSize);
    console.log('SWOT Strengths:', parsedData.swot.strengths);
    console.log('Competitors found:', parsedData.competitors.map(c => c.name));
    console.log('Customer Personas:', parsedData.personas.map(p => p.name));
    console.log('Roadmap Phase 1:', parsedData.roadmap.phase1.title);
    console.log('Elevator Pitch (30s):', parsedData.elevatorPitches.s30);
    console.log('Pitch Deck slides generated:', parsedData.pitchDeck.length);

    console.log('\n--- JSON PAYLOAD SAMPLE ---');
    console.log(JSON.stringify(parsedData, null, 2).substring(0, 2000) + '\n... [TRUNCATED FOR BREVITY]');
  } catch (error) {
    console.error('Error during test analysis:', error.message || error);
    process.exit(1);
  }
}

testAnalysis();
