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

  // Calculate row layout details beforehand
  const tamSamSom = [
    { name: 'TAM (Total Addressable Market)', val: report.marketSize, def: 'Entire potential global demand for your core category.' },
    { name: 'SAM (Serviceable Addressable Market)', val: `$${(parseFloat(report.marketSize.replace(/[^0-9.]/g, '')) * 0.15 || 1.8).toFixed(1)} Billion`, def: 'Segment of TAM targeted by your specific products/geography.' },
    { name: 'SOM (Serviceable Obtainable Market)', val: `$${(parseFloat(report.marketSize.replace(/[^0-9.]/g, '')) * 0.02 || 0.25).toFixed(1)} Billion`, def: 'Market share you can capture realistically within 3 years.' }
  ];

  const preparedRows = tamSamSom.map(row => {
    // Metric wrapping
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    const metricLines = doc.splitTextToSize(row.name, 32);

    // Value font scaling & wrapping
    let valFontSize = 8;
    if (row.val.length > 30) {
      valFontSize = 6;
    } else if (row.val.length > 18) {
      valFontSize = 7;
    }
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(valFontSize);
    const valueLines = doc.splitTextToSize(row.val, 32);

    // Definition wrapping
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    const defLines = doc.splitTextToSize(row.def, 86);

    const maxLines = Math.max(metricLines.length, valueLines.length, defLines.length);
    const rowHeight = (maxLines * 4.2) + 3; // 4.2mm per line + 3mm padding

    return {
      metricLines,
      valueLines,
      defLines,
      valFontSize,
      rowHeight
    };
  });

  const tableHeaderHeight = 22; // Height from card top to first row content
  const tableRowsHeight = preparedRows.reduce((acc, r) => acc + r.rowHeight, 0);
  const cardHeight = tableHeaderHeight + tableRowsHeight + 4; // 4mm padding at bottom

  // Now draw the card background enclosing the table
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, contentWidth, cardHeight, 'F');
  
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('TAM / SAM / SOM Sizing Model', margin + 6, y + 8);

  // Table header
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('METRIC', margin + 6, y + 18);
  doc.text('VALUE', margin + 42, y + 18);
  doc.text('STRATEGIC DEFINITION', margin + 78, y + 18);
  
  doc.setDrawColor(226, 232, 240);
  doc.line(margin + 6, y + 21, pageWidth - margin - 6, y + 21);

  // Render rows
  let rowY = y + 21; // start after header line
  preparedRows.forEach((row) => {
    // Col 1: Metric
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(row.metricLines, margin + 6, rowY + 4);

    // Col 2: Value
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(row.valFontSize);
    doc.setTextColor(139, 92, 246);
    doc.text(row.valueLines, margin + 42, rowY + 4);

    // Col 3: Definition
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(row.defLines, margin + 78, rowY + 4);

    rowY += row.rowHeight;
    // Draw row separator line at the bottom of row
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin + 6, rowY, margin + contentWidth - 6, rowY);
  });

  y += cardHeight + 8;

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
  doc.text('FUNDING', margin + 42, y + 5.5);
  doc.text('PRICING MODEL', margin + 78, y + 5.5);
  doc.text('COMPETITIVE POSITION', margin + 114, y + 5.5);
  y += 8;

  const preparedCompetitors = report.competitors?.map(comp => {
    // 1. Competitor Name wrap
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    const nameLines = doc.splitTextToSize(comp.name, 34);

    // 2. Funding wrap & auto font-scale
    let fundingFontSize = 8;
    if (comp.funding.length > 25) fundingFontSize = 6.5;
    else if (comp.funding.length > 15) fundingFontSize = 7;
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(fundingFontSize);
    const fundingLines = doc.splitTextToSize(comp.funding, 32);

    // 3. Pricing Model wrap & auto font-scale
    let pricingFontSize = 8;
    if (comp.pricing.length > 25) pricingFontSize = 6.5;
    else if (comp.pricing.length > 15) pricingFontSize = 7;
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(pricingFontSize);
    const pricingLines = doc.splitTextToSize(comp.pricing, 32);

    // 4. Position wrap
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    const posLines = doc.splitTextToSize(comp.position, 50);

    const maxLines = Math.max(nameLines.length, fundingLines.length, pricingLines.length, posLines.length);
    const rowHeight = (maxLines * 4.2) + 4; // 4.2mm per line + 4mm padding

    return {
      comp,
      nameLines,
      fundingLines,
      fundingFontSize,
      pricingLines,
      pricingFontSize,
      posLines,
      rowHeight
    };
  }) || [];

  preparedCompetitors.forEach((row, idx) => {
    // Alternating rows background
    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.rect(margin, y, contentWidth, row.rowHeight, 'F');

    // Bottom border line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, y + row.rowHeight, margin + contentWidth, y + row.rowHeight);

    // Render cells
    // Col 1: Competitor Name
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(row.nameLines, margin + 4, y + 4.5);

    // Col 2: Funding
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(row.fundingFontSize);
    doc.setTextColor(71, 85, 105);
    doc.text(row.fundingLines, margin + 42, y + 4.5);

    // Col 3: Pricing
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(row.pricingFontSize);
    doc.setTextColor(71, 85, 105);
    doc.text(row.pricingLines, margin + 78, y + 4.5);

    // Col 4: Position
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(row.posLines, margin + 114, y + 4.5);

    y += row.rowHeight;
  });

  y += 10;

  // Positioning Grid Details
  const preparedGrid = report.competitors?.slice(0, 3).map((comp) => {
    const nameText = `${comp.name}:`;
    
    // Description wrap
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    const descLines = doc.splitTextToSize(comp.description, 125);

    const rowHeight = Math.max(1, descLines.length) * 4.2 + 2;
    return {
      nameText,
      descLines,
      rowHeight
    };
  }) || [];

  const gridHeaderHeight = 14;
  const gridRowsHeight = preparedGrid.reduce((acc, r) => acc + r.rowHeight, 0);
  const gridCardHeight = gridHeaderHeight + gridRowsHeight + 4;

  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, contentWidth, gridCardHeight, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Strategic Positioning Matrix Insights', margin + 6, y + 8);

  let currentGridY = y + 15;
  preparedGrid.forEach((row) => {
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(row.nameText, margin + 6, currentGridY);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(row.descLines, margin + 35, currentGridY);

    currentGridY += row.rowHeight;
  });

  y += gridCardHeight + 10;


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

  // Calculate persona layout details first
  const wrappedGoals = (persona.goals || []).slice(0, 3).map(g => {
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    return doc.splitTextToSize(`• ${g}`, 72);
  });
  const wrappedPains = (persona.painPoints || []).slice(0, 3).map(p => {
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    return doc.splitTextToSize(`• ${p}`, 72);
  });

  let projectedLeftY = y + 22;
  wrappedGoals.forEach(gLines => {
    projectedLeftY += (gLines.length * 4) + 1;
  });

  let projectedRightY = y + 22;
  wrappedPains.forEach(pLines => {
    projectedRightY += (pLines.length * 4) + 1;
  });

  const maxPersonaContentY = Math.max(projectedLeftY, projectedRightY);
  const personaCardHeight = (maxPersonaContentY - y) + 4;

  // Draw background card
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, contentWidth, personaCardHeight, 'F');
  
  doc.setFillColor(139, 92, 246);
  doc.rect(margin, y, 4, personaCardHeight, 'F');

  // Draw Header info
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(`${persona.name} (${persona.age} | ${persona.occupation})`, margin + 8, y + 8);

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('GOALS & DRIVERS', margin + 8, y + 16);
  doc.text('PAIN POINTS', margin + (contentWidth / 2) + 4, y + 16);

  // Draw wrapped text
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  
  let drawLeftY = y + 22;
  wrappedGoals.forEach(gLines => {
    doc.text(gLines, margin + 8, drawLeftY);
    drawLeftY += (gLines.length * 4) + 1;
  });

  let drawRightY = y + 22;
  wrappedPains.forEach(pLines => {
    doc.text(pLines, margin + (contentWidth / 2) + 4, drawRightY);
    drawRightY += (pLines.length * 4) + 1;
  });

  y += personaCardHeight + 8;

  y = drawSectionHeader(doc, '6. Revenue Tiers & Projections', y);

  // Revenue Tiers
  const tierW = (contentWidth / 3) - 3;
  
  // Calculate max height for pricing cards
  const preparedTiers = report.revenueModels?.slice(0, 3).map((model) => {
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    const nameLines = doc.splitTextToSize(model.name, tierW - 8);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    const pricingText = model.monthlyPricing || '$49/mo';

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7);
    const stratLines = doc.splitTextToSize(model.strategy || 'Value optimization model', tierW - 8);

    const nameHeight = nameLines.length * 4;
    const stratHeight = stratLines.length * 3.5;
    const totalHeight = 10 + nameHeight + 8 + stratHeight + 6; // base offset + padding
    
    return {
      model,
      nameLines,
      pricingText,
      stratLines,
      totalHeight
    };
  }) || [];

  const maxTierHeight = Math.max(46, ...preparedTiers.map(t => t.totalHeight));

  preparedTiers.forEach((tier, i) => {
    const tierX = margin + (i * (tierW + 4.5));
    
    // Draw background card with maxTierHeight
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.rect(tierX, y, tierW, maxTierHeight, 'FD');

    // Accent line for Middle Tier
    if (i === 1) {
      doc.setFillColor(139, 92, 246);
      doc.rect(tierX, y, tierW, 3, 'F');
    }

    // Render name
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(tier.nameLines, tierX + 4, y + 10);

    // Render pricing
    const pricingY = y + 10 + (tier.nameLines.length * 4) + 2;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(13); // Reduced slightly to avoid overflow
    doc.setTextColor(139, 92, 246);
    doc.text(tier.pricingText, tierX + 4, pricingY);

    // Render strategy description
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(tier.stratLines, tierX + 4, pricingY + 5);
  });

  y += maxTierHeight + 10;


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

  let currentRoadmapY = y + 10;
  
  const preparedPhases = phases.map((phase) => {
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9.5);
    const titleLines = doc.splitTextToSize(`${phase.title} (${phase.duration})`, contentWidth - 20);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    const wrappedFeatures = phase.features.slice(0, 3).map(feat => {
      return doc.splitTextToSize(`• ${feat}`, contentWidth - 24);
    });

    let featuresHeight = 0;
    wrappedFeatures.forEach(lines => {
      featuresHeight += (lines.length * 4) + 1.5;
    });
    
    const totalHeight = (titleLines.length * 4.5) + featuresHeight + 6;
    return {
      titleLines,
      wrappedFeatures,
      totalHeight
    };
  });

  preparedPhases.forEach((phase, i) => {
    // Draw timeline circle node
    doc.setFillColor(139, 92, 246);
    doc.circle(margin + 4, currentRoadmapY + 3, 3.5, 'F');
    
    // Draw line connecting nodes
    if (i < 2) {
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(1.2);
      doc.line(margin + 4, currentRoadmapY + 6, margin + 4, currentRoadmapY + phase.totalHeight + 3);
    }

    // Render title
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(phase.titleLines, margin + 14, currentRoadmapY + 4);

    // Render features
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);

    let featY = currentRoadmapY + 4 + (phase.titleLines.length * 4.5);
    phase.wrappedFeatures.forEach((featLines) => {
      doc.text(featLines, margin + 14, featY);
      featY += (featLines.length * 4) + 1.5;
    });

    currentRoadmapY += phase.totalHeight;
  });

  y = currentRoadmapY + 4;


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
      const comp1Name = report.competitors?.[0]?.name || 'CompPro';
      const comp1Pos = report.competitors?.[0]?.position || 'Leader';
      const comp1Text = `1. ${comp1Name} - ${comp1Pos}`;
      
      const comp2Name = report.competitors?.[1]?.name || 'FlowSaaS';
      const comp2Pos = report.competitors?.[1]?.position || 'Challenger';
      const comp2Text = `2. ${comp2Name} - ${comp2Pos}`;

      const nameTrunc1 = comp1Text.length > 30 ? comp1Text.substring(0, 27) + '...' : comp1Text;
      const nameTrunc2 = comp2Text.length > 30 ? comp2Text.substring(0, 27) + '...' : comp2Text;
      
      doc.text(nameTrunc1, graphicX + 10, cy);
      doc.text(nameTrunc2, graphicX + 10, cy + 8);
      doc.setTextColor(139, 92, 246);
      doc.setFont('Helvetica', 'bold');
      
      const myText = `3. ${project.name} - Disruptor (AI Edge)`;
      const myTrunc = myText.length > 30 ? myText.substring(0, 27) + '...' : myText;
      doc.text(myTrunc, graphicX + 10, cy + 16);
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
