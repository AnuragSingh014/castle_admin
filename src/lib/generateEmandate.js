import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// Helper function to wrap text using font metrics
function wrapTextByWidth(text, font, fontSize, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  words.forEach(word => {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const textWidth = font.widthOfTextAtSize(testLine, fontSize);
    
    if (textWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  });

  if (currentLine) lines.push(currentLine);
  return lines;
}

// Helper function to safely get text values
function safeText(value, fallback = '') {
  return (typeof value === 'string' && value.trim().length > 0) ? value.trim() : fallback;
}

// Helper function to embed image
async function embedImageSafely(pdfDoc, base64Data) {
  if (!base64Data) return null;
  
  try {
    // pdf-lib can often detect the image type, but we can give it hints
    if (base64Data.startsWith('iVBORw0')) {
      return await pdfDoc.embedPng(base64Data);
    } else {
      return await pdfDoc.embedJpg(base64Data);
    }
  } catch (error) {
    // Fallback attempt
    try {
      return await pdfDoc.embedPng(base64Data);
    } catch (pngError) {
      console.error('Failed to embed image:', error, pngError);
      return null;
    }
  }
}

export async function generateEmandatePDF(data) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let currentPage = pdfDoc.addPage([595, 842]); // A4 size
  
  const pageWidth = 595;
  const marginLeft = 40;
  const marginRight = 40;
  const contentWidth = pageWidth - marginLeft - marginRight;
  let yPosition = 800;
  const lineHeight = 13;

  // Helper function to add text and handle pagination
  const addText = (text, options = {}) => {
    const { bold = false, size = 10, spacing = 1, indent = 0 } = options;
    const textFont = bold ? boldFont : font;
    const currentContentWidth = contentWidth - indent;
    
    // Check for new page before adding any lines
    if (yPosition < 50) {
      currentPage = pdfDoc.addPage([595, 842]);
      yPosition = 800;
    }

    const lines = wrapTextByWidth(text, textFont, size, currentContentWidth);
    
    lines.forEach(line => {
      // Check for new page for each line
      if (yPosition < 50) {
        currentPage = pdfDoc.addPage([595, 842]);
        yPosition = 800;
      }

      currentPage.drawText(line, {
        x: marginLeft + indent,
        y: yPosition,
        size: size,
        font: textFont,
        color: rgb(0, 0, 0),
        maxWidth: currentContentWidth,
      });
      
      yPosition -= lineHeight * spacing;
    });
    
    yPosition -= lineHeight * 0.3; // Small gap after each block
  };

  // --- PDF CONTENT STARTS HERE ---

  // Extract data with fallbacks
  const companyName = safeText(data.companyName, 'Company');
  const companyAddress = safeText(data.companyAddress, 'Address');
  const founderName = safeText(data.founderName, 'Founder Name');
  const founderTitle = safeText(data.founderTitle, 'Founder');
  
  const signatureDate = data.signatureUploadDate 
    ? new Date(data.signatureUploadDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

  // Header with company name (left) and date (right)
  currentPage.drawText(`"${companyName}"`, {
    x: marginLeft,
    y: yPosition,
    size: 14,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  const dateWidth = font.widthOfTextAtSize(signatureDate, 12);
  currentPage.drawText(signatureDate, {
    x: pageWidth - marginRight - dateWidth,
    y: yPosition,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
  });
  yPosition -= 20;

  // Company address
  currentPage.drawText(companyAddress, {
    x: marginLeft,
    y: yPosition,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
  });
  yPosition -= 30;

  // Attention line
  currentPage.drawText(`Attention: "${founderName}"`, {
    x: marginLeft,
    y: yPosition,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
  });
  yPosition -= 30;

  // Main agreement text
  addText(`This agreement (the "Agreement") is made and entered into by and between ${companyName} and A&A International, ("A&A International"). ${companyName} hereby engages A&A International as an independent contractor to solicit a Transaction. "Transactions" shall be defined as: a proposed offering and sale of Investments (as defined below).`);
  yPosition -= 10;

  // Section 1 - Services
  addText('1. Services.', { bold: true, size: 12 });
  addText(`A&A International will use its reasonable efforts to provide ${companyName} with certain services, which may include: (i) completing appropriate due diligence on ${companyName} and its principals; (ii) identifying prospective Investors and providing a teaser and/or investor presentation to those Investors; (iii) conducting a mock investor call with ${companyName} and sharing insights and suggestions with ${companyName} regarding positioning and marketing the opportunity to Investors in calls and meetings; (iv) assisting ${companyName} in connection with Investors throughout the entire process through closing; (v) reviewing and helping to prepare written material and forecasts prepared by ${companyName} such as the investor presentation, financial model, and final definitive documents; (vi) attempting to obtain executed NDAs between Investors and ${companyName} from interested Investors; (vii) setting-up, administrating, and assisting ${companyName} in populating the VDR on A&A International's VDR platform; (viii) working with ${companyName} to provide information, answer questions, and follow-up with Investors; (ix) including the Transaction on A&A International.com and CPGO (A&A International's proprietary app) for prospective investors to review; (x) providing paid and/or organic digital marketing outreach to prospective investors; (xi) providing ${companyName} with detailed information on CPGO regarding the status of each Investor currently interested in the Transaction, and allowing ${companyName} to communicate with Investors directly through CPGO; (xii) helping ${companyName} to structure the Transaction, negotiating with Investors, seeking proposals from Investors; (xiii) attempting to obtain term sheets from Investors; and (xiii) assisting in arranging and closing the Transaction.`);
  yPosition -= 15;

  // Section 2 - Exclusivity
  addText('2. Exclusivity.', { bold: true, size: 12 });
  addText(`This is an exclusive engagement. A&A International may decline to participate in the Transaction if it reasonably determines that the Transaction has become impractical or undesirable. Unless A&A International has notified ${companyName} in writing of its decision to terminate, ${companyName} will not allow any other party to participate in the Transaction without A&A International's prior written consent, so long as this Agreement has not been terminated by A&A International. ${companyName} may not terminate the Agreement.`);
  yPosition -= 10;
  addText('"Investors": potential and actual investors (including existing investors in the Company) or participants in a Transaction, regardless of whether A&A International, the Company, or a third party is the source of such investors or participants.');
  yPosition -= 15;

  // Section 3 - Indemnification, Fees and Expenses
  addText('3. Indemnification, Fees and Expenses.', { bold: true, size: 12 });
  addText(`Company and A&A International agree to the provisions regarding Company’s indemnity of A&A International and other matters set forth in Schedule II. Company agrees to the provisions for the payment of A&A International’s fees and other matters set forth in Schedule I.`);
  yPosition -= 15;

  // Section 4 - Term
  addText('4. Term.', { bold: true, size: 12 });
  addText(`Unless earlier terminated as herein provided, the term of this engagement shall begin on the date herein and end: i) twelve months (the "Term") from the date that the investor presentation is completed and sent to prospective investors; and ii) the Term will automatically be extended by six months if one or more Investors has commenced negotiation of a term sheet in connection with the Transaction (these time periods - both i and ii above - shall be the "Initial Term"). After the Initial Term has ended the Term will be extended on a month to month basis until either party terminates this Agreement upon thirty days' prior written notice to the other. ${companyName} will not directly or indirectly solicit an employee of A&A International to work for or with ${companyName} during the Term and until one year after the expiration of the Term.`);
  yPosition -= 15;

  // Section 5 - Additional Transactions
  addText('5. Additional Transactions.', { bold: true, size: 12 });
  addText(`If one or more Transactions close during the term or tail of this Agreement, and ${companyName} conducts an additional Transaction (other than the Transaction that closed) within 18 months from the later of the closing of the Transaction or any termination of the Agreement, then ${companyName} will offer to engage A&A International to act as the sole private agent, on the same terms as those contained in this Agreement.`);
  yPosition -= 15;

  // Section 6 - Tail
  addText('6. Tail.', { bold: true, size: 12 });
  addText(`${companyName} shall pay to A&A International pursuant to the same fee schedule contained herein with respect to any Transaction with an Investor which is consummated, or for which a definitive agreement has been signed, within 18 months after the later of the closing of the Transaction or any termination of the Agreement.`);
  yPosition -= 15;

  // Section 7 - Survival/Investments
  addText('7. Survival/Investments.', { bold: true, size: 12 });
  addText(`Provisions relating to the status of A&A International as an independent contractor, the limitation as to whom A&A International shall owe any duties, governing law, successors and assigns, the waiver of the right to trial by jury, Additional Transactions, the Tail, and other provisions herein that extend beyond the termination of this Agreement, shall survive any termination of this Agreement. "Investments": any transaction involving ${companyName}, including without limitation an equity or debt investment, management agreement, asset management structure, fund, consulting arrangement, merger, acquisition, loan, joint or strategic venture, asset or loan purchase or sale, securitization, one-off or special purpose vehicle transaction, digital security, partnership, fee agreement, licensing or servicing agreement.`);
  yPosition -= 15;

  // Section 8 - Entire Agreement
  addText('8. Entire Agreement.', { bold: true, size: 12 });
  addText(`This Agreement, and all schedules, annexes, or attachments hereto, and any rights, duties or obligations hereunder, constitutes the entire agreement of the parties, supersedes all prior written or oral and all contemporaneous oral agreements, understandings and negotiations with respect to the subject matter hereof, and shall inure to the benefit of and be binding upon the successors, assigns, and personal representatives of each of the parties hereto, and may not be waived, amended, modified or assigned, in any way, in whole or in part, including by operation of law, without prior written consent signed by each of the parties hereto. The provisions of this Agreement may not be explained, supplemented or qualified through evidence of industry standards, trade usage or a prior course of dealings.`);
  yPosition -= 15;

  // Section 9 - Severability; Execution; Representations
  addText('9. Severability; Execution; Representations.', { bold: true, size: 12 });
  addText(`In case any provision of this Agreement is found to be void, invalid, illegal or unenforceable by reason of law or public policy, all other remaining provisions of this Agreement shall, nevertheless, remain in full force and effect. This Agreement may be executed in several counterparts, each of which when executed and delivered shall be an original, but all of which together shall constitute one and the same instrument. Facsimile, PDF or electronic signatures shall be deemed original signatures and be binding. A&A International and ${companyName} hereby make the representations, warranties and agreements set forth in Schedule III.`);
  yPosition -= 15;

  // Section 10 - Choice of Law; Arbitration
  addText('10. Choice of Law; Arbitration.', { bold: true, size: 12 });
  addText(`This Agreement and any claim or dispute of any kind or nature whatsoever arising out of, or relating to, this Agreement or A&A International's engagement hereunder, directly or indirectly (including any claim concerning services provided pursuant to this Agreement), shall be governed by and construed in all respects, including as to validity, interpretation and effect, in accordance with the laws of the State of Delhi Jurisdiction without giving effect to the conflicts or choice of law provisions thereof. Any controversy or claim arising out of or relating to this Agreement, or the breach thereof, shall be adjudicated in accordance with the provisions set forth in Schedule IV.`);
  yPosition -= 15;

  // Section 11 - Schedules; Communications
  addText('11. Schedules; Communications.', { bold: true, size: 12 });
  addText(`All schedules to this Agreement shall be made a part hereof, are an integral part of this Agreement, and shall survive any termination or expiration of this Agreement. All communications hereunder shall be in writing e-mailed to the parties hereto as follows:`);
  yPosition -= 10;
  addText('If to A&A International email to: info@dnhfintech.com');
  yPosition -= 10;
  yPosition -= 10;
  addText(`We are pleased to accept this engagement and look forward to working with ${companyName}. Upon execution and delivery by both parties this shall constitute a binding agreement.`);
  yPosition -= 20;

  // Signature section
  addText('Very truly yours,');
  addText('A&A International,');
  yPosition -= 10;
  addText('By:');
  
  // Admin signature
  if (data.adminSignature) {
    const adminImg = await embedImageSafely(pdfDoc, data.adminSignature);
    if (adminImg) {
      if (yPosition < 80) {
        currentPage = pdfDoc.addPage([595, 842]);
        yPosition = 800;
      }
      const sigWidth = 120;
      const sigHeight = 40;
      currentPage.drawImage(adminImg, {
        x: marginLeft, y: yPosition - 35, width: sigWidth, height: sigHeight
      });
    }
  }
  
  yPosition -= 50;
  addText('Name: Ankit Khanna');
  addText('Title: Founder');
  yPosition -= 25;

  // Company signature section
  addText('Accepted and agreed to');
  addText('as of the date first written above:');
  addText(`"${companyName}"`, { bold: true });
  yPosition -= 5;
  addText('By:');
  
  // User signature
  if (data.userSignature) {
    const userImg = await embedImageSafely(pdfDoc, data.userSignature);
    if (userImg) {
      if (yPosition < 80) {
        currentPage = pdfDoc.addPage([595, 842]);
        yPosition = 800;
      }
      const sigWidth = 120;
      const sigHeight = 40;
      currentPage.drawImage(userImg, {
        x: marginLeft, y: yPosition - 35, width: sigWidth, height: sigHeight
      });
    }
  }
  
  yPosition -= 50;
  addText(`Name: ${founderName}`);
  addText(`Title: ${founderTitle}`);
  yPosition -= 30;

  // SCHEDULE I - FEE SCHEDULE
  addText('SCHEDULE I', { bold: true, size: 14 });
  yPosition -= 10;
  addText('FEE SCHEDULE', { bold: true, size: 12 });
  yPosition -= 15;
  addText(`${companyName} shall pay A&A International as compensation for its services under this Agreement fees as follows:`);
  addText('(See Schedule V for payment instruction by the Company to A&A International)');
  yPosition -= 10;
  addText('a) 5% on equity (including preferred equity or convertible debt) capital from Investors, debt capital from Investors yielding 14% or more, or on the exercise price of all securities constituting warrants, options or other rights to purchase securities issued to Investors.');
  yPosition -= 10;
  addText('b) 3% on debt capital yielding 7% or more but less than 20%, mezzanine debt or subordinated debt capital from Investors.');
  yPosition -= 10;
  addText('c) If the Transaction is structured as a non-standard transaction ("Non-Standard Transaction") with Investors such as a merger, purchase, or other non-standard structure, 5% times the equivalent capitalization of such Non-Standard Transaction. Note if the Transaction is a Non-Standard Transaction, the fees set forth in (a), (b), and (c) shall not be applicable to such Transaction.');
  yPosition -= 10;
  addText('d) in connection with any closed transaction (under the above paragraphs in this Schedule I), the minimum cash fee, in the aggregate, regardless of under which paragraph above, to A&A International shall be $250,000 (payable upon initial closing). This is merely a minimum fee - it is not an additional fee with respect to the fees set forth above. This minimum cash fee shall not be impacted by, and shall be in addition to and separate from, the additional compensation set forth below;');
  yPosition -= 10;
  addText('e) in connection with the first closed transaction under paragraphs (a), (b), and/or (d) in this Schedule I, in addition to the cash fee, A&A International will be granted equity in the Company in the amount of 5% multiplied by the capital raised divided by the post-money valuation of the company at closing. The parties will use their best efforts to structure this equity such that the economic result is achieved in the most tax efficient manner for A&A International.');
  yPosition -= 10;
  addText('f) Intentionally left blank.');
  addText('g) Intentionally left blank.');
  yPosition -= 15;
  addText('A&A International has not communicated to the Company, and does not guaranty, that its efforts will be successful in raising capital. Many factors could prevent any capital from being raised including without limitation market, economic, political, regulatory, management team, business sector, structure, opportunity, business plan, financial projections, expected returns, perceived risks, or other unanticipated factors.');
  yPosition -= 15;
  addText('Success fees payable to A&A International pursuant to this Agreement shall be paid by Company in cash upon the funding or closing of Transactions during: i) for all Investors, the Term or the Tail; and ii) for Investors that completed a Transaction during the Term or the Tail, commencing on the initial closing and ending when there is a final sale, disposition, or entity termination. This paragraph shall survive any termination or expiration of this Agreement.');
  yPosition -= 10;
  addText('Payment of A&A International\'s fee on any closed transaction shall not be contingent in any respect on whether A&A International introduced the Investor or Investors, A&A International\'s performance, or A&A International\'s interaction with the Investor, Investors, or counterparty.');
  yPosition -= 10;
  addText('Company agrees to pay A&A International\'s reasonable out-of-pocket expenses in connection with this engagement, including expenses for background investigations/reports on Company prior to marketing $2500 total cost. A&A International will not incur any material expenses without the prior written consent of Company.');
  yPosition -= 10;
  addText('Company shall pay a penalty for any payment that is not received as required herein, which shall be computed on a daily basis, based on an annual interest rate equal to 18%.');
  yPosition -= 25;

  // SCHEDULE II - INDEMNIFICATION
  addText('SCHEDULE II', { bold: true, size: 14 });
  yPosition -= 10;
  addText('INDEMNIFICATION', { bold: true, size: 12 });
  yPosition -= 15;
  addText(`Company and its affiliates, on a joint and several basis, agree to indemnify A&A International, any affiliate or controlling person of A&A International and each of their respective directors, officers, employees, agents, affiliates, independent contractors, and representatives (each, an "Indemnified Party", and all indemnified on a joint and several basis) and hold each of them harmless against any and all losses, claims, damages, expenses, and liabilities (collectively, "Liabilities") to which the Indemnified Parties may become liable, directly or indirectly, arising out of, or relating to, the Agreement to which this schedule is attached (the "Agreement") or A&A International's services thereunder, unless there is a final arbitral or judicial determination, not subject to appeal, that the Liabilities resulted from the Actionable Misconduct (as defined below) of such Indemnified Party (the "Final Judicial Determination"). Actionable Misconduct is defined solely as: i) actual fraud; or ii) negligence that is both willful and gross. No other conduct shall constitute Actionable Misconduct, and the following conduct, without limitation, shall expressly be excluded from this standard: negligence (other than negligence that is both willful and gross), misconduct, fraudulent inducement of Company to work with Indemnified Party, or Indemnified Party's actions in connection with the preparation of marketing materials, financial models, or other materials, advice, strategy, timing of activities, the Indemnified Party's experience, relationships, or abilities, etc. If Company becomes aware of Actionable Misconduct by the Indemnified Party then Company must immediately notify Indemnified Party in writing, including a description of such Actionable Misconduct.`);
  yPosition -= 15;
  addText(`Company shall reimburse each Indemnified Party immediately upon request for all expenses (including reasonable attorneys' fees and expenses) reasonably incurred in connection with the investigation of, preparation for, defense of, or providing evidence in, any action, claim, suit, proceeding or investigation, including any action brought by Company against an Indemnified Party or by an Indemnified Party against Company (each and collectively, an "Action"), directly or indirectly, arising out of, or relating to, the Agreement or A&A International's services thereunder, whether or not pending or threatened, and whether or not any Indemnified Party is a party to such action.`);
  yPosition -= 15;
  addText(`No Indemnified Party shall have any liability (whether direct or indirect, in contract or tort or otherwise) to Company or any person asserting claims on behalf of or in right of Company, directly or indirectly, arising out of, or relating to, the Agreement or A&A International's services thereunder, unless there is a Final Judicial Determination.`);
  yPosition -= 15;
  addText(`Any amounts that an Indemnified Party may owe to Company shall be limited to the lesser of: (i) actual damages incurred by Company (which shall not include any consequential or speculative damages); and (ii) actual cash fees paid by Company to the Indemnified Party in connection with this Agreement.`);
  yPosition -= 15;
  // --- ADDED MISSING CONTENT STARTS HERE ---
  addText(`Company will not, without A&A International’s prior written consent, agree to any settlement of, compromise or consent to the entry of any judgment in or other termination of (each and collectively, a “Settlement”) any action in respect of which indemnification could be sought hereunder (whether or not A&A International or any other Indemnified Party is an actual or potential party to such action), unless (i) such Settlement includes an unconditional release of each Indemnified Party from any Liabilities arising out of such action; and (ii) the parties agree that the terms of such Settlement shall remain confidential.`);
  yPosition -= 15;
  addText(`If any indemnification or reimbursement sought pursuant to the first paragraph of this schedule is for any reason unavailable or insufficient to hold any Indemnified Party harmless (except by reason of Actionable Misconduct by Indemnified Party) then, whether A&A International is the person entitled to indemnification or reimbursement, Company shall contribute and A&A International shall contribute, in each case, to the Liabilities for which such indemnification or reimbursement is held unavailable in such proportion as is appropriate to reflect the relative fault of the parties as well as any other relevant equitable considerations.`);
  yPosition -= 15;
  addText(`The rights of the Indemnified Parties referred to above shall be in addition to any rights that any Indemnified Party may otherwise have.`);
  yPosition -= 25;

  // SCHEDULE III - REPRESENTATIONS AND WARRANTIES
  addText('SCHEDULE III', { bold: true, size: 14 });
  yPosition -= 10;
  addText('REPRESENTATIONS AND WARRANTIES', { bold: true, size: 12 });
  yPosition -= 15;
  addText(`A&A International represents, warrants and agrees that:`);
  yPosition -= 5;
  addText(`(i) The Investments will be offered and sold in compliance with all applicable federal, state and foreign securities or blue sky laws, rules, regulations, and registration requirements.`);
  addText(`(ii) It has all requisite power and authority to execute and perform this Agreement. All corporate action necessary for the authorization, execution, delivery and performance of this Agreement has been taken. This Agreement constitutes a valid and binding obligation of it.`);
  yPosition -= 10;
  addText(`Company represents, warrants and agrees that:`);
  yPosition -= 5;
  addText(`(i) If applicable, the Investments will be offered utilizing general solicitation of investors, and offered and sold in compliance with all applicable federal, state and foreign securities or blue sky laws, rules, regulations, and registration requirements; and prior to closing It will be responsible for verification of the accredited status of each investor participating in such closing.`);
  addText(`(ii) If applicable, the legal documents will include all information required to be furnished to investors under Regulation D and will not contain any untrue statement of a material fact or omit to state a material fact required to be stated in the legal documents or necessary to make the statements therein not misleading. The Information will be accurate and complete in all material respects.`);
  addText(`(iii) It is solely responsible for preparing legal documents, including all materials and financial projections, for potential Investors, and will notify A&A International promptly of any material information or change. If applicable, it will not, following the final closing date of the Transaction, offer for sale or sell any securities that would jeopardize the availability of the exemptions from all registration and qualification requirements, and it has not engaged in any such offering during the six months prior to the date of this Agreement.`);
  addText(`(iv) It has done its own independent due diligence on A&A International prior to entering into the Agreement and has not relied on any oral or written statement not contained in this Agreement as an inducement to enter into this Agreement or otherwise, including without limitation statements regarding A&A International’s track record, abilities, experience, relationships with investors and others, staffing and execution plans, expectations for success, or knowledge of It or the industry. To the extent it (a) discovers A&A International has made any false statements or omitted any facts prior to or during this Agreement, (b) is not satisfied with A&A International’s performance in any way, or (c) has any other concerns regarding A&A International’s activities, it agrees to notify A&A International promptly in writing so that such matter may be resolved.`);
  addText(`(v) The required services of A&A International are limited to those services explicitly contained in this Agreement. There are no other services required of A&A International, expressly or implicitly, for A&A International to fulfill its requirements under this Agreement. For purposes of clarifying the meaning of A&A International’s reasonable efforts (as set forth in this Agreement), A&A International (a) is under no obligation and provides no express or implied commitment or guarantees to place the Transaction with any Investor; (b) will not invest in the Transaction with its own capital nor will it incur any on-going out-of-pocket expenses that are not reimbursable under the Agreement; and (c) shall not assume the responsibilities of an advisor, fiduciary or agent for it, and although A&A International may provide advice to it, it agrees that it will make its own decisions and agree to hold A&A International harmless regarding any advice it may or may not receive from A&A International or its other advisors. It also acknowledges that the Transaction has a limited market and A&A International makes no representations, commitments or guarantees regarding its knowledge of or relationships with, or the level of interest from, potential Investors that are known to A&A International. It also acknowledges that A&A International has limited knowledge of, and A&A International makes no representations, commitments or guarantees regarding its knowledge of, It, its market, or its industry.`);
  addText(`(vi) It has all requisite power and authority to execute and perform this Agreement; this Agreement constitutes a valid and binding obligation of it; the execution and performance of this Agreement by it and the offer and sale of the Investments in the Transaction will not violate any provision of its charter or bylaws or any agreement or other instrument to which it is a party or by which it is bound; and any necessary approvals, governmental and private, will be obtained by it before the closing of the Transaction.`);
  addText(`(vii) The services performed by A&A International in connection with this engagement are for the benefit and use of it in considering the Transaction to which such services relate. No such services shall be used for any other purpose or be disclosed, reproduced, disseminated, quoted or referred to at any time, in any manner or for any purpose, nor shall any public references to A&A International be made, in each case without A&A International’s prior written consent, which consent shall not be unreasonably withheld.`);
  addText(`(viii) It is a sophisticated business enterprise with competent internal financial advisors and legal counsel, and it has retained A&A International for the limited purposes set forth in this Agreement. The parties acknowledge and agree that their respective rights and obligations as set forth herein are contractual in nature. It agrees that (i) A&A International has been retained to act solely in connection with the activities stated herein, (ii) A&A International shall not assume the responsibilities of an advisor to or fiduciary or agent of it in connection with the performance of A&A International’s services hereunder and (iii) any duties of A&A International arising out of its engagement shall be owed solely to it. Accordingly, (i) it disclaims any intention to impose any fiduciary obligations on A&A International by virtue of this Agreement, (ii) A&A International shall not be deemed to have any fiduciary duties or obligations to the investors, it, any other business entities, or their respective officers, directors, shareholders, partners, members, affiliates or creditors, as a result of this Agreement or the services provided hereto and (iii) it hereby waives and releases, to the fullest extent permitted by law, any claims that it may have against A&A International with respect to any breach or alleged breach of fiduciary duty hereunder.`);
  addText(`(ix) Under no circumstances shall the execution of this Agreement or any act of A&A International hereunder commit or be deemed a commitment by A&A International to provide or arrange any bank financing or other debt or equity financing for any transaction or to purchase any security in connection therewith. Its Board of Directors will not base its decisions regarding whether and how to pursue the Transaction on A&A International’s advice, but will consider the advice of its legal, tax and other business advisors and such other factors which they consider appropriate. A&A International has no responsibility to it with respect to any transaction contemplated hereby except the obligations expressly set forth in this Agreement.`);
  addText(`(x) A&A International may be engaged in a broad range of securities transactions and activities and financial services that involve interests that differ from, compete with, or overlap with those of it and A&A International has no obligation to disclose any of such interest by virtue of any advisory, agency or fiduciary relationship. In the ordinary course of A&A International’s business A&A International or its clients may at any time be involved in competing transactions or be raising capital, or providing or arranging debt, equity, or other types of financing and other financial services for or to a prospective issuer, client, company, fund, prospective investor, or other entities that may be involved in competing transactions or businesses. The rights and obligations it may have to A&A International under any other agreement are separate from its rights and obligations under this Agreement and will not be affected by A&A International’s services hereunder.`);
  addText(`(xi) It will furnish to A&A International such information as A&A International believes appropriate to the engagement (all such information, the “Information”). A&A International will rely solely on the accuracy and completeness of the Information without assuming any responsibility for investigation or independent verification whether or not A&A International reviews it. A&A International has not made and may not make any physical inspection of the properties or assets of it, and will assume that any financial forecasts furnished to or discussed with A&A International by it have been reasonably prepared and reflect the best estimates and judgments of management. At the closing of the Transaction it will provide A&A International with a copy of the closing binder (soft copy) including: an index (or table of contents) and the transaction documents.`);
  addText(`(xii) It will comply with all applicable laws, rules, regulations, and registration requirements for all offers and sales of securities. A&A International will be able to rely on it with respect to blue sky matters, and for updating, amending and supplementing legal documents and filings as required by applicable laws.`);
  addText(`(xiii) Investors will be able to see Transaction information on A&A International.com and information regarding their interest in the Transaction (status, notes from A&A International and it, etc.)`);
  addText(`(xiv) A&A International’s marketing of the transaction may include email campaigns, social media posts (LinkedIn, etc.), phone calls, and/or meetings. In addition, A&A International may include it and Transaction information on A&A International’s website (consistent with the presentation of other transactions on A&A International’s website) and social media sites (LinkedIn, etc.).`);
  addText(`(xv) It will promptly inform A&A International of interest that it receives from a third party with respect to the Transaction. If an affiliate (any new or existing other entity or person with any common officers, employees, management, control (10% voting or more), or ownership (10% or more) with it) does a Transaction, or it restructures the proposed Investment using an affiliate, then it shall require such affiliate to become a party to this Agreement.`);
  addText(`(xvi) If a Transaction is completed: i) if it takes part in any type of announcement of the transaction (including without limitation a press release) it shall include in such announcement that A&A International was the exclusive agent and/or advisor for the transaction; and ii) A&A International may make announcements (including without limitation in a press release, in its marketing materials, on social media sites (LinkedIn, etc.), and on its web site) including a description of the transaction noting that it was the exclusive agent and/or advisor.`);
  yPosition -= 25;
  
  // SCHEDULE IV - ARBITRATION/LITIGATION/VENUE
  addText('SCHEDULE IV', { bold: true, size: 14 });
  yPosition -= 10;
  addText('ARBITRATION/LITIGATION/VENUE', { bold: true, size: 12 });
  yPosition -= 15;
  addText(`Any controversy or claim arising out of or relating to this Agreement, or the breach thereof, shall be adjudicated by arbitration (“Arbitration”) administered by the American Arbitration Association (the “AAA”) in accordance with its Commercial Arbitration Rules in place when the Arbitration is filed (the “Rules”). The award of the arbitrator shall be final and binding, and judgment on the award rendered by the arbitrator(s) may be entered in any court having jurisdiction thereof. Except as provided by the Rules, the Arbitration shall be the sole, exclusive and final remedy for any dispute between the parties.`);
  yPosition -= 15;
  addText(`The Arbitration shall be heard by a panel of three arbitrators. Within 15 days after the commencement of the Arbitration, each party shall select one person to act as arbitrator and the two selected shall select a third arbitrator within ten days of their appointment. If any party fails to select an arbitrator or the arbitrators selected by the parties are unable or fail to agree upon the third arbitrator, such arbitrator shall be selected by the AAA. The place of arbitration shall be Delhi, Delhi.`);
  yPosition -= 15;
  addText(`The Commercial Arbitration Optional Rules for Emergency Measures of Protection are also incorporated by the parties. The award of the arbitrators shall be accompanied by a reasoned opinion.`);
  yPosition -= 15;
  addText(`Except as may be required by law, neither a party nor an arbitrator may disclose the existence, content, or results of any arbitration hereunder without the prior written consent of both parties. If, in connection with any judicial proceedings to modify, vacate or confirm any order or award, confidential information must be filed with any court, the party submitting such confidential information shall file such confidential information under seal and shall also file a motion with the court requesting that the confidential information remain under seal and no party shall oppose such request.`);
  yPosition -= 15;
  addText(`The parties agree that failure or refusal of a party to pay its required share of the deposits for arbitrator compensation or administrative charges shall constitute a waiver by that party to present evidence or cross-examine witnesses. In such event, the other party shall be required to present evidence and legal argument as the arbitrator(s) may require for the making of an award. Such waiver shall not allow for a default judgment against the non-paying party in the absence of evidence presented as provided for above.`);
  yPosition -= 15;
  addText(`Notwithstanding the requirements in this section that any controversy or claim arising out of or relating to this Agreement, or the breach thereof, shall be adjudicated by binding arbitration as set forth in this schedule, if one of the parties attempts to litigate in court (for example to argue that the arbitration clause herein is not binding or that the ruling of the arbitrator is not binding) the parties hereby irrevocably submit to the exclusive jurisdiction of the courts of the State of Delhi and the federal courts of the India located in the Borough of Manhattan in Delhi City, Delhi solely in respect of the interpretation and enforcement of the provisions of this Agreement and of the documents referred to in this Agreement, and hereby waive and agree not to assert as a defense in any action, suit or proceeding for the interpretation or enforcement hereof or of any such document, that it is not subject thereto or that such action, suit or proceeding may not be brought or is not maintainable in said courts or that the venue thereof may not be appropriate or that this Agreement or any such documents may not be enforced in or by said courts. All claims with respect to such action or proceeding shall be heard and determined in such Delhi court or federal courts of the India located in the Borough of New Delhi City, Delhi. The parties hereby consent to and grant any such court exclusive jurisdiction over the person of the parties and over the subject matter of any such dispute. For avoidance of doubt, nothing contained in this paragraph shall prevent a party from asserting as a defense that such action, suit or proceeding is prohibited by the binding arbitration provisions contained in this Schedule IV. The parties agree that issues of arbitrability shall be resolved by the arbitrators, and that all matters involving the Agreement shall be tried in the arbitration forum.`);
  yPosition -= 15;
  addText(`Unless there is a final judicial determination, not subject to appeal, that A&A International’s liability resulted from the Actionable Misconduct (as defined herein) of A&A International, then in the event of litigation relating to this Agreement, in a court or an arbitration, Company shall be liable and pay to A&A International the reasonable legal fees and costs, and/or arbitration costs, incurred by A&A International in connection with such litigation and/or arbitration, including any appeal therefrom.`);

 
  return await pdfDoc.save();
}