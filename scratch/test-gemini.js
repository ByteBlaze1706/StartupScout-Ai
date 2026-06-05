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

console.log('Using API Key:', apiKey ? apiKey.substring(0, 10) + '...' : 'Undefined');

if (!apiKey) {
  console.error('Error: GEMINI_API_KEY is not defined.');
  process.exit(1);
}

async function testGemini() {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    console.log('Sending test request to gemini-2.5-flash...');
    const result = await model.generateContent('Hello! Tell me in 3 words if you are active.');
    console.log('Response status: Success');
    console.log('Response text:', result.response.text().trim());
  } catch (error) {
    console.error('Gemini API connection error:', error.message || error);
    process.exit(1);
  }
}

testGemini();
