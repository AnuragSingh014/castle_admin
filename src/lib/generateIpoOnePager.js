import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// Helper function to sanitize text for PDF
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
  
  let currentPage = pdfDoc.addPage([595, 842]);
  let yPosition = 800;
  const margin = 50;
  const pageWidth = 595;
  const contentWidth = pageWidth - (margin * 2);

  // Helper functions
  const checkNewPage = (requiredSpace = 50) => {
    if (yPosition < requiredSpace) {
      currentPage = pdfDoc.addPage([595, 842]);
      yPosition = 800;
    }
  };

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
    yPosition -= 5;
  };

  const hasValidContent = (content) => {
    if (!content) return false;
    if (typeof content === 'string') {
      const cleaned = content.trim().toLowerCase();
      return cleaned.length > 0 && 
             cleaned !== 'no business overview provided.' &&
             cleaned !== 'no industry overview provided.' &&
             cleaned !== 'no fund utilization data provided.' &&
             cleaned !== 'not provided' &&
             cleaned !== 'n/a';
    }
    return true;
  };

  // HEADER SECTION
  const companyName = data.companyInfo?.companyName || 'COMPANY NAME';
  const fundingType = getFundingTypeDisplay(data.loanRequest?.loanType);
  const specificPurpose = getSpecificPurposeDisplay(data.loanRequest?.loanType, data.loanRequest?.loanPurpose);
  
  // Company name as main title
  currentPage.drawText(companyName, {
    x: margin,
    y: yPosition,
    size: 24,
    font: helveticaBold,
    color: rgb(0, 0.4, 0)
  });
  
  yPosition -= 35;
  
  // Funding type
  currentPage.drawText(fundingType, {
    x: margin,
    y: yPosition,
    size: 16,
    font: timesRomanBold,
    color: rgb(0.2, 0.2, 0.2)
  });
  
  yPosition -= 25;
  
  // Specific purpose
  if (specificPurpose && specificPurpose !== 'N/A' && specificPurpose !== 'na') {
    currentPage.drawText(specificPurpose, {
      x: margin,
      y: yPosition,
      size: 14,
      font: timesRoman,
      color: rgb(0.4, 0.4, 0.4)
    });
    yPosition -= 25;
  }

  yPosition -= 30;

  // BUSINESS OVERVIEW
  if (hasValidContent(data.businessOverview?.businessOverview)) {
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

  // ✅ PRODUCT OFFERINGS SECTION (Add images first, before other sections)
  if (data.businessOverview?.productOffering?.images?.length > 0) {
    checkNewPage(300);
    addText('PRODUCT OFFERINGS', { 
      font: helveticaBold, 
      size: 14, 
      color: rgb(0, 0.2, 0.4) 
    });
    yPosition -= 20;

    // Display images in a grid layout
    let imagesPerRow = 2;
    let imageWidth = (contentWidth - 20) / imagesPerRow; // 20px spacing between images
    let imageHeight = 100;
    let currentImageX = margin;
    let imagesInCurrentRow = 0;
    let maxHeightInRow = 0;

    for (let i = 0; i < data.businessOverview.productOffering.images.length; i++) {
      const imageData = data.businessOverview.productOffering.images[i];
      
      try {
        if (!imageData.data) continue;
        
        checkNewPage(imageHeight + 50);
        
        // Remove data URL prefix and decode base64
        const base64Data = imageData.data.replace(/^data:image\/[a-z]+;base64,/, '');
        const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        
        let image;
        const mimeType = imageData.mimetype || 'image/jpeg';
        
        if (mimeType.includes('png')) {
          image = await pdfDoc.embedPng(imageBytes);
        } else {
          image = await pdfDoc.embedJpg(imageBytes);
        }
        
        // Calculate scaled dimensions
        const maxImageWidth = imageWidth - 10;
        const maxImageHeight = imageHeight;
        const scaleFactor = Math.min(
          maxImageWidth / image.width,
          maxImageHeight / image.height
        );
        const scaledWidth = image.width * scaleFactor;
        const scaledHeight = image.height * scaleFactor;
        
        // Position image
        currentPage.drawImage(image, {
          x: currentImageX,
          y: yPosition - scaledHeight,
          width: scaledWidth,
          height: scaledHeight
        });
        
        // Add image label
        const labelY = yPosition - scaledHeight - 15;
        currentPage.drawText(imageData.originalName || imageData.filename || `Product ${i + 1}`, {
          x: currentImageX,
          y: labelY,
          size: 8,
          font: helvetica,
          color: rgb(0.5, 0.5, 0.5)
        });
        
        maxHeightInRow = Math.max(maxHeightInRow, scaledHeight + 25);
        imagesInCurrentRow++;
        
        // Move to next position
        if (imagesInCurrentRow < imagesPerRow && i < data.businessOverview.productOffering.images.length - 1) {
          currentImageX += imageWidth;
        } else {
          // Move to next row
          yPosition -= maxHeightInRow;
          currentImageX = margin;
          imagesInCurrentRow = 0;
          maxHeightInRow = 0;
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
    
    yPosition -= 20;
  }

  // REVENUE STREAMS
  if (data.businessOverview?.revenueStreams) {
    let revenueStreamsData;
    
    if (typeof data.businessOverview.revenueStreams === 'object') {
      revenueStreamsData = data.businessOverview.revenueStreams;
    } else if (typeof data.businessOverview.revenueStreams === 'string') {
      try {
        const parsed = JSON.parse(data.businessOverview.revenueStreams);
        if (typeof parsed === 'object') {
          revenueStreamsData = parsed;
        }
      } catch (e) {
        revenueStreamsData = {
          fy2022: "",
          fy2023: "",
          fy2024: data.businessOverview.revenueStreams
        };
      }
    }

    const hasValidRevenueData = revenueStreamsData && (
      hasValidContent(revenueStreamsData.fy2024) ||
      hasValidContent(revenueStreamsData.fy2023) ||
      hasValidContent(revenueStreamsData.fy2022)
    );

    if (hasValidRevenueData) {
      checkNewPage(150);
      addText('REVENUE STREAMS', { 
        font: helveticaBold, 
        size: 14, 
        color: rgb(0, 0.2, 0.4) 
      });
      yPosition -= 15;

      if (hasValidContent(revenueStreamsData.fy2024)) {
        addText(`• FY 2024: ${revenueStreamsData.fy2024}`);
      }
      if (hasValidContent(revenueStreamsData.fy2023)) {
        addText(`• FY 2023: ${revenueStreamsData.fy2023}`);
      }
      if (hasValidContent(revenueStreamsData.fy2022)) {
        addText(`• FY 2022: ${revenueStreamsData.fy2022}`);
      }
      
      yPosition -= 20;
    }
  }

  // INDUSTRY OVERVIEW
  if (hasValidContent(data.businessOverview?.industryOverview)) {
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

  // FUND UTILIZATION
  if (hasValidContent(data.businessOverview?.fundUtilization)) {
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

  // ✅ FINANCIAL HIGHLIGHTS TABLE
  if (data.businessOverview?.financialHighlights) {
    checkNewPage(300);
    addText('FINANCIAL HIGHLIGHTS', { 
      font: helveticaBold, 
      size: 14, 
      color: rgb(0, 0.2, 0.4) 
    });
    yPosition -= 20;

    const periods = [
      { key: 'fy22', label: 'FY 2022' },
      { key: 'fy23', label: 'FY 2023' },
      { key: 'fy24', label: 'FY 2024' },
      { key: 'sept24', label: 'Sept 2024' }
    ];

    const metrics = [
      { key: 'revenue', label: 'Revenue', unit: '(Rs. Cr)' },
      { key: 'ebitda', label: 'EBITDA', unit: '(Rs. Cr)' },
      { key: 'pat', label: 'PAT', unit: '(Rs. Cr)' },
      { key: 'ebitdaMargin', label: 'EBITDA Margin', unit: '(%)' },
      { key: 'patMargin', label: 'PAT Margin', unit: '(%)' }
    ];

    // Table header
    let tableY = yPosition;
    currentPage.drawText('Particulars', { x: margin, y: tableY, size: 11, font: helveticaBold });
    periods.forEach((period, index) => {
      currentPage.drawText(period.label, { 
        x: margin + 130 + (index * 80), 
        y: tableY, 
        size: 11, 
        font: helveticaBold 
      });
    });
    
    tableY -= 25;
    
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
        let value = data.businessOverview.financialHighlights[metric.key]?.[period.key];
        if (value !== undefined && value !== null) {
          if (metric.key.includes('Margin')) {
            value = `${value}%`;
          }
        } else {
          value = '-';
        }
        
        value = sanitizeTextForPdf(value.toString());
        currentPage.drawText(value, { 
          x: margin + 130 + (index * 80), 
          y: tableY, 
          size: 10, 
          font: timesRoman 
        });
      });
      
      tableY -= 18;
    });

    yPosition = tableY - 20;
  }

  // ✅ ABOUT THE PROMOTERS
  if (hasValidContent(data.businessOverview?.aboutPromoters)) {
    checkNewPage(100);
    addText('ABOUT THE PROMOTERS', { 
      font: helveticaBold, 
      size: 14, 
      color: rgb(0, 0.2, 0.4) 
    });
    yPosition -= 10;
    addText(data.businessOverview.aboutPromoters);
    yPosition -= 20;
  }

  // ✅ RISK FACTORS
  if (hasValidContent(data.businessOverview?.riskFactors)) {
    checkNewPage(100);
    addText('RISK FACTORS', { 
      font: helveticaBold, 
      size: 14, 
      color: rgb(0, 0.2, 0.4) 
    });
    yPosition -= 10;
    addText(data.businessOverview.riskFactors);
    yPosition -= 20;
  }

  // ✅ PEER ANALYSIS TABLE - UPDATED TO SHOW ONLY COMPANY, REVENUE, BASIC EPS
  if (data.businessOverview?.peerAnalysis?.companyNames) {
    const peerData = data.businessOverview.peerAnalysis;
    
    checkNewPage(200);
    addText('PEER ANALYSIS', { 
      font: helveticaBold, 
      size: 14, 
      color: rgb(0, 0.2, 0.4) 
    });
    yPosition -= 15;

    // Filter valid peers and only extract company, revenue, basicEps
    const validPeers = peerData.companyNames
      .map((name, index) => ({
        name: name || 'N/A',
        revenue: peerData.revenue?.[index] || 'N/A',
        basicEps: peerData.basicEps?.[index] || 'N/A'  // ✅ Only using basicEps now
      }))
      .filter(peer => peer.name && peer.name !== 'N/A' && peer.name.trim() !== '');

    if (validPeers.length > 0) {
      let tableY = yPosition;
      // ✅ Updated headers to only show Company, Revenue, Basic EPS
      const headers = ['Company', 'Revenue (Rs. Cr)', 'Basic EPS (Rs.)'];
      const colWidths = [120, 120, 120]; // ✅ Adjusted column widths for 3 columns
      let xPos = margin;
      
      headers.forEach((header, index) => {
        currentPage.drawText(header, { x: xPos, y: tableY, size: 10, font: helveticaBold });
        xPos += colWidths[index];
      });
      
      tableY -= 20;
      
      validPeers.forEach(peer => {
        checkNewPage();
        xPos = margin;
        
        // ✅ Updated values to only include the 3 columns
        const values = [
          peer.name.substring(0, 15),
          peer.revenue.toString(),
          peer.basicEps.toString()
        ];
        
        values.forEach((value, index) => {
          currentPage.drawText(sanitizeTextForPdf(value), { 
            x: xPos, 
            y: tableY, 
            size: 9, 
            font: timesRoman 
          });
          xPos += colWidths[index];
        });
        tableY -= 15;
      });

      yPosition = tableY - 20;
    }
  }

  // ✅ IPO INTERMEDIARIES
  if (hasValidContent(data.businessOverview?.ipoIntermediaries)) {
    checkNewPage(100);
    addText('IPO INTERMEDIARIES', { 
      font: helveticaBold, 
      size: 14, 
      color: rgb(0, 0.2, 0.4) 
    });
    yPosition -= 10;
    addText(data.businessOverview.ipoIntermediaries);
    yPosition -= 20;
  }

  return await pdfDoc.save();
}

// Helper functions remain the same
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

export { getFundingTypeDisplay, getSpecificPurposeDisplay };
