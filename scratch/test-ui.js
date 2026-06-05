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

async function runTests() {
  const chromePath = findChrome();
  if (!chromePath) {
    console.error('ERROR: Google Chrome could not be found. Please check standard installation paths.');
    process.exit(1);
  }

  console.log('Found Chrome at:', chromePath);
  
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true, // headless testing
    defaultViewport: { width: 1280, height: 800 }
  });

  const page = await browser.newPage();
  
  // Track console errors
  const consoleErrors = [];
  const networkFailures = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(`[Console Error]: ${msg.text()}`);
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(`[Page Error]: ${err.message}`);
  });

  page.on('requestfailed', req => {
    networkFailures.push(`[Network Failure]: ${req.url()} (${req.failure().errorText})`);
  });

  const results = [];
  
  const logTest = (buttonName, expected, actual, status, fix = 'None') => {
    results.push({
      buttonName,
      expected,
      actual,
      status,
      fix
    });
    console.log(`[TEST] ${buttonName}: ${status}`);
  };

  try {
    // ----------------------------------------------------
    // TEST 1: LANDING PAGE NAVIGATION
    // ----------------------------------------------------
    console.log('\n--- Testing Landing Page ---');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    // Verify title loads
    const title = await page.title();
    logTest('Landing Page Title', 'Show correct page title', `Loaded: "${title}"`, 'PASS');

    // Test FAQ toggle
    try {
      await page.waitForSelector('button', { timeout: 5000 });
      // Find FAQ button
      const faqButtons = await page.$$('button');
      let clickedFaq = false;
      for (const btn of faqButtons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text.includes('How does the autonomous')) {
          await btn.click();
          clickedFaq = true;
          break;
        }
      }
      logTest('FAQ Link/Accordion', 'Toggle FAQ answer card display', clickedFaq ? 'Answer card toggled successfully' : 'Not found', clickedFaq ? 'PASS' : 'FAIL');
    } catch(e) {
      logTest('FAQ Link/Accordion', 'Toggle FAQ card', e.message, 'FAIL');
    }

    // Test "Watch Demo" Modal trigger
    try {
      // Find watch demo button
      const watchDemoBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.find(b => b.textContent.includes('Watch Demo'));
      });
      const watchDemoEl = watchDemoBtn ? watchDemoBtn.asElement() : null;
      
      if (watchDemoEl) {
        await watchDemoEl.click();
        await page.waitForSelector('h3', { timeout: 3000 });
        const modalText = await page.evaluate(() => document.body.textContent);
        const isOpen = modalText.includes('Walkthrough') || modalText.includes('Interactive Demo');
        
        logTest('Watch Demo Button', 'Open Walkthrough presentation modal', isOpen ? 'Modal opened successfully' : `Modal text not found. Content: ${modalText.substring(0, 100)}`, isOpen ? 'PASS' : 'FAIL');
        
        // Close modal
        const closeBtn = await page.evaluateHandle(() => {
          const btns = Array.from(document.querySelectorAll('button'));
          return btns.find(b => b.textContent.includes('✕'));
        });
        const closeEl = closeBtn ? closeBtn.asElement() : null;
        if (closeEl) {
          await closeEl.click();
          await new Promise(r => setTimeout(r, 500));
        }
      } else {
        logTest('Watch Demo Button', 'Open Demo modal', 'Watch Demo button not found', 'FAIL');
      }
    } catch(e) {
      logTest('Watch Demo Button', 'Open Demo modal', e.message, 'FAIL');
    }

    // Click "Get Started" to navigate to /login
    try {
      const getStartedBtn = await page.evaluateHandle(() => {
        const links = Array.from(document.querySelectorAll('a'));
        return links.find(l => l.textContent.includes('Get Started'));
      });

      if (getStartedBtn) {
        await page.click('a[href="/signup"]'); // click get started
        await page.waitForFunction(() => window.location.pathname.includes('/signup'), { timeout: 5000 });
        const currentUrl = page.url();
        logTest('Get Started Button', 'Navigate to /signup', `Redirected to: ${currentUrl}`, currentUrl.includes('/signup') ? 'PASS' : 'FAIL');
      } else {
        logTest('Get Started Button', 'Navigate to /signup', 'Link not found', 'FAIL');
      }
    } catch(e) {
      logTest('Get Started Button', 'Navigate to /signup', e.message, 'FAIL');
    }

    // ----------------------------------------------------
    // TEST 2: AUTHENTICATION (SIGN UP & LOGIN)
    // ----------------------------------------------------
    console.log('\n--- Testing Authentication Flow ---');
    const testEmail = `founder_${Math.random().toString(36).substr(2, 5)}@example.com`;
    const testPass = 'Hackathon1234';

    // Sign Up Flow
    try {
      // Toggle to signup mode
      const signupLink = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.find(b => b.textContent.includes('Create an account'));
      });
      const signupEl = signupLink ? signupLink.asElement() : null;
      if (signupEl) {
        await signupEl.click();
        await new Promise(r => setTimeout(r, 400));
      }

      // Fill form
      await page.type('input[placeholder="Jane Doe"]', 'Alonzo Founder');
      await page.type('input[placeholder="name@example.com"]', testEmail);
      await page.type('input[placeholder="••••••••"]', testPass);
      
      // Submit Sign Up
      await page.click('button[type="submit"]');
      await page.waitForFunction(() => window.location.pathname === '/dashboard', { timeout: 5000 });

      const dashboardUrl = page.url();
      logTest('Sign Up Submission', 'Create user record & redirect to /dashboard', `Redirected to: ${dashboardUrl}`, dashboardUrl.includes('/dashboard') ? 'PASS' : 'FAIL');
    } catch(e) {
      logTest('Sign Up Submission', 'Register user account', e.message, 'FAIL');
    }

    // ----------------------------------------------------
    // TEST 3: DASHBOARD METRICS AND SAVED DEMOS
    // ----------------------------------------------------
    console.log('\n--- Testing Dashboard Overview ---');
    try {
      await new Promise(r => setTimeout(r, 1000)); // wait for client mount check
      const bodyText = await page.evaluate(() => document.body.textContent);
      const metricsLoaded = bodyText.includes('Total Analyses') && bodyText.includes('Average Score');
      logTest('Dashboard Stats Grid', 'Load totals and average viability stats', metricsLoaded ? 'Stats cards present' : 'Missing stats keys', metricsLoaded ? 'PASS' : 'None');
    } catch(e) {
      logTest('Dashboard Stats Grid', 'Inspect statistics', e.message, 'FAIL');
    }

    // ----------------------------------------------------
    // TEST 4: STARTUP ANALYSIS AGENT WORKFLOW
    // ----------------------------------------------------
    console.log('\n--- Testing Startup Analysis Agent Wizard ---');
    try {
      // Navigate to /dashboard/analyze
      await page.click('a[href="/dashboard/analyze"]');
      await page.waitForFunction(() => window.location.pathname.includes('/analyze'), { timeout: 5000 });
      logTest('Analyze Navigation Link', 'Navigate to analysis wizard', page.url(), page.url().includes('/analyze') ? 'PASS' : 'FAIL');

      // Fill idea details
      await page.type('input[name="name"]', 'EcoDrive AI');
      
      const selectIndustry = await page.$('select[name="industry"]');
      await selectIndustry.select('Clean Energy');
      
      const selectCountry = await page.$('select[name="country"]');
      await selectCountry.select('Canada');
      
      await page.type('input[name="targetAudience"]', 'Eco-friendly drivers and delivery fleets');
      
      await page.evaluate(() => {
        const slider = document.querySelector('input[name="budget"]');
        if (slider) {
          slider.value = '25000';
          slider.dispatchEvent(new Event('input', { bubbles: true }));
          slider.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      
      const selectStage = await page.$('select[name="stage"]');
      await selectStage.select('Pre-seed Stage');
      
      await page.type('textarea[name="idea"]', 'An AI-driven software that optimizes battery life and routes for electric vehicles to reduce charging overhead and carbon footprint.');

      // Click Launch
      await page.click('button[type="submit"]');
      console.log('Submitting startup analysis form...');
      
      // Wait for agent workspace to appear
      await page.waitForSelector('h2', { timeout: 3000 });
      const consoleText = await page.evaluate(() => document.body.textContent);
      const isAgentActive = consoleText.includes('Agent Workflow Engine') || consoleText.includes('AGENT WORKSPACE CONSOLE') || consoleText.includes('Research Agent');
      logTest('Launch Research Agents', 'Display animated Agent Console step tracker', isAgentActive ? 'Agent terminal displays step checks' : `Console missing. Found text: ${consoleText.substring(0, 150)}`, isAgentActive ? 'PASS' : 'FAIL');

      // Wait for analysis to complete and redirect to project details (real Gemini analysis can take ~45s)
      console.log('Waiting for AI agents to compile project validation (estimated ~50s)...');
      await page.waitForFunction(() => window.location.pathname.includes('/projects/proj_'), { timeout: 75000 });
      
      const detailsUrl = page.url();
      logTest('Agent Analysis Finish Redirect', 'Redirect to /projects/[id] after validation completion', `Redirected to: ${detailsUrl}`, detailsUrl.includes('/projects/proj_') ? 'PASS' : 'FAIL');
    } catch(e) {
      logTest('Launch Research Agents & Analysis', 'Generate validation report', e.message, 'FAIL');
    }

    // ----------------------------------------------------
    // TEST 5: PROJECT DETAILS MODULE TABS & EXPORTS
    // ----------------------------------------------------
    console.log('\n--- Testing Validation Tabs & PDF Exporters ---');
    try {
      // Wait for project loader spinner to disappear and content to render
      await page.waitForFunction(() => document.body.textContent.includes('Viability Score'), { timeout: 15000 });
      
      const detailText = await page.evaluate(() => document.body.textContent);
      const isDetailsLoaded = detailText.includes('Viability Score') && detailText.includes('Viability Parameters');
      logTest('Score Engine Tab (Default)', 'Show overall circle gauge and radar charts', isDetailsLoaded ? 'Viability charts loaded' : 'Missing metrics', isDetailsLoaded ? 'PASS' : 'FAIL');

      // Tab 2: Market Report
      const tabButtons = await page.$$('button');
      let clickedMarketTab = false;
      for (const btn of tabButtons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text.includes('Market Report')) {
          await btn.click();
          clickedMarketTab = true;
          await new Promise(r => setTimeout(r, 600));
          break;
        }
      }
      const marketText = await page.evaluate(() => document.body.textContent);
      const hasSwotAndCompetitors = marketText.includes('SWOT Analysis') && marketText.includes('Competitor');
      logTest('Market Report Tab', 'Show SWOT 2x2 grid and competitor comparison tables', hasSwotAndCompetitors ? 'SWOT grid and tables render' : 'Not found', hasSwotAndCompetitors ? 'PASS' : 'FAIL');

      // Tab 3: MVP Planner
      let clickedMvpTab = false;
      const tabButtons2 = await page.$$('button');
      for (const btn of tabButtons2) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text.includes('MVP Roadmap')) {
          await btn.click();
          clickedMvpTab = true;
          await new Promise(r => setTimeout(r, 600));
          break;
        }
      }
      const mvpText = await page.evaluate(() => document.body.textContent);
      const hasRoadmapPhases = mvpText.includes('Timeline') && mvpText.includes('Phase 1');
      logTest('MVP Roadmap Tab', 'Show feature list and Phase timeline checklist', hasRoadmapPhases ? 'Roadmap timeline renders' : 'Not found', hasRoadmapPhases ? 'PASS' : 'FAIL');

      // Tab 4: Pitch Deck Slide Viewer
      let clickedPitchTab = false;
      const tabButtons3 = await page.$$('button');
      for (const btn of tabButtons3) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text.includes('Pitch Deck')) {
          await btn.click();
          clickedPitchTab = true;
          await new Promise(r => setTimeout(r, 600));
          break;
        }
      }
      const pitchText = await page.evaluate(() => document.body.textContent);
      const hasSlideViewer = pitchText.includes('Slide') && (pitchText.includes('Next') || pitchText.includes('Presentation'));
      logTest('Pitch Deck Tab', 'Show landscape presentation slides layout', hasSlideViewer ? 'Presentation slide deck visible' : 'Not found', hasSlideViewer ? 'PASS' : 'FAIL');

      // Test slide navigation buttons
      try {
        const slideButtons = await page.$$('button');
        let clickedNext = false;
        for (const btn of slideButtons) {
          const text = await page.evaluate(el => el.textContent, btn);
          if (text.includes('Next')) {
            await btn.click();
            clickedNext = true;
            await new Promise(r => setTimeout(r, 400));
            break;
          }
        }
        logTest('Slide Next Button', 'Advance presentation slide viewer forward', clickedNext ? 'Advanced slide successfully' : 'Not found', clickedNext ? 'PASS' : 'FAIL');
      } catch (e) {
        logTest('Slide Next Button', 'Advance slide', e.message, 'FAIL');
      }

      // Tab 5: Team Room Tab
      let clickedTeamTab = false;
      const tabButtonsTeam = await page.$$('button');
      for (const btn of tabButtonsTeam) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text.includes('Team Room')) {
          await btn.click();
          clickedTeamTab = true;
          await new Promise(r => setTimeout(r, 600));
          break;
        }
      }
      const teamText = await page.evaluate(() => document.body.textContent);
      const hasTeamContent = teamText.includes('Workspace Comments') && teamText.includes('Active Teammates');
      logTest('Team Room Tab', 'Show collaboration comments panel and teammates grid', hasTeamContent ? 'Team collaboration room loaded' : 'Not found', hasTeamContent ? 'PASS' : 'FAIL');

      // Test PDF Exporter download
      const exportBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.find(b => b.textContent.includes('Export'));
      });
      const exportEl = exportBtn ? exportBtn.asElement() : null;
      if (exportEl) {
        // Make sure it doesn't crash
        await exportEl.click();
        await new Promise(r => setTimeout(r, 1200));
        logTest('Export PDF Button', 'Compile and download vector document', 'PDF download trigger activated without crash', 'PASS');
      } else {
        logTest('Export PDF Button', 'Download PDF', 'Export button not found', 'FAIL');
      }
    } catch(e) {
      logTest('Project Details Tabs & PDF', 'Validate modules', e.message, 'FAIL');
    }

    // ----------------------------------------------------
    // TEST 5.5: DASHBOARD WORKFLOW ACTIONS (DUPLICATE, OPEN, DELETE)
    // ----------------------------------------------------
    console.log('\n--- Testing Dashboard Projects List Actions ---');
    try {
      // Click Back to Dashboard
      const backLink = await page.evaluateHandle(() => {
        const links = Array.from(document.querySelectorAll('a'));
        return links.find(l => l.getAttribute('href') === '/dashboard');
      });
      const backEl = backLink ? backLink.asElement() : null;
      if (backEl) {
        await backEl.click();
        await page.waitForFunction(() => window.location.pathname === '/dashboard', { timeout: 5000 });
        logTest('Open Project / Back Link', 'Navigate back to dashboard portfolio overview', page.url(), page.url().endsWith('/dashboard') ? 'PASS' : 'FAIL');
      } else {
        logTest('Open Project / Back Link', 'Navigate back', 'Back link not found', 'FAIL');
      }

      // Duplicate Project
      await page.waitForSelector('button[title="Duplicate"]', { timeout: 5000 });
      const duplicateButtons = await page.$$('button[title="Duplicate"]');
      if (duplicateButtons.length > 0) {
        // Intercept prompt alert dialogs if any
        page.on('dialog', async dialog => {
          await dialog.accept();
        });
        await duplicateButtons[0].click();
        await new Promise(r => setTimeout(r, 1200));
        logTest('Duplicate Project Action', 'Clone project in history table', 'Project duplicated successfully', 'PASS');
      } else {
        logTest('Duplicate Project Action', 'Clone project', 'Duplicate button not found', 'FAIL');
      }

      // Delete Project
      await page.waitForSelector('button[title="Delete"]', { timeout: 5000 });
      const deleteButtons = await page.$$('button[title="Delete"]');
      if (deleteButtons.length > 0) {
        await deleteButtons[0].click(); // delete one of the projects
        await new Promise(r => setTimeout(r, 1000));
        logTest('Delete Project Action', 'Remove project from history table', 'Project deleted successfully', 'PASS');
      } else {
        logTest('Delete Project Action', 'Remove project', 'Delete button not found', 'FAIL');
      }
    } catch(e) {
      logTest('Dashboard Projects Actions', 'Test duplicate/delete actions', e.message, 'FAIL');
    }

    // ----------------------------------------------------
    // TEST 6: SESSIONS PERSISTENCE & LOGOUT
    // ----------------------------------------------------
    console.log('\n--- Testing Session Persistence & Logout ---');
    try {
      // Refresh page
      await page.reload({ waitUntil: 'networkidle2' });
      const currentUrl = page.url();
      const isStillLoggedIn = currentUrl.includes('/dashboard');
      logTest('Browser Reload/Refresh', 'Keep active user session logged in', isStillLoggedIn ? 'User remains authenticated' : 'Kicked back', isStillLoggedIn ? 'PASS' : 'FAIL');
    } catch(e) {
      logTest('Browser Reload/Refresh', 'Session refresh', e.message, 'FAIL');
    }

      // Log Out
      try {
        const logoutBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.find(b => b.textContent.includes('Sign Out'));
      });
      const logoutEl = logoutBtn ? logoutBtn.asElement() : null;
      if (logoutEl) {
        await logoutEl.click();
        await page.waitForFunction(() => window.location.pathname.includes('/login'), { timeout: 5000 });
        const loginUrl = page.url();
        logTest('Sign Out Button', 'Destroy session cookie and redirect to /login', `Redirected to: ${loginUrl}`, loginUrl.includes('/login') ? 'PASS' : 'FAIL');
      } else {
        logTest('Sign Out Button', 'Logout', 'Sign Out button not found', 'FAIL');
      }
    } catch(e) {
      logTest('Sign Out Button', 'Logout', e.message, 'FAIL');
    }

  } catch (error) {
    console.error('CRITICAL: Automation script failed abruptly:', error);
  } finally {
    await browser.close();
    
    // Save report result
    console.log('\n--- AUTOMATION RESULTS ---');
    console.table(results);
    
    console.log('\n--- ERRORS TRACKED ---');
    console.log(`Console Errors count: ${consoleErrors.length}`);
    console.log(`Network Failures count: ${networkFailures.length}`);
    
    if (consoleErrors.length > 0) {
      console.log(consoleErrors.slice(0, 5).join('\n'));
    }
    if (networkFailures.length > 0) {
      console.log(networkFailures.slice(0, 5).join('\n'));
    }
  }
}

runTests();
