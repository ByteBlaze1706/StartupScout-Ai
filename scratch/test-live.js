const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const findChrome = () => {
  const paths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Local\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
};

async function runLiveAnalysis() {
  const chromePath = findChrome();
  if (!chromePath) {
    console.error('ERROR: Google Chrome could not be found. Please check standard installation paths.');
    process.exit(1);
  }

  console.log('Found browser at:', chromePath);
  
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    defaultViewport: { width: 1280, height: 800 }
  });

  const page = await browser.newPage();
  
  // Track console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`[Console Error]: ${msg.text()}`);
    }
  });

  page.on('pageerror', err => {
    console.log(`[Page Error]: ${err.message}`);
  });

  try {
    const targetUrl = 'https://startupscout-ai.vercel.app';
    console.log(`\n1. Navigating to live URL: ${targetUrl}`);
    await page.goto(targetUrl, { waitUntil: 'networkidle2' });
    
    const title = await page.title();
    console.log(`Landing Page Title: "${title}"`);

    console.log('\n2. Toggling to sign up page');
    await page.click('a[href="/signup"]');
    await page.waitForFunction(() => window.location.pathname.includes('/signup'), { timeout: 5000 });
    
    console.log('\n3. Creating a test account');
    const testEmail = `founder_live_${Math.random().toString(36).substr(2, 5)}@example.com`;
    const testPass = 'ScoutLive9876!';
    
    await page.type('input[placeholder="Jane Doe"]', 'Live Verifier');
    await page.type('input[placeholder="name@example.com"]', testEmail);
    await page.type('input[placeholder="••••••••"]', testPass);
    
    console.log(`Submitting registration for: ${testEmail}`);
    await page.click('button[type="submit"]');
    
    console.log('Waiting for dashboard redirect...');
    await page.waitForFunction(() => window.location.pathname === '/dashboard', { timeout: 15000 });
    console.log('Dashboard redirect successful!');

    console.log('\n4. Navigating to Analysis intake form');
    await page.waitForSelector('a[href="/dashboard/analyze"]', { timeout: 10000 });
    await page.click('a[href="/dashboard/analyze"]');
    await page.waitForFunction(() => window.location.pathname.includes('/analyze'), { timeout: 5000 });

    console.log('Filling out startup idea (SolarGuard AI)...');
    await page.type('input[name="name"]', 'SolarGuard AI');
    
    const selectIndustry = await page.$('select[name="industry"]');
    await selectIndustry.select('Clean Energy');
    
    const selectCountry = await page.$('select[name="country"]');
    await selectCountry.select('United States');
    
    await page.type('input[name="targetAudience"]', 'Commercial properties and warehouse owners');
    
    await page.evaluate(() => {
      const slider = document.querySelector('input[name="budget"]');
      if (slider) {
        slider.value = '50000';
        slider.dispatchEvent(new Event('input', { bubbles: true }));
        slider.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    
    const selectStage = await page.$('select[name="stage"]');
    await selectStage.select('Seed Stage');
    
    await page.type('textarea[name="idea"]', 'An automated drone inspection and AI software platform that monitors commercial solar panels to detect hot spots, micro-cracks, and dust buildup to maximize energy generation efficiency.');

    console.log('\n5. Launching multi-agent analysis flow on live server...');
    await page.click('button[type="submit"]');
    
    await page.waitForSelector('h2', { timeout: 5000 });
    console.log('Agent console successfully loaded. Analysis queue in progress...');
    
    console.log('Waiting for AI agents to compile live project validation (estimated ~50s)...');
    await page.waitForFunction(() => window.location.pathname.includes('/projects/proj_'), { timeout: 90000 });
    
    const detailsUrl = page.url();
    console.log(`\n🎉 ANALYSIS SUCCESSFUL!`);
    console.log(`Live Project URL: ${detailsUrl}`);

    // Wait for content render
    await page.waitForFunction(() => document.body.textContent.includes('Viability Score'), { timeout: 15000 });
    const overallScore = await page.evaluate(() => {
      const el = document.body.textContent.match(/Score:\s*(\d+)/i);
      return el ? el[1] : 'Found';
    });
    console.log(`Retrieved Score text: ${overallScore}`);
    
  } catch (error) {
    console.error('ERROR during live analysis:', error.message || error);
    process.exit(1);
  } finally {
    await browser.close();
    console.log('Test browser closed.');
  }
}

runLiveAnalysis();
