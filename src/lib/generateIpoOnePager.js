import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// Helper function to sanitize text for PDF (replace rupee symbols)
const sanitizeTextForPdf = (text) => {
  if (!text) return text;
  return text.toString().replace(/₹/g, 'Rs.');
};

// Main function to create the complete PDF
export async function createIpoOnePagerPdf(data) {
  const pdfDoc = await PDFDocument.create();
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  let currentPage = pdfDoc.addPage([595, 842]); // A4 size
  let yPosition = 800;
  const margin = 50;
  const pageWidth = 595;
  const contentWidth = pageWidth - (margin * 2);

  // Helper function to add new page when needed
  const checkNewPage = (requiredSpace = 50) => {
    if (yPosition < requiredSpace) {
      currentPage = pdfDoc.addPage([595, 842]);
      yPosition = 800;
    }
  };

  // Helper function to wrap text
  const wrapText = (text, font, fontSize, maxWidth) => {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const width = font.widthOfTextAtSize(testLine, fontSize);
      
      if (width <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  // Helper function to add text with wrapping
  const addText = (text, options = {}) => {
    const {
      font = timesRoman,
      size = 11,
      color = rgb(0, 0, 0),
      lineHeight = size + 3,
      maxWidth = contentWidth,
      indent = 0
    } = options;

    if (!text) return;

    // ✅ SANITIZE TEXT TO REMOVE RUPEE SYMBOLS
    const sanitizedText = sanitizeTextForPdf(text);
    const lines = wrapText(sanitizedText, font, size, maxWidth - indent);
    
    for (const line of lines) {
      checkNewPage();
      currentPage.drawText(line, {
        x: margin + indent,
        y: yPosition,
        size,
        font,
        color
      });
      yPosition -= lineHeight;
    }
    yPosition -= 5; // Extra spacing after text block
  };

  // Add header
  const companyName = data.companyInfo?.companyName || 'COMPANY NAME';
  const fundingType = getFundingTypeDisplay(data.loanRequest?.fundingType);
  const specificPurpose = getSpecificPurposeDisplay(data.loanRequest?.fundingType, data.loanRequest?.specificPurpose);
  
  // Main title
  currentPage.drawText('IPO ONE PAGER : DRAFT', {
    x: margin,
    y: yPosition,
    size: 18,
    font: helveticaBold,
    color: rgb(0, 0, 0.8)
  });
  
  // Funding type and purpose
  yPosition -= 25;
  currentPage.drawText(`${fundingType} - ${specificPurpose}`, {
    x: margin,
    y: yPosition,
    size: 14,
    font: timesRomanBold,
    color: rgb(0.2, 0.2, 0.2)
  });
  
  // Company name
  yPosition -= 25;
  currentPage.drawText(companyName, {
    x: margin,
    y: yPosition,
    size: 16,
    font: helveticaBold,
    color: rgb(0, 0.4, 0)
  });

  yPosition -= 40;

  // Add Business Overview
  if (data.businessOverview?.businessOverview) {
    checkNewPage(100);
    addText('BUSINESS OVERVIEW', { 
      font: helveticaBold, 
      size: 14, 
      color: rgb(0, 0.2, 0.4) 
    });
    yPosition -= 10;
    addText(data.businessOverview.businessOverview);
    yPosition -= 20;
  }

  // Add Revenue Streams
  if (data.businessOverview?.revenueStreams) {
    checkNewPage(150);
    addText('REVENUE STREAMS', { 
      font: helveticaBold, 
      size: 14, 
      color: rgb(0, 0.2, 0.4) 
    });
    yPosition -= 15;

    if (typeof data.businessOverview.revenueStreams === 'object') {
      Object.entries(data.businessOverview.revenueStreams).forEach(([year, value]) => {
        if (value && value.toString().trim()) {
          addText(`${year.toUpperCase()}: ${value}`);
        }
      });
    } else if (typeof data.businessOverview.revenueStreams === 'string') {
      addText(data.businessOverview.revenueStreams);
    }
    yPosition -= 20;
  }

  // Add Industry Overview
  if (data.businessOverview?.industryOverview) {
    checkNewPage(100);
    addText('INDUSTRY OVERVIEW', { 
      font: helveticaBold, 
      size: 14, 
      color: rgb(0, 0.2, 0.4) 
    });
    yPosition -= 10;
    addText(data.businessOverview.industryOverview);
    yPosition -= 20;
  }

  // Add Fund Utilization
  if (data.businessOverview?.fundUtilization) {
    checkNewPage(100);
    addText('FUND UTILIZATION', { 
      font: helveticaBold, 
      size: 14, 
      color: rgb(0, 0.2, 0.4) 
    });
    yPosition -= 10;
    addText(data.businessOverview.fundUtilization);
    yPosition -= 20;
  }

  // Add Financial Highlights
  if (data.businessOverview?.financialHighlights) {
    checkNewPage(200);
    addText('FINANCIAL HIGHLIGHTS', { 
      font: helveticaBold, 
      size: 14, 
      color: rgb(0, 0.2, 0.4) 
    });
    yPosition -= 15;

    const periods = [
      { key: 'fy2022', label: 'FY 2022' },
      { key: 'fy2023', label: 'FY 2023' },
      { key: 'fy2024', label: 'FY 2024' }
    ];

    // ✅ FIX: Replace rupee symbols in metric units
    const metrics = [
      { key: 'revenue', label: 'Revenue', unit: '(Rs. Cr)' },
      { key: 'ebitda', label: 'EBITDA', unit: '(Rs. Cr)' },
      { key: 'pat', label: 'PAT', unit: '(Rs. Cr)' },
      { key: 'eps', label: 'EPS', unit: '(Rs.)' }
    ];

    // Table header
    let tableY = yPosition;
    currentPage.drawText('Particulars', { x: margin, y: tableY, size: 10, font: helveticaBold });
    periods.forEach((period, index) => {
      currentPage.drawText(period.label, { 
        x: margin + 150 + (index * 80), 
        y: tableY, 
        size: 10, 
        font: helveticaBold 
      });
    });
    
    tableY -= 20;
    
    // Table rows
    metrics.forEach(metric => {
      checkNewPage();
      currentPage.drawText(`${metric.label} ${metric.unit}`, { 
        x: margin, 
        y: tableY, 
        size: 10, 
        font: timesRoman 
      });
      
      periods.forEach((period, index) => {
        let value = data.businessOverview.financialHighlights[metric.key]?.[period.key] || '-';
        // ✅ SANITIZE VALUE TO REMOVE RUPEE SYMBOLS
        value = sanitizeTextForPdf(value.toString());
        currentPage.drawText(value, { 
          x: margin + 150 + (index * 80), 
          y: tableY, 
          size: 10, 
          font: timesRoman 
        });
      });
      
      tableY -= 15;
    });

    yPosition = tableY - 20;
  }

  // Add Peer Analysis
  if (data.businessOverview?.peerAnalysis?.companyNames) {
    const peerData = data.businessOverview.peerAnalysis;
    
    checkNewPage(200);
    addText('PEER ANALYSIS', { 
      font: helveticaBold, 
      size: 14, 
      color: rgb(0, 0.2, 0.4) 
    });
    yPosition -= 15;

    // Filter valid peers
    const validPeers = peerData.companyNames
      .map((name, index) => ({
        name: name || 'N/A',
        revenue: peerData.revenue?.[index] || 'N/A',
        ebitda: peerData.ebitda?.[index] || 'N/A',
        pat: peerData.pat?.[index] || 'N/A',
        roe: peerData.roe?.[index] || 'N/A'
      }))
      .filter(peer => peer.name !== 'N/A' || 
        peer.revenue !== 'N/A' || 
        peer.ebitda !== 'N/A' || 
        peer.pat !== 'N/A');

    if (validPeers.length > 0) {
      // Table header
      let tableY = yPosition;
      currentPage.drawText('Company', { x: margin, y: tableY, size: 9, font: helveticaBold });
      currentPage.drawText('Revenue', { x: margin + 120, y: tableY, size: 9, font: helveticaBold });
      currentPage.drawText('EBITDA', { x: margin + 180, y: tableY, size: 9, font: helveticaBold });
      currentPage.drawText('PAT', { x: margin + 240, y: tableY, size: 9, font: helveticaBold });
      currentPage.drawText('ROE', { x: margin + 300, y: tableY, size: 9, font: helveticaBold });
      
      tableY -= 15;
      
      validPeers.forEach(peer => {
        checkNewPage();
        // ✅ SANITIZE ALL PEER DATA
        currentPage.drawText(sanitizeTextForPdf(peer.name.toString().substring(0, 15)), { x: margin, y: tableY, size: 8, font: timesRoman });
        currentPage.drawText(sanitizeTextForPdf(peer.revenue.toString()), { x: margin + 120, y: tableY, size: 8, font: timesRoman });
        currentPage.drawText(sanitizeTextForPdf(peer.ebitda.toString()), { x: margin + 180, y: tableY, size: 8, font: timesRoman });
        currentPage.drawText(sanitizeTextForPdf(peer.pat.toString()), { x: margin + 240, y: tableY, size: 8, font: timesRoman });
        currentPage.drawText(sanitizeTextForPdf(peer.roe.toString()), { x: margin + 300, y: tableY, size: 8, font: timesRoman });
        tableY -= 12;
      });

      yPosition = tableY - 20;
    }
  }

  // Add Product Offering Images
  if (data.businessOverview?.productOffering?.images?.length > 0) {
    checkNewPage(300);
    addText('PRODUCT OFFERING', { 
      font: helveticaBold, 
      size: 14, 
      color: rgb(0, 0.2, 0.4) 
    });
    yPosition -= 20;

    for (const imageData of data.businessOverview.productOffering.images) {
      try {
        checkNewPage(200);
        
        const imageUrl = imageData.url || imageData.path || imageData;
        const imageResponse = await fetch(imageUrl);
        const imageBytes = await imageResponse.arrayBuffer();
        
        let image;
        if (imageUrl.toLowerCase().includes('.png')) {
          image = await pdfDoc.embedPng(imageBytes);
        } else {
          image = await pdfDoc.embedJpg(imageBytes);
        }
        
        const maxWidth = 400;
        const maxHeight = 200;
        const { width, height } = image.scale(
          Math.min(maxWidth / image.width, maxHeight / image.height)
        );
        
        currentPage.drawImage(image, {
          x: margin + (contentWidth - width) / 2,
          y: yPosition - height,
          width,
          height
        });
        
        yPosition -= height + 20;
        
        if (imageData.originalName || imageData.filename) {
          addText(imageData.originalName || imageData.filename, {
            font: helvetica,
            size: 9,
            color: rgb(0.5, 0.5, 0.5)
          });
        }
        
      } catch (error) {
        console.warn('Failed to embed image:', error);
        addText(`[Image: ${imageData.originalName || 'Product Image'}]`, {
          color: rgb(0.7, 0.7, 0.7),
          font: helvetica,
          size: 10
        });
      }
    }
  }

  return await pdfDoc.save();
}

// Helper functions for display formatting (unchanged)
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
  return purposeMap[fundingType]?.[purpose] || purpose || 'N/A';
}

// Export only the main function and helpers - no duplicates
export { getFundingTypeDisplay, getSpecificPurposeDisplay };
