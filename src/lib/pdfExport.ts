import { jsPDF } from 'jspdf';
import { DBProject } from './db';

// Color Palette Constants
const COLS = {
  bgDark: [15, 23, 42],      // Slate-900
  bgLight: [248, 250, 252],   // Slate-50
  cardBg: [255, 255, 255],    // White
  accentPurple: [139, 92, 246], // Violet-500
  accentCyan: [6, 182, 212],    // Cyan-500
  borderLight: [226, 232, 240], // Slate-200
  textDark: [30, 41, 59],     // Slate-800
  textMuted: [100, 116, 139],  // Slate-500
  textLight: [255, 255, 255],   // White
  success: [16, 185, 129],    // Emerald-500
  warning: [245, 158, 11],    // Amber-500
  danger: [239, 68, 68]       // Red-500
};

// Running Header Helper
const drawHeader = (doc: jsPDF, title: string, pageNum: number) => {
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.text('STARTUPSCOUT AI  |  STRATEGIC BRIEF', 20, 15);
  doc.setFont('Helvetica', 'normal');
  doc.text(title.toUpperCase(), doc.internal.pageSize.width - 20, 15, { align: 'right' });
  
  // Thin rule
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(20, 18, doc.internal.pageSize.width - 20, 18);
};

// Running Footer Helper
const drawFooter = (doc: jsPDF, pageNum: number, totalPages: number) => {
  const y = doc.internal.pageSize.height - 12;
  const w = doc.internal.pageSize.width;
  
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(20, y - 4, w - 20, y - 4);
  
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('CONFIDENTIAL & PROPRIETARY  |  PREMIUM VAL REPORT', 20, y);
  doc.text(`Page ${pageNum} of ${totalPages}`, w - 20, y, { align: 'right' });
};

// Section Title Helper
const drawSectionHeader = (doc: jsPDF, label: string, y: number): number => {
  doc.setFillColor(139, 92, 246);
  doc.rect(20, y - 4, 3, 6, 'F');
  
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.text(label, 26, y);
  return y + 8;
};

export const exportReportToPDF = (project: DBProject) => {
  const report = project.report;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  const totalPages = 8;

  // --- PAGE 1: EXECUTIVE COVER PAGE ---
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Subtle background glow patterns
  doc.setFillColor(30, 27, 75); // deep indigo
  doc.circle(pageWidth, 0, 120, 'F');

  // Brand Strip
  doc.setFillColor(139, 92, 246); // violet-500
  doc.rect(0, 0, 6, pageHeight, 'F');

  // Branding Title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(139, 92, 246);
  doc.text('STARTUPSCOUT AI', 25, 45);

  // Big Title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(30);
  doc.setTextColor(255, 255, 255);
  const projectNameLines = doc.splitTextToSize(project.name.toUpperCase(), contentWidth - 10);
  doc.text(projectNameLines, 25, 65);

  // Tagline
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(156, 163, 175); // gray-400
  doc.text(report.idea.length > 80 ? report.idea.substring(0, 77) + '...' : report.idea, 25, 85);

  // Separator
  doc.setDrawColor(51, 65, 85);
  doc.setLineWidth(0.5);
  doc.line(25, 95, pageWidth - 25, 95);

  // Meta info grid
  let metaY = 110;
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // Slate-400
  
  const metaItems = [
    { label: 'INDUSTRY', val: project.industry },
    { label: 'STAGE', val: project.stage },
    { label: 'LOCATION', val: project.country },
    { label: 'BUDGET LIMIT', val: project.budget },
    { label: 'GENERATED ON', val: new Date(project.createdAt).toLocaleDateString() }
  ];

  metaItems.forEach((item, i) => {
    doc.setFont('Helvetica', 'bold');
    doc.text(item.label, 25, metaY + (i * 10));
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(248, 250, 252);
    doc.text(item.val, 65, metaY + (i * 10));
    doc.setTextColor(148, 163, 184);
  });

  // Score Emblem Card
  const scoreBoxY = 180;
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(25, scoreBoxY, pageWidth - 50, 60, 'F');
  
  // Left border glow
  doc.setFillColor(139, 92, 246);
  doc.rect(25, scoreBoxY, 4, 60, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('STARTUP VIABILITY INDEX', 38, scoreBoxY + 15);

  // Big Score Circle
  doc.setFillColor(15, 23, 42); // dark background
  doc.circle(50, scoreBoxY + 36, 12, 'F');
  
  doc.setFontSize(16);
  doc.setTextColor(139, 92, 246);
  const scoreNum = report.score?.overall || 75;
  doc.text(`${scoreNum}`, 50, scoreBoxY + 38, { align: 'center' });

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225); // Slate-300
  
  const scoreText = doc.splitTextToSize(
    'This evaluation incorporates user validation demand, competitor densities, pricing margins, scalability coefficients, and operations difficulty indexes. Scores above 70 indicate strong launch potential.',
    pageWidth - 120
  );
  doc.text(scoreText, 72, scoreBoxY + 30);


  // --- PAGE 2: EXECUTIVE SUMMARY ---
  doc.addPage();
  drawHeader(doc, project.name, 2);
  drawFooter(doc, 2, totalPages);
  
  let y = 32;
  y = drawSectionHeader(doc, '1. Executive Summary', y);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);
  const summaryIntro = doc.splitTextToSize(
    `An evaluation of ${project.name} within the ${project.industry} space. This validation covers core metrics, competitive forces, revenue economics, and roadmap scaling.`,
    contentWidth
  );
  doc.text(summaryIntro, margin, y);
  y += 15;

  // Draw 5 KPI cards
  const kpis = [
    { label: 'MARKET DEMAND', score: report.score?.demand || 72, desc: 'High validation signal, target demographic surveys indicate solid demand.', col: COLS.success },
    { label: 'COMPETITION', score: report.score?.competition || 60, desc: 'Moderate saturation. Niche positioning is required to bypass incumbents.', col: COLS.warning },
    { label: 'SCALABILITY', score: report.score?.scalability || 82, desc: 'Excellent software distribution potential with low marginal cost structure.', col: COLS.success },
    { label: 'REVENUE POTENTIAL', score: report.score?.revenue || 78, desc: 'Recurring tiers show strong lifetime value and enterprise contract expansion.', col: COLS.success },
    { label: 'INVESTOR APPEAL', score: report.score?.appeal || 74, desc: 'Highly attractive target for Seed-stage investors with founder-market fit.', col: COLS.accentPurple }
  ];

  kpis.forEach((kpi) => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.rect(margin, y, contentWidth, 24, 'FD');

    // Colored badge bar
    doc.setFillColor(kpi.col[0], kpi.col[1], kpi.col[2]);
    doc.rect(margin, y, 3, 24, 'F');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(kpi.col[0], kpi.col[1], kpi.col[2]);
    doc.text(kpi.label, margin + 8, y + 7);

    // Score badge
    doc.setFillColor(241, 245, 249);
    doc.rect(pageWidth - margin - 22, y + 4, 15, 7, 'F');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`${kpi.score}/100`, pageWidth - margin - 14, y + 9, { align: 'center' });

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    const descText = doc.splitTextToSize(kpi.desc, contentWidth - 30);
    doc.text(descText, margin + 8, y + 14);

    y += 29;
  });


  // --- PAGE 3: MARKET INTELLIGENCE ---
  doc.addPage();
  drawHeader(doc, project.name, 3);
  drawFooter(doc, 3, totalPages);
  
  y = 32;
  y = drawSectionHeader(doc, '2. Market Sizing & Intelligence', y);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  const mktText = doc.splitTextToSize(report.industryOverview, contentWidth);
  doc.text(mktText, margin, y);
  y += (mktText.length * 4.5) + 8;

  // TAM / SAM / SOM Table Card
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, contentWidth, 52, 'F');
  
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('TAM / SAM / SOM Sizing Model', margin + 6, y + 8);

  // Table header
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('METRIC', margin + 6, y + 18);
  doc.text('VALUE', margin + 45, y + 18);
  doc.text('STRATEGIC DEFINITION', margin + 80, y + 18);
  
  doc.setDrawColor(226, 232, 240);
  doc.line(margin + 6, y + 21, pageWidth - margin - 6, y + 21);

  // Rows
  const tamSamSom = [
    { name: 'TAM (Total Addressable Market)', val: report.marketSize, def: 'Entire potential global demand for your core category.' },
    { name: 'SAM (Serviceable Addressable Market)', val: `$${(parseInt(report.marketSize.replace(/[^0-9]/g, '')) * 0.15 || 1.8).toFixed(1)} Billion`, def: 'Segment of TAM targeted by your specific products/geography.' },
    { name: 'SOM (Serviceable Obtainable Market)', val: `$${(parseInt(report.marketSize.replace(/[^0-9]/g, '')) * 0.02 || 0.25).toFixed(1)} Billion`, def: 'Market share you can capture realistically within 3 years.' }
  ];

  tamSamSom.forEach((row, i) => {
    const rowY = y + 27 + (i * 8);
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(row.name, margin + 6, rowY);
    doc.setTextColor(139, 92, 246);
    doc.text(row.val, margin + 45, rowY);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(row.def, margin + 80, rowY);
  });

  y += 62;

  // Growth Trend Card
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 34, 'FD');
  
  // Left border
  doc.setFillColor(6, 182, 212);
  doc.rect(margin, y, 3, 34, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(6, 182, 212);
  doc.text('GROWTH & TAM DYNAMICS', margin + 8, y + 7);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  doc.text(`+${report.growthRate}`, margin + 8, y + 17);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const trendText = doc.splitTextToSize(
    `This sector exhibits rapid distribution expansion, fueled by structural digital transformations. The CAGR signifies high investment urgency.`,
    contentWidth - 20
  );
  doc.text(trendText, margin + 8, y + 23);


  // --- PAGE 4: COMPETITIVE LANDSCAPE ---
  doc.addPage();
  drawHeader(doc, project.name, 4);
  drawFooter(doc, 4, totalPages);
  
  y = 32;
  y = drawSectionHeader(doc, '3. Competitive Matrix & Positioning', y);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text('A breakdown of primary market contenders and their business positioning models:', margin, y);
  y += 6;

  // Competitor Matrix Table
  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('COMPETITOR', margin + 4, y + 5.5);
  doc.text('FUNDING', margin + 45, y + 5.5);
  doc.text('PRICING MODEL', margin + 80, y + 5.5);
  doc.text('COMPETITIVE POSITION', margin + 115, y + 5.5);
  y += 8;

  report.competitors?.forEach((comp, idx) => {
    // Alternating rows
    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.rect(margin, y, contentWidth, 11, 'F');

    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y + 11, margin + contentWidth, y + 11);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(comp.name, margin + 4, y + 7);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(comp.funding, margin + 45, y + 7);
    doc.text(comp.pricing, margin + 80, y + 7);
    
    const posText = doc.splitTextToSize(comp.position, contentWidth - 120);
    doc.text(posText, margin + 115, y + 7);

    y += 11;
  });

  y += 10;

  // Positioning Grid Details
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, contentWidth, 42, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Strategic Positioning Matrix Insights', margin + 6, y + 8);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  let gridY = y + 16;
  report.competitors?.slice(0, 3).forEach((comp, idx) => {
    doc.setFont('Helvetica', 'bold');
    doc.text(`${comp.name}:`, margin + 6, gridY);
    doc.setFont('Helvetica', 'normal');
    doc.text(comp.description.length > 95 ? comp.description.substring(0, 92) + '...' : comp.description, margin + 35, gridY);
    gridY += 8;
  });


  // --- PAGE 5: SWOT ANALYSIS ---
  doc.addPage();
  drawHeader(doc, project.name, 5);
  drawFooter(doc, 5, totalPages);
  
  y = 32;
  y = drawSectionHeader(doc, '4. SWOT Analysis', y);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);
  doc.text('A structural consulting map of internal capabilities versus market constraints:', margin, y);
  y += 8;

  // 2x2 grid parameters
  const gridW = (contentWidth / 2) - 3;
  const gridH = 65;

  const swotData = [
    { title: 'STRENGTHS (Internal)', items: report.swot?.strengths || [], x: margin, y: y, col: COLS.success },
    { title: 'WEAKNESSES (Internal)', items: report.swot?.weaknesses || [], x: margin + gridW + 6, y: y, col: COLS.warning },
    { title: 'OPPORTUNITIES (External)', items: report.swot?.opportunities || [], x: margin, y: y + gridH + 6, col: COLS.accentCyan },
    { title: 'THREATS (External)', items: report.swot?.threats || [], x: margin + gridW + 6, y: y + gridH + 6, col: COLS.danger }
  ];

  swotData.forEach((block) => {
    doc.setFillColor(248, 250, 252);
    doc.rect(block.x, block.y, gridW, gridH, 'F');
    
    // Top colored border hook
    doc.setFillColor(block.col[0], block.col[1], block.col[2]);
    doc.rect(block.x, block.y, gridW, 3, 'F');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(block.col[0], block.col[1], block.col[2]);
    doc.text(block.title, block.x + 6, block.y + 10);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);

    let itemY = block.y + 18;
    block.items.slice(0, 4).forEach((item) => {
      const wrappedItem = doc.splitTextToSize(`• ${item}`, gridW - 12);
      doc.text(wrappedItem, block.x + 6, itemY);
      itemY += (wrappedItem.length * 4.5) + 1.5;
    });
  });


  // --- PAGE 6: CUSTOMER PERSONAS & REVENUE MODEL ---
  doc.addPage();
  drawHeader(doc, project.name, 6);
  drawFooter(doc, 6, totalPages);
  
  y = 32;
  y = drawSectionHeader(doc, '5. Customer Target Persona', y);

  const persona = report.personas?.[0] || { name: 'Early Adopter Founder', age: 30, occupation: 'Product Lead', goals: ['Automate code validation', 'Fast prototypes'], painPoints: ['Too slow custom development', 'High designer bills'], motivations: ['Maximize output'], behavior: 'Active tech scout' };

  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, contentWidth, 48, 'F');
  
  doc.setFillColor(139, 92, 246);
  doc.rect(margin, y, 4, 48, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(`${persona.name} (${persona.age} | ${persona.occupation})`, margin + 8, y + 8);

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('GOALS & DRIVERS', margin + 8, y + 16);
  doc.text('PAIN POINTS', margin + (contentWidth / 2) + 4, y + 16);

  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  let goalY = y + 22;
  persona.goals?.slice(0, 3).forEach((g) => {
    doc.text(`- ${g}`, margin + 8, goalY);
    goalY += 5;
  });

  let painY = y + 22;
  persona.painPoints?.slice(0, 3).forEach((p) => {
    doc.text(`- ${p}`, margin + (contentWidth / 2) + 4, painY);
    painY += 5;
  });

  y += 56;

  y = drawSectionHeader(doc, '6. Revenue Tiers & Projections', y);

  // Revenue tiers
  const tierW = (contentWidth / 3) - 3;
  report.revenueModels?.slice(0, 3).forEach((model, i) => {
    const tierX = margin + (i * (tierW + 4.5));
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.rect(tierX, y, tierW, 46, 'FD');

    // Accent line for Middle Tier
    if (i === 1) {
      doc.setFillColor(139, 92, 246);
      doc.rect(tierX, y, tierW, 3, 'F');
    }

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(model.name, tierX + 4, y + 10);

    doc.setFontSize(14);
    doc.setTextColor(139, 92, 246);
    doc.text(model.monthlyPricing || '$49/mo', tierX + 4, y + 20);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    const stratLines = doc.splitTextToSize(model.strategy || 'Value optimization model', tierW - 8);
    doc.text(stratLines, tierX + 4, y + 27);
  });


  // --- PAGE 7: MVP ROADMAP ---
  doc.addPage();
  drawHeader(doc, project.name, 7);
  drawFooter(doc, 7, totalPages);
  
  y = 32;
  y = drawSectionHeader(doc, '7. MVP Execution Roadmap', y);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);
  doc.text('A structured chronological sequence to launch and scale validation checkpoints:', margin, y);
  y += 10;

  const phases = [
    { title: `Phase 1: ${report.roadmap?.phase1?.title || 'Core Dev'}`, duration: report.roadmap?.phase1?.duration || '30 days', features: report.roadmap?.phase1?.features || [] },
    { title: `Phase 2: ${report.roadmap?.phase2?.title || 'Beta Launch'}`, duration: report.roadmap?.phase2?.duration || '60 days', features: report.roadmap?.phase2?.features || [] },
    { title: `Phase 3: ${report.roadmap?.phase3?.title || 'Scale Tiers'}`, duration: report.roadmap?.phase3?.duration || '90 days', features: report.roadmap?.phase3?.features || [] }
  ];

  phases.forEach((phase, i) => {
    // Draw timeline circle node
    doc.setFillColor(139, 92, 246);
    doc.circle(margin + 4, y + 3, 3, 'F');
    
    // Draw line connecting nodes
    if (i < 2) {
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(1);
      doc.line(margin + 4, y + 6, margin + 4, y + 38);
    }

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${phase.title} (${phase.duration})`, margin + 14, y + 4);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);

    let featY = y + 10;
    phase.features.slice(0, 3).forEach((feat) => {
      doc.text(`- ${feat}`, margin + 14, featY);
      featY += 5;
    });

    y += 36;
  });


  // --- PAGE 8: INVESTMENT RECOMMENDATION ---
  doc.addPage();
  drawHeader(doc, project.name, 8);
  drawFooter(doc, 8, totalPages);
  
  y = 32;
  y = drawSectionHeader(doc, '8. Investment Recommendation', y);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text('Strategic investment metrics and recommendation grade from StartupScout AI intelligence engines:', margin, y);
  y += 10;

  // Grade badge container
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, contentWidth, 80, 'F');
  
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.rect(margin, y, contentWidth, 80);

  // Big Grade Circle
  doc.setFillColor(15, 23, 42);
  doc.circle(margin + 30, y + 40, 20, 'F');

  // Letter Grade calculation
  let gradeLetter = 'B+';
  if (scoreNum >= 85) gradeLetter = 'A+';
  else if (scoreNum >= 78) gradeLetter = 'A';
  else if (scoreNum >= 70) gradeLetter = 'B';
  else gradeLetter = 'C';

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(139, 92, 246);
  doc.text(gradeLetter, margin + 30, y + 43, { align: 'center' });

  // Recommendations Details
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('GRADE EVALUATION', margin + 65, y + 20);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Startup Grade:`, margin + 65, y + 28);
  doc.text(`Risk Profile:`, margin + 65, y + 36);
  doc.text(`Recommendation:`, margin + 65, y + 44);

  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${gradeLetter} Rating`, margin + 95, y + 28);
  
  const riskStr = scoreNum >= 78 ? 'Low Risk' : scoreNum >= 70 ? 'Moderate Risk' : 'High Risk';
  doc.setTextColor(scoreNum >= 78 ? 16 : 245, scoreNum >= 78 ? 185 : 158, scoreNum >= 78 ? 129 : 11);
  doc.text(riskStr, margin + 95, y + 36);

  doc.setTextColor(139, 92, 246);
  const recStr = scoreNum >= 78 ? 'PROCEED TO LAUNCH / FUNDING' : scoreNum >= 70 ? 'VALIDATE SECONDARY MVP FEATURES' : 'REPIVOT CORE VALUE PROPOSITION';
  doc.text(recStr, margin + 95, y + 44);

  // Summary recommendation text
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const recPara = doc.splitTextToSize(
    `Based on the overall viability score of ${scoreNum}/100, the venture has demonstrated ${scoreNum >= 70 ? 'substantial' : 'limited'} market confidence indicators. We recommend founders to focus on ${scoreNum >= 70 ? 'early customer acquisition' : 'restructuring the key value metrics and customer interviews before committing development assets'}.`,
    contentWidth - 75
  );
  doc.text(recPara, margin + 65, y + 52);


  // Save PDF file
  doc.save(`${project.name.replace(/\s+/g, '_')}_validation_report.pdf`);
};

export const exportPitchDeckToPDF = (project: DBProject) => {
  const report = project.report;
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 25;
  const contentWidth = pageWidth - (margin * 2);

  report.pitchDeck?.forEach((slide, idx) => {
    if (idx > 0) {
      doc.addPage();
    }

    // Slide Background
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Slide border decoration
    doc.setDrawColor(30, 41, 59); // slate-800
    doc.setLineWidth(0.5);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

    // Bottom brand strip
    doc.setFillColor(139, 92, 246); // violet-500
    doc.rect(10, pageHeight - 13, pageWidth - 20, 3, 'F');

    // Title / Slide ID
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(139, 92, 246);
    doc.text(`SLIDE ${slide.id} OF 10`, margin, 25);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`${project.name.toUpperCase()}  |  PITCH DECK`, pageWidth - margin, 25, { align: 'right' });

    // Divider
    doc.setDrawColor(30, 41, 59);
    doc.line(margin, 29, pageWidth - margin, 29);

    // Slide Title
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text(slide.title, margin, 42);

    // Slide bullets on the Left
    let bulletY = 58;
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(203, 213, 225); // slate-300
    
    slide.bullets?.forEach((bullet) => {
      // Draw bullet point custom text wrapped to fit 140mm wide
      const lines = doc.splitTextToSize(bullet, 140);
      doc.setFillColor(139, 92, 246);
      doc.circle(margin + 1, bulletY - 1, 0.8, 'F'); // Draw bullet dot
      doc.text(lines, margin + 5, bulletY);
      bulletY += (lines.length * 6) + 3;
    });

    // Right Column visual mockup box
    const graphicX = pageWidth - margin - 80;
    const graphicY = 50;
    const graphicW = 80;
    const graphicH = 65;

    doc.setFillColor(30, 41, 59); // slate-800 background
    doc.rect(graphicX, graphicY, graphicW, graphicH, 'F');
    doc.setDrawColor(71, 85, 105);
    doc.setLineWidth(0.5);
    doc.rect(graphicX, graphicY, graphicW, graphicH);

    // Inside graphic labels
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    
    if (slide.id === 1) {
      doc.setTextColor(239, 68, 68);
      doc.text('THE PAIN POINT', graphicX + (graphicW / 2), graphicY + 20, { align: 'center' });
      doc.setFontSize(14);
      doc.text('8+ HOURS LOST', graphicX + (graphicW / 2), graphicY + 36, { align: 'center' });
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('spent on manual operations weekly', graphicX + (graphicW / 2), graphicY + 46, { align: 'center' });
    } 
    else if (slide.id === 2) {
      doc.setTextColor(139, 92, 246);
      doc.text('THE VENTURE SOLUTION', graphicX + (graphicW / 2), graphicY + 20, { align: 'center' });
      doc.setFontSize(14);
      doc.text(project.name.toUpperCase(), graphicX + (graphicW / 2), graphicY + 36, { align: 'center' });
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('AI-guided validation automation', graphicX + (graphicW / 2), graphicY + 46, { align: 'center' });
    }
    else if (slide.id === 3) {
      doc.setTextColor(6, 182, 212);
      doc.text('MARKET DYNAMICS', graphicX + (graphicW / 2), graphicY + 20, { align: 'center' });
      doc.setFontSize(14);
      doc.text(report.marketSize, graphicX + (graphicW / 2), graphicY + 36, { align: 'center' });
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Growing at a ${report.growthRate} CAGR`, graphicX + (graphicW / 2), graphicY + 46, { align: 'center' });
    }
    else if (slide.id === 5) {
      doc.text('COMPETITOR POSITIONING', graphicX + (graphicW / 2), graphicY + 14, { align: 'center' });
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      
      let cy = graphicY + 26;
      doc.text(`1. ${report.competitors?.[0]?.name || 'CompPro'} - ${report.competitors?.[0]?.position || 'Leader'}`, graphicX + 10, cy);
      doc.text(`2. ${report.competitors?.[1]?.name || 'FlowSaaS'} - ${report.competitors?.[1]?.position || 'Challenger'}`, graphicX + 10, cy + 8);
      doc.setTextColor(139, 92, 246);
      doc.setFont('Helvetica', 'bold');
      doc.text(`3. ${project.name} - Disruptor (AI Edge)`, graphicX + 10, cy + 16);
    }
    else {
      doc.setTextColor(139, 92, 246);
      doc.text(project.name.toUpperCase(), graphicX + (graphicW / 2), graphicY + 25, { align: 'center' });
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('Confidential Investor Presentation', graphicX + (graphicW / 2), graphicY + 38, { align: 'center' });
    }

    // Slide footer labels
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('CONFIDENTIAL & PROPRIETARY', margin, pageHeight - 18);
    doc.text(`SLIDE ${slide.id} OF 10`, pageWidth - margin, pageHeight - 18, { align: 'right' });
  });

  doc.save(`${project.name.replace(/\s+/g, '_')}_investor_deck.pdf`);
};
