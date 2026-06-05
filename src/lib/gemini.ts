import { GoogleGenerativeAI } from '@google/generative-ai';
import { StartupAnalysisReport, generateMockReport } from './mockData';

const apiKey = process.env.GEMINI_API_KEY || '';

export const analyzeStartupWithAI = async (
  name: string,
  idea: string,
  industry: string,
  country: string,
  targetAudience: string,
  budget: string,
  stage: string
): Promise<StartupAnalysisReport> => {
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not defined. Falling back to mock generator.');
    // Add artificial delay to simulate AI agents working
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return generateMockReport(name, idea, industry, country, targetAudience, budget, stage);
  }

  console.log(`[Gemini Pipeline] Sending analysis request to gemini-2.5-flash for: "${name}"`);
  console.log(`[Gemini Pipeline] Startup Idea Description: "${idea}"`);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-2.5-flash for premium response speed and high token capacity
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

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
    loved: string[]; // 3 features customers typically love in this space
    complaints: string[]; // 3 complaints they have with legacy systems
    painPoints: string[]; // 3 customer pain points
    gaps: string[]; // 2 market gaps
    opportunities: string[]; // 2 untapped opportunities
  };
  revenueModels: Array<{
    name: string; // e.g. "Freemium", "SaaS Subscription"
    strategy: string;
    monthlyPricing: string;
    yearlyPricing: string;
    potential: string;
  }>; // 3 models
  features: {
    mustHave: string[]; // 3 items ranked by priority
    goodToHave: string[]; // 3 items
    future: string[]; // 3 items
  };
  roadmap: {
    phase1: { title: string; duration: string; features: string[] };
    phase2: { title: string; duration: string; features: string[] };
    phase3: { title: string; duration: string; features: string[] };
    timeline: string;
    resources: string[]; // resource requirements
    launchPlan: string[]; // 3 steps
  };
  domains: {
    com: string[]; // 3 domain suggestions ending in .com
    ai: string[]; // 2 suggestions ending in .ai
    io: string[]; // 2 suggestions ending in .io
    suggestions: string[]; // 3 brand/naming suggestions
  };
  elevatorPitches: {
    s30: string; // 30-second elevator pitch
    s60: string; // 60-second elevator pitch
    investor: string; // investor pitch focusing on market opportunity
    sales: string; // customer-facing sales pitch
  };
  pitchDeck: Array<{
    id: number; // 1 to 10
    title: string; // Slide Name
    bullets: string[]; // Key takeaways (3 items)
    visualType: 'list' | 'text' | 'chart' | 'matrix' | 'grid';
    visualData: any; // visual helpers matching the slide type (e.g. for charts: { marketSize, growthRate }, for matrix: list of competitors)
  }>; // Generate exactly 10 slides: 1 Problem, 2 Solution, 3 Market Opportunity, 4 Product, 5 Competitors, 6 Revenue Model, 7 Go-To-Market Strategy, 8 Roadmap, 9 Investment Opportunity, 10 Closing.
}

  Be realistic, professional, and thorough. Do not return generic or template answers. Ensure every single text block, SWOT point, and competitor description is deeply customized to the user's startup concept. SWOT points must contain concrete technical or market details (avoid generic entries like "High competition" or "Lack of funding"). Competitors must have realistic estimated funding figures, specific pricing tiers, and direct positioning comparisons. The 10 pitch deck slides must follow Y Combinator core patterns: Slide 1 (Problem), Slide 2 (Solution), Slide 3 (Market Size & TAM), Slide 4 (Product Features), Slide 5 (Competition Grid), Slide 6 (Business Model), Slide 7 (Go-To-Market), Slide 8 (Launch Roadmap), Slide 9 (Investment/Team), Slide 10 (Closing/CTA).
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanedText = responseText.trim();
    
    if (!cleanedText) {
      throw new Error('Gemini API returned an empty response.');
    }

    console.log('[Gemini Pipeline] Response payload received successfully. Parsing JSON schema...');
    
    // Parse the output as JSON
    const parsedData = JSON.parse(cleanedText);
    
    // Verify required sections exist
    const requiredKeys = ['projectName', 'score', 'industryOverview', 'marketSize', 'swot', 'competitors', 'personas', 'revenueModels', 'roadmap'];
    requiredKeys.forEach(key => {
      if (!(key in parsedData)) {
        throw new Error(`AI generated report is missing crucial section: ${key}`);
      }
    });

    console.log(`[Gemini Pipeline] Report generated successfully from AI response for: "${parsedData.projectName}"`);

    // Add empty chatHistory initialized
    parsedData.chatHistory = [
      {
        role: 'assistant',
        content: `Hello! I am your StartupScout AI Copilot. I have analyzed your startup idea: "${parsedData.idea || idea}" in the ${parsedData.industry || industry} industry. How can I help you refine this business model today?`
      }
    ];

    return parsedData as StartupAnalysisReport;
  } catch (error: any) {
    console.error('[Gemini Pipeline] Generation failure:', error);
    const errMsg = error.message || '';
    if (errMsg.includes('API key not valid') || errMsg.includes('API key')) {
      throw new Error('Invalid Gemini API Key configured. Please verify your environment variables.');
    } else if (
      errMsg.includes('exhausted') || 
      errMsg.includes('429') || 
      errMsg.includes('503') || 
      errMsg.includes('Service Unavailable') || 
      errMsg.includes('demand') || 
      errMsg.includes('limit')
    ) {
      throw new Error('Gemini API is currently experiencing high demand or rate limits. Please wait a moment and try again.');
    } else if (errMsg.includes('fetch') || errMsg.includes('network') || errMsg.includes('connect')) {
      throw new Error('Network failure connecting to Gemini API. Please check your internet connection.');
    } else {
      throw new Error(`Gemini Validation Failure: ${errMsg || 'Unexpected response pattern from model'}`);
    }
  }
};

export const runCopilotChat = async (
  report: StartupAnalysisReport,
  chatHistory: { role: 'user' | 'assistant'; content: string }[],
  userMessage: string
): Promise<string> => {
  if (!apiKey) {
    // Mock assistant response
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const normalizedMsg = userMessage.toLowerCase();
    
    if (normalizedMsg.includes('improve') || normalizedMsg.includes('better')) {
      return `To improve the validation score of ${report.projectName}, you should address the primary weakness: "${report.swot.weaknesses[0]}". Implementing a "${report.features.mustHave[0]}" feature first will deliver immediate value to "${report.personas[0].name}" and help drive user retention.`;
    }
    if (normalizedMsg.includes('monetize') || normalizedMsg.includes('price') || normalizedMsg.includes('revenue')) {
      const model = report.revenueModels[1] || report.revenueModels[0];
      return `For monetization, I recommend starting with the "${model.name}" model (${model.monthlyPricing}/month). It targets ${report.targetAudience} effectively by offering: "${model.strategy}". This establishes recurring revenue early while keeping entry barriers low.`;
    }
    if (normalizedMsg.includes('feature') || normalizedMsg.includes('add') || normalizedMsg.includes('build')) {
      return `Based on the feature recommendation engine, the highest priority is to build "${report.features.mustHave[0]}" followed by "${report.features.mustHave[1]}". These directly resolve the core customer pain point: "${report.reviewMining.painPoints[0]}".`;
    }
    return `That's a great question about ${report.projectName}. Looking at the market research in the ${report.industry} sector, the ${report.marketSize} market size and ${report.growthRate} growth indicate a solid window of opportunity. To differentiate from competitors like ${report.competitors[0]?.name || 'existing players'}, we must double down on ${report.opportunities[0]}. What other areas of the business model can I clarify?`;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Build context
    const context = `
You are the StartupScout AI Copilot. You are discussing a startup validation report with the founder.
Here is the startup information:
- Startup Name: ${report.projectName}
- Idea: ${report.idea}
- Industry: ${report.industry}
- SWOT: Strengths: ${report.swot.strengths.join(', ')} | Weaknesses: ${report.swot.weaknesses.join(', ')}
- Competitors: ${report.competitors.map(c => c.name).join(', ')}
- Target Audience: ${report.targetAudience}
- Revenue Models: ${report.revenueModels.map(r => `${r.name}: ${r.monthlyPricing}`).join(', ')}
- Key Features: Must: ${report.features.mustHave.join(', ')} | Good: ${report.features.goodToHave.join(', ')}

Answer the user's question concisely, referencing the report data where appropriate. Keep your tone supportive, analytical, and professional.
`;

    // Construct history for Gemini API
    const formattedHistory = chatHistory.slice(-10).map(item => ({
      role: item.role === 'user' ? 'user' : 'model',
      parts: [{ text: item.content }]
    }));

    // Start a chat session
    const chatSession = model.startChat({
      history: [
        { role: 'user', parts: [{ text: context }] },
        { role: 'model', parts: [{ text: "Understood. I will act as the AI Copilot and answer questions using this startup report data." }] },
        ...formattedHistory
      ]
    });

    const response = await chatSession.sendMessage(userMessage);
    return response.response.text();
  } catch (error: any) {
    console.error('[Gemini Pipeline] Copilot generation failure:', error);
    throw new Error(`AI Copilot connection failure: ${error.message || 'Connection error'}`);
  }
};
