import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// Helper function to sanitize text for PDF
const sanitizeTextForPdf = (text) => {
  if (!text) return text;
  return text.toString().replace(/₹/g, 'Rs.');
};

// Helper function to keep text until first complete sentence
const smartTruncateToSentence = (text, minLength = 40) => {
  if (!text) return '';
  text = text.toString().trim();
  
  // If text is short enough, return as-is
  if (text.length <= minLength) return text;
  
  // Look for first period after reasonable minimum length
  const periodIndex = text.indexOf('.');
  
  if (periodIndex !== -1 && periodIndex >= minLength) {
    // Found a period after minimum length, keep until period
    return text.substring(0, periodIndex + 1);
  } else if (periodIndex !== -1 && periodIndex < minLength) {
    // Period is too early, look for next period
    const nextPeriod = text.indexOf('.', periodIndex + 1);
    if (nextPeriod !== -1) {
      return text.substring(0, nextPeriod + 1);
    }
  }
  
  // No suitable period found, truncate at reasonable length
  return text.length > 100 ? text.substring(0, 97) + '...' : text;
};

// Main function to create the complete PDF
export async function createIpoOnePagerPdf(data) {
  const pdfDoc = await PDFDocument.create();
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const currentPage = pdfDoc.addPage([595, 842]); // A4 size
  const margin = 25;
  const pageWidth = 595;
  const pageHeight = 842;
  const contentWidth = pageWidth - (margin * 2);

  // Professional Color Palette
  const colors = {
    primary: rgb(0.05, 0.24, 0.42),
    secondary: rgb(0.58, 0.7, 0.86),
    text: rgb(0.1, 0.1, 0.1),
    lightText: rgb(0.4, 0.4, 0.4),
    white: rgb(1, 1, 1),
    lightBg: rgb(0.97, 0.98, 1),
    border: rgb(0.8, 0.8, 0.8)
  };

  // Typography Scale
  const typography = {
    h1: { size: 22, font: helveticaBold, color: colors.primary },
    h2: { size: 16, font: helveticaBold, color: colors.primary },
    h3: { size: 12, font: helveticaBold, color: colors.primary },
    sectionHeader: { size: 11, font: helveticaBold, color: colors.white },
    body: { size: 9, font: helvetica, color: colors.text },
    small: { size: 8, font: helvetica, color: colors.text },
    caption: { size: 7, font: helvetica, color: colors.lightText }
  };

  // Layout Grid System
  const layout = {
    columns: {
      single: contentWidth,
      half: (contentWidth - 15) / 2,
    },
    spacing: {
      section: 20,
      subsection: 15,
      paragraph: 8,
      line: 3
    }
  };

  // Helper function to draw section header
  const drawSectionHeader = (title, x, y, width, height = 16) => {
    currentPage.drawRectangle({
      x: x,
      y: y - 2,
      width: width,
      height: height,
      color: colors.secondary
    });
    
    currentPage.drawRectangle({
      x: x,
      y: y - 2,
      width: width,
      height: height,
      borderColor: colors.border,
      borderWidth: 0.5
    });
    
    currentPage.drawText(title.toUpperCase(), {
      x: x + 8,
      y: y + 2,
      size: typography.sectionHeader.size,
      font: typography.sectionHeader.font,
      color: colors.primary
    });
    
    return y - height - 5;
  };

  // Enhanced text wrapping with strict width control
  const drawStyledText = (text, x, y, width, style, maxLines = 8) => {
    if (!text) return y;
    
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const textWidth = style.font.widthOfTextAtSize(testLine, style.size);
      
      if (textWidth <= width - 5) {
        currentLine = testLine;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
      
      if (lines.length >= maxLines) break;
    }
    if (currentLine && lines.length < maxLines) lines.push(currentLine);
    
    const displayLines = lines.slice(0, maxLines);
    if (lines.length > maxLines) {
      displayLines[maxLines - 1] = displayLines[maxLines - 1] + '...';
    }
    
    let currentY = y;
    displayLines.forEach(line => {
      currentPage.drawText(line, {
        x: x,
        y: currentY,
        size: style.size,
        font: style.font,
        color: style.color
      });
      currentY -= style.size + layout.spacing.line;
    });
    
    return currentY - layout.spacing.paragraph;
  };

  const hasValidContent = (content) => {
    if (!content) return false;
    const cleaned = content.toString().trim().toLowerCase();
    return cleaned.length > 0 && 
           !['no business overview provided.', 'no industry overview provided.', 
             'no fund utilization data provided.', 'not provided', 'n/a'].includes(cleaned);
  };

  // Start building the PDF
  let currentY = pageHeight - 40;

  // 1. COMPANY HEADER
  const companyName = data.companyInfo?.companyName || 'COMPANY NAME';
  
  currentPage.drawText(companyName.toUpperCase(), {
    x: margin,
    y: currentY,
    size: typography.h1.size,
    font: typography.h1.font,
    color: typography.h1.color
  });
  
  currentY -= 35;

  // 2. FUNDING INFO
  const fundingType = getFundingTypeDisplay(data.loanRequest?.loanType);
  const specificPurpose = getSpecificPurposeDisplay(data.loanRequest?.loanType, data.loanRequest?.loanPurpose);
  
  const fundingBoxWidth = layout.columns.half - 10;
  
  // Left box
  currentPage.drawRectangle({
    x: margin,
    y: currentY - 22,
    width: fundingBoxWidth,
    height: 20,
    color: colors.lightBg,
    borderColor: colors.border,
    borderWidth: 0.5
  });
  
  currentPage.drawText(fundingType, {
    x: margin + 8,
    y: currentY - 15,
    size: typography.h3.size,
    font: typography.h3.font,
    color: typography.h3.color
  });

  // Right box
  if (specificPurpose && specificPurpose !== 'N/A') {
    currentPage.drawRectangle({
      x: margin + fundingBoxWidth + 15,
      y: currentY - 22,
      width: fundingBoxWidth,
      height: 20,
      color: colors.lightBg,
      borderColor: colors.border,
      borderWidth: 0.5
    });
    
    currentPage.drawText(specificPurpose, {
      x: margin + fundingBoxWidth + 23,
      y: currentY - 15,
      size: typography.h3.size,
      font: typography.h3.font,
      color: typography.h3.color
    });
  }

  currentY -= 45;

  // 3. BUSINESS OVERVIEW
  if (hasValidContent(data.businessOverview?.businessOverview)) {
    currentY = drawSectionHeader('Business Overview', margin, currentY, contentWidth);
    currentY = drawStyledText(
      data.businessOverview.businessOverview, 
      margin + 8, 
      currentY, 
      contentWidth - 16, 
      typography.body, 
      4
    );
    currentY -= layout.spacing.section;
  }

  // 4. PRODUCT OFFERINGS + REVENUE STREAMS
  const leftColumnX = margin;
  const rightColumnX = margin + layout.columns.half + 15;
  let leftY = currentY;
  let rightY = currentY;

  // Left - Product Offerings (no captions)
  if (data.businessOverview?.productOffering?.images?.length > 0) {
    leftY = drawSectionHeader('Product Offerings', leftColumnX, leftY, layout.columns.half);
    
    const images = data.businessOverview.productOffering.images.slice(0, 3);
    const imageSize = 50;
    const totalImageWidth = layout.columns.half - 16;
    
    let imagePositions = [];
    
    if (images.length === 1) {
      imagePositions = [
        { x: leftColumnX + 8 + (totalImageWidth - imageSize) / 2, y: leftY }
      ];
    } else if (images.length === 2) {
      const spacing = (totalImageWidth - (2 * imageSize)) / 3;
      imagePositions = [
        { x: leftColumnX + 8 + spacing, y: leftY },
        { x: leftColumnX + 8 + spacing + imageSize + spacing, y: leftY }
      ];
    } else if (images.length >= 3) {
      const topSpacing = (totalImageWidth - (2 * imageSize)) / 3;
      imagePositions = [
        { x: leftColumnX + 8 + topSpacing, y: leftY },
        { x: leftColumnX + 8 + topSpacing + imageSize + topSpacing, y: leftY },
        { x: leftColumnX + 8 + (totalImageWidth - imageSize) / 2, y: leftY - imageSize - 10 }
      ];
    }
    
    for (let i = 0; i < images.length && i < 3; i++) {
      const imageData = images[i];
      const pos = imagePositions[i];
      
      try {
        if (!imageData.data) continue;
        
        const base64Data = imageData.data.replace(/^data:image\/[a-z]+;base64,/, '');
        const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        
        let image;
        const mimeType = imageData.mimetype || 'image/jpeg';
        
        if (mimeType.includes('png')) {
          image = await pdfDoc.embedPng(imageBytes);
        } else {
          image = await pdfDoc.embedJpg(imageBytes);
        }
        
        const framePadding = 1;
        currentPage.drawRectangle({
          x: pos.x - framePadding,
          y: pos.y - imageSize - framePadding,
          width: imageSize + (framePadding * 2),
          height: imageSize + (framePadding * 2),
          color: colors.white,
          borderColor: colors.border,
          borderWidth: 1
        });
        
        const scaleFactor = Math.min(imageSize / image.width, imageSize / image.height);
        const scaledWidth = image.width * scaleFactor;
        const scaledHeight = image.height * scaleFactor;
        const centerX = pos.x + (imageSize - scaledWidth) / 2;
        const centerY = pos.y - (imageSize - scaledHeight) / 2;
        
        currentPage.drawImage(image, {
          x: centerX,
          y: centerY - scaledHeight,
          width: scaledWidth,
          height: scaledHeight
        });
        
      } catch (error) {
        console.warn('Failed to embed image:', error);
        
        currentPage.drawRectangle({
          x: pos.x,
          y: pos.y - imageSize,
          width: imageSize,
          height: imageSize,
          color: colors.lightBg,
          borderColor: colors.border,
          borderWidth: 1
        });
      }
    }
    
    leftY -= images.length > 2 ? (imageSize * 2) + 20 : imageSize + 15;
  }

  // Right - Revenue Streams with IMPROVED sentence handling
  if (data.businessOverview?.revenueStreams) {
    rightY = drawSectionHeader('Revenue Streams', rightColumnX, rightY, layout.columns.half);
    
    let revenueStreamsData;
    if (typeof data.businessOverview.revenueStreams === 'string') {
      try {
        revenueStreamsData = JSON.parse(data.businessOverview.revenueStreams);
      } catch (e) {
        revenueStreamsData = { fy2024: data.businessOverview.revenueStreams };
      }
    } else {
      revenueStreamsData = data.businessOverview.revenueStreams;
    }

    if (revenueStreamsData) {
      const maxRevenueWidth = layout.columns.half - 20;
      
      Object.entries(revenueStreamsData).forEach(([year, value], index) => {
        if (hasValidContent(value) && index < 4) {
          const yearLabel = year.replace('fy', 'FY ').replace('FY2024', 'FY 2024').replace('FY2023', 'FY 2023').replace('FY2022', 'FY 2022');
          
          // ✅ IMPROVED: Keep complete sentences instead of hard truncation
          const processedValue = smartTruncateToSentence(value);
          
          currentPage.drawCircle({
            x: rightColumnX + 12,
            y: rightY - 4,
            size: 2,
            color: colors.primary
          });
          
          // Draw the year label first
          currentPage.drawText(`${yearLabel}: `, {
            x: rightColumnX + 20,
            y: rightY - 7,
            size: typography.small.size,
            font: typography.small.font,
            color: typography.small.color
          });
          
          // Calculate width for the year label to position value text
          const yearWidth = typography.small.font.widthOfTextAtSize(`${yearLabel}: `, typography.small.size);
          
          // Draw the value text with proper wrapping
          const valueWidth = maxRevenueWidth - yearWidth - 20;
          const valueLines = [];
          const words = processedValue.split(' ');
          let currentLine = '';
          
          for (const word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const testWidth = typography.small.font.widthOfTextAtSize(testLine, typography.small.size);
            
            if (testWidth <= valueWidth) {
              currentLine = testLine;
            } else {
              if (currentLine) valueLines.push(currentLine);
              currentLine = word;
            }
          }
          if (currentLine) valueLines.push(currentLine);
          
          // Draw wrapped value lines
          let valueY = rightY - 7;
          valueLines.slice(0, 3).forEach((line, lineIndex) => { // Max 3 lines per item
            currentPage.drawText(line, {
              x: rightColumnX + 20 + (lineIndex === 0 ? yearWidth : 0),
              y: valueY,
              size: typography.small.size,
              font: typography.small.font,
              color: typography.small.color
            });
            valueY -= typography.small.size + 2;
          });
          
          rightY = valueY - 5;
        }
      });
    }
  }

  currentY = Math.min(leftY, rightY) - layout.spacing.section;

  // 5. INDUSTRY OVERVIEW
  if (hasValidContent(data.businessOverview?.industryOverview)) {
    currentY = drawSectionHeader('Industry Overview', margin, currentY, contentWidth);
    currentY = drawStyledText(
      data.businessOverview.industryOverview, 
      margin + 8, 
      currentY, 
      contentWidth - 16, 
      typography.body, 
      3
    );
    currentY -= layout.spacing.section;
  }

  // 6. FUND UTILIZATION
  if (hasValidContent(data.businessOverview?.fundUtilization)) {
    currentY = drawSectionHeader('Fund Utilization', margin, currentY, contentWidth);
    currentY = drawStyledText(
      data.businessOverview.fundUtilization, 
      margin + 8, 
      currentY, 
      contentWidth - 16, 
      typography.body, 
      3
    );
    currentY -= layout.spacing.section;
  }

  // 7. FINANCIAL + INCOME STATEMENT
  leftY = currentY;
  rightY = currentY;

  // Left - Financial Highlights
  if (data.businessOverview?.financialHighlights) {
    leftY = drawSectionHeader('Financial Highlights', leftColumnX, leftY, layout.columns.half);
    leftY -= 10;
    
    const periods = ['FY 22', 'FY 23', 'FY 24'];
    const metrics = [
      { key: 'revenue', label: 'Revenue' },
      { key: 'ebitda', label: 'EBITDA' },
      { key: 'pat', label: 'PAT' }
    ];

    let tableY = leftY;
    
    // Headers
    currentPage.drawText('Particulars', { x: leftColumnX + 8, y: tableY, size: typography.caption.size, font: helveticaBold });
    periods.forEach((period, index) => {
      currentPage.drawText(period, { 
        x: leftColumnX + 80 + (index * 35), 
        y: tableY, 
        size: typography.caption.size, 
        font: helveticaBold 
      });
    });
    
    tableY -= 12;
    
    metrics.forEach(metric => {
      currentPage.drawText(metric.label, { 
        x: leftColumnX + 8, 
        y: tableY, 
        size: typography.caption.size, 
        font: helvetica 
      });
      
      const keys = ['fy22', 'fy23', 'fy24'];
      keys.forEach((key, index) => {
        let value = data.businessOverview.financialHighlights[metric.key]?.[key];
        if (value !== undefined && value !== null) {
          value = value.toString();
        } else {
          value = '-';
        }
        
        currentPage.drawText(sanitizeTextForPdf(value), { 
          x: leftColumnX + 80 + (index * 35), 
          y: tableY, 
          size: typography.caption.size, 
          font: helvetica 
        });
      });
      
      tableY -= 10;
    });
    
    leftY = tableY - 15;
  }

  // Right - Income Statement
  if (data.businessOverview?.financialHighlights) {
    rightY = drawSectionHeader('Snapshot of Income Statement', rightColumnX, rightY, layout.columns.half);
    rightY -= 10;
    
    const incomeItems = [
      ['Item', 'Value (Cr)'],
      ['Total Revenue', data.businessOverview.financialHighlights.revenue?.fy24 || '-'],
      ['Total EBITDA', data.businessOverview.financialHighlights.ebitda?.fy24 || '-'],
      ['Net PAT', data.businessOverview.financialHighlights.pat?.fy24 || '-']
    ];

    let incomeY = rightY;
    
    incomeItems.forEach((row, rowIndex) => {
      let cellX = rightColumnX + 8;
      row.forEach((cell, colIndex) => {
        const isHeader = rowIndex === 0;
        currentPage.drawText(sanitizeTextForPdf(cell.toString()), {
          x: cellX,
          y: incomeY,
          size: typography.caption.size,
          font: isHeader ? helveticaBold : helvetica,
          color: colors.text
        });
        cellX += colIndex === 0 ? 80 : 60;
      });
      incomeY -= 12;
    });
    
    rightY = incomeY - 15;
  }

  currentY = Math.min(leftY, rightY) - layout.spacing.section;

  // 8. PROMOTERS + RISK FACTORS
  leftY = currentY;
  rightY = currentY;

  if (hasValidContent(data.businessOverview?.aboutPromoters)) {
    leftY = drawSectionHeader('About the Promoters', leftColumnX, leftY, layout.columns.half);
    leftY = drawStyledText(
      data.businessOverview.aboutPromoters, 
      leftColumnX + 8, 
      leftY, 
      layout.columns.half - 16, 
      typography.body, 
      4
    );
  }

  if (hasValidContent(data.businessOverview?.riskFactors)) {
    rightY = drawSectionHeader('Risk Factors', rightColumnX, rightY, layout.columns.half);
    rightY = drawStyledText(
      data.businessOverview.riskFactors, 
      rightColumnX + 8, 
      rightY, 
      layout.columns.half - 16, 
      typography.body, 
      4
    );
  }

  currentY = Math.min(leftY, rightY) - layout.spacing.section;

  // 9. PEER ANALYSIS
  if (data.businessOverview?.peerAnalysis?.companyNames && currentY > 80) {
    currentY = drawSectionHeader('Peer Analysis', margin, currentY, contentWidth);
    currentY -= 10;
    
    const peerData = data.businessOverview.peerAnalysis;
    const validPeers = peerData.companyNames
      .map((name, index) => ({
        name: name || 'N/A',
        revenue: peerData.revenue?.[index] || 'N/A',
        basicEps: peerData.basicEps?.[index] || 'N/A'
      }))
      .filter(peer => peer.name && peer.name !== 'N/A' && peer.name.trim() !== '')
      .slice(0, 4);

    if (validPeers.length > 0) {
      let peerY = currentY;
      
      // Headers
      currentPage.drawText('Company', { x: margin + 8, y: peerY, size: typography.body.size, font: helveticaBold });
      currentPage.drawText('Revenue (Rs. Cr)', { x: margin + 150, y: peerY, size: typography.body.size, font: helveticaBold });
      currentPage.drawText('Basic EPS (Rs.)', { x: margin + 300, y: peerY, size: typography.body.size, font: helveticaBold });
      
      peerY -= 15;
      
      validPeers.forEach(peer => {
        currentPage.drawText(peer.name.substring(0, 18), { x: margin + 8, y: peerY, size: typography.small.size, font: helvetica });
        currentPage.drawText(peer.revenue.toString(), { x: margin + 150, y: peerY, size: typography.small.size, font: helvetica });
        currentPage.drawText(peer.basicEps.toString(), { x: margin + 300, y: peerY, size: typography.small.size, font: helvetica });
        peerY -= 12;
      });
    }
  }

  return await pdfDoc.save();
}

// Helper functions
function getFundingTypeDisplay(type) {
  const types = {
    'ipo': 'IPO',
    'startup': 'Startup',
    'private_equity': 'Private Equity',
    'bank': 'Bank',
    'bridge_finance': 'Bridge Finance/Private Funding',
    'npa_funding': 'NPA Funding',
    'government_grant': 'Government Grant'
  };
  return types[type] || type || 'N/A';
}

function getSpecificPurposeDisplay(fundingType, purpose) {
  const purposeMap = {
    ipo: {
      'main_board_ipo': 'Main Board IPO',
      'sme_ipo': 'SME IPO',
      'pre_ipo': 'Pre-IPO'
    },
    startup: {
      'pre_seed': 'Pre-seed',
      'seed': 'Seed',
      'vc': 'VC',
      'angel_investor': 'Angel Investor',
      'series_a_e': 'Series A-B-C-D-E'
    },
    bank: {
      'machine_loan': 'Machine Loan',
      'term_loan': 'Term Loan',
      'cc_od_working_capital': 'CC/OD/Working Capital',
      'construction_real_estate': 'Construction / Real Estate Fund'
    },
    npa_funding: {
      'npa_finance': 'NPA Finance',
      'nclt_finance': 'NCLT Finance',
      'ots_finance': 'OTS Finance'
    }
  };

  if (purpose === 'na') return 'N/A';
  return purposeMap[fundingType]?.[purpose] || 'N/A';
}

export { getFundingTypeDisplay, getSpecificPurposeDisplay };
