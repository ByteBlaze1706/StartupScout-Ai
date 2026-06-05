const https = require('https');
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

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      if (res.statusCode === 200) {
        console.log('Available models:');
        parsed.models.forEach(m => {
          console.log(`- ${m.name} (${m.displayName})`);
        });
      } else {
        console.error(`API Error (HTTP ${res.statusCode}):`, parsed);
      }
    } catch (e) {
      console.error('Failed to parse JSON response:', e.message);
      console.log('Raw response:', data);
    }
  });
}).on('error', (err) => {
  console.error('Connection error:', err.message);
});
