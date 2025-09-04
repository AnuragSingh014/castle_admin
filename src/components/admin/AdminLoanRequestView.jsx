import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  Percent, 
  Calendar, 
  Briefcase, 
  Target,
  AlertCircle,
  Download,
  FileText,
  Loader2
} from 'lucide-react';
import { createIpoOnePagerPdf } from '@/lib/generateIpoOnePager';

const AdminLoanRequestView = ({ data, userName, userEmail, userId }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  // Handle PDF download
  const handleDownloadPdf = async () => {
    if (!userId) {
      alert('❌ User ID not found. Cannot generate PDF.');
      return;
    }

    setIsDownloading(true);
    
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Fetch all required data from backend
      const userResponse = await fetch(`https://castle-backend.onrender.com/api/admin/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userData = await userResponse.json();
      const { user, dashboard } = userData;

      // Prepare PDF data structure with corrected variable names
      const pdfData = {
        companyInfo: {
          companyName: dashboard.information?.companyName || user.name || 'COMPANY NAME'
        },
        loanRequest: {
          loanType: data.loanType || 'N/A', // ✅ CORRECTED
          loanPurpose: data.loanPurpose || 'N/A', // ✅ CORRECTED
          loanAmountRequired: data.loanAmountRequired,
          expectedROI: data.expectedROI,
          tenure: data.tenure,
          tenureUnit: data.tenureUnit
        },
        businessOverview: {
          businessOverview: dashboard.overview?.businessOverview || 'No business overview provided.',
          industryOverview: dashboard.overview?.industryOverview || 'No industry overview provided.',
          fundUtilization: dashboard.overview?.fundUtilization || 'No fund utilization data provided.',
          revenueStreams: dashboard.overview?.revenueStreams || null,
          financialHighlights: dashboard.overview?.financialHighlights || null,
          peerAnalysis: dashboard.overview?.peerData || null,
          productOffering: {
            images: dashboard.overview?.productImages || []
          }
        }
      };

      // Generate PDF
      const pdfBytes = await createIpoOnePagerPdf(pdfData);

      // Download PDF
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const companyName = pdfData.companyInfo.companyName.replace(/[^a-zA-Z0-9]/g, '_');
      const currentDate = new Date().toISOString().split('T')[0];
      link.download = `IPO_OnePager_${companyName}_${currentDate}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert('✅ IPO One Pager downloaded successfully!');

    } catch (error) {
      console.error('PDF generation error:', error);
      alert(`❌ Failed to generate PDF: ${error.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle case where no data is provided
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-slate-600" />
            <span>Loan Request Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Alert className="border-gray-200 bg-gray-50">
            <AlertCircle className="h-4 w-4 text-gray-600" />
            <AlertDescription className="text-gray-700">
              No loan request data has been submitted by this user yet.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return 'Not specified';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get funding type display name
  const getFundingTypeDisplay = (type) => {
    const types = {
      'ipo': 'IPO',
      'startup': 'Startup',
      'private_equity': 'Private Equity',
      'bank': 'Bank',
      'bridge_finance': 'Bridge Finance/Private Funding',
      'npa_funding': 'NPA Funding',
      'government_grant': 'Government Grant'
    };
    return types[type] || type || 'Not specified';
  };

  // Get specific purpose display name
  const getSpecificPurposeDisplay = (loanType, purpose) => {
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
    return purposeMap[loanType]?.[purpose] || purpose || 'Not specified';
  };

  return (
    <Card className="border-slate-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span>Loan Request Details</span>
            {data.status && (
              <Badge 
                variant={data.status === 'submitted' ? 'default' : 'secondary'}
                className="ml-2"
              >
                {data.status === 'submitted' ? 'Submitted' : data.status}
              </Badge>
            )}
          </CardTitle>
          
          {/* Download PDF Button */}
          <Button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download IPO One Pager
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Loan Amount */}
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-4 h-4 text-slate-600" />
                <label className="text-sm font-medium text-slate-700">
                  Loan Amount Required
                </label>
              </div>
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(data.loanAmountRequired)}
              </p>
            </div>

            {/* Expected ROI */}
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Percent className="w-4 h-4 text-slate-600" />
                <label className="text-sm font-medium text-slate-700">
                  Expected ROI
                </label>
              </div>
              <p className="text-lg font-semibold text-orange-600">
                {data.expectedROI ? `${data.expectedROI}%` : 'Not specified'}
              </p>
            </div>

            {/* Tenure */}
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-4 h-4 text-slate-600" />
                <label className="text-sm font-medium text-slate-700">
                  Tenure
                </label>
              </div>
              <p className="text-lg font-semibold text-blue-600">
                {data.tenure && data.tenureUnit 
                  ? `${data.tenure} ${data.tenureUnit}`
                  : 'Not specified'
                }
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Funding Type */}
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Briefcase className="w-4 h-4 text-slate-600" />
                <label className="text-sm font-medium text-slate-700">
                  Funding Type
                </label>
              </div>
              <p className="text-lg font-semibold text-purple-600">
                {getFundingTypeDisplay(data.loanType)} 
              </p>
            </div>

            {/* Specific Purpose */}
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-4 h-4 text-slate-600" />
                <label className="text-sm font-medium text-slate-700">
                  Specific Purpose
                </label>
              </div>
              <p className="text-lg font-semibold text-indigo-600">
                {getSpecificPurposeDisplay(data.loanType, data.loanPurpose)}
              </p>
            </div>

            {/* Submission Date */}
            {data.submittedAt && (
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-4 h-4 text-slate-600" />
                  <label className="text-sm font-medium text-slate-700">
                    Submitted On
                  </label>
                </div>
                <p className="text-sm text-slate-600">
                  {formatDate(data.submittedAt)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Information */}
        {(userName || userEmail) && (
          <div className="mt-6 pt-4 border-t border-slate-200">
            <h4 className="text-sm font-medium text-slate-700 mb-2">User Information</h4>
            <div className="text-sm text-slate-600">
              {userName && <p>Name: {userName}</p>}
              {userEmail && <p>Email: {userEmail}</p>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminLoanRequestView;