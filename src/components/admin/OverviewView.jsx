// src/components/admin/OverviewView.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  BarChart3,
  Building2,
  Users,
  Target,
  AlertTriangle,
  Briefcase,
  Globe,
  Image as ImageIcon
} from 'lucide-react';

const OverviewView = ({ data, userInfo, loading }) => {
  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading overview...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Overview Submitted</h3>
            <p className="text-gray-500">User hasn't submitted business overview yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Financial highlights data
  const periods = [
    { key: 'fy22', label: 'FY 22' },
    { key: 'fy23', label: 'FY 23' },
    { key: 'fy24', label: 'FY 24' },
    { key: 'sept24', label: 'Sept 30 \'24' }
  ];

  const metrics = [
    { key: 'revenue', label: 'Revenue', unit: '₹ Cr' },
    { key: 'ebitda', label: 'EBITDA', unit: '₹ Cr' },
    { key: 'pat', label: 'Profit After Tax', unit: '₹ Cr' },
    { key: 'ebitdaMargin', label: 'EBITDA Margin', unit: '%' },
    { key: 'patMargin', label: 'PAT Margin', unit: '%' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Business Overview</CardTitle>
              <p className="text-slate-600">Financial highlights and business analysis</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Business Overview Sections */}
      <div className="grid grid-cols-1 gap-6">
        {/* Business Overview */}
        {data.businessOverview && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="w-5 h-5" />
                <span>Business Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-900 whitespace-pre-wrap">{data.businessOverview}</p>
            </CardContent>
          </Card>
        )}

        {/* Revenue Streams */}
        {data.revenueStreams && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>Revenue Streams</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-900 whitespace-pre-wrap">{data.revenueStreams}</p>
            </CardContent>
          </Card>
        )}

        {/* Industry Overview */}
        {data.industryOverview && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>Industry Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-900 whitespace-pre-wrap">{data.industryOverview}</p>
            </CardContent>
          </Card>
        )}

        {/* Fund Utilization */}
        {data.fundUtilization && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Fund Utilization</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-900 whitespace-pre-wrap">{data.fundUtilization}</p>
            </CardContent>
          </Card>
        )}

        {/* About Promoters */}
        {data.aboutPromoters && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>About Promoters</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-900 whitespace-pre-wrap">{data.aboutPromoters}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Financial Highlights */}
      {data.financialHighlights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Financial Highlights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full">
              <div className="min-w-[600px]">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Particulars</th>
                      {periods.map(period => (
                        <th key={period.key} className="text-center p-3 font-medium">
                          {period.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.map(metric => (
                      <tr key={metric.key} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">
                          {metric.label} ({metric.unit})
                        </td>
                        {periods.map(period => (
                          <td key={period.key} className="p-3 text-center">
                            {data.financialHighlights[metric.key]?.[period.key] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Peer Analysis */}
      {data.peerAnalysis && data.peerAnalysis.companyNames?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="w-5 h-5" />
              <span>Peer Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.peerAnalysis.companyNames.map((company, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">{company}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Revenue:</span>
                      <span className="ml-2 font-medium">₹{data.peerAnalysis.revenue?.[index] || 'N/A'} Cr</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Basic EPS:</span>
                      <span className="ml-2 font-medium">{data.peerAnalysis.basicEps?.[index] || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">EBITDA:</span>
                      <span className="ml-2 font-medium">₹{data.peerAnalysis.ebitda?.[index] || 'N/A'} Cr</span>
                    </div>
                    <div>
                      <span className="text-gray-500">PAT:</span>
                      <span className="ml-2 font-medium">₹{data.peerAnalysis.pat?.[index] || 'N/A'} Cr</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shareholding Pattern */}
      {data.shareholding && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="w-5 h-5" />
              <span>Shareholding Pattern</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Promoters</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Shares:</span>
                    <span className="font-medium">{data.shareholding.promoters?.shares || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Percentage:</span>
                    <span className="font-medium">{data.shareholding.promoters?.percentage || 'N/A'}%</span>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Public</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-green-700">Shares:</span>
                    <span className="font-medium">{data.shareholding.public?.shares || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Percentage:</span>
                    <span className="font-medium">{data.shareholding.public?.percentage || 'N/A'}%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Factors */}
      {data.riskFactors && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Risk Factors</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-900 whitespace-pre-wrap">{data.riskFactors}</p>
          </CardContent>
        </Card>
      )}

      {/* IPO Intermediaries */}
      {data.ipoIntermediaries && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Briefcase className="w-5 h-5" />
              <span>IPO Intermediaries</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-900 whitespace-pre-wrap">{data.ipoIntermediaries}</p>
          </CardContent>
        </Card>
      )}

      {/* ✅ FIXED: Company Images - Now Shows Actual Images */}

{data.images && data.images.length > 0 && (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <ImageIcon className="w-5 h-5" />
        <span>Company Images ({data.images.length})</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.images.map((image, index) => (
          <div key={index} className="border rounded-lg overflow-hidden shadow-sm">
            {/* ✅ Display base64 image directly from MongoDB */}
            <img
              src={image.data || 'https://via.placeholder.com/200x200/f3f4f6/9ca3af?text=No+Image'}
              alt={image.originalName || `Company Image ${index + 1}`}
              className="w-full aspect-square object-cover"
              onError={(e) => {
                console.error('Image failed to load:', image);
                e.target.src = 'https://via.placeholder.com/200x200/f3f4f6/9ca3af?text=Failed+to+Load';
              }}
            />
            <div className="p-3">
              <p className="text-xs text-gray-600 truncate font-medium">
                {image.originalName || image.filename || `Image ${index + 1}`}
              </p>
              <div className="flex justify-between items-center mt-2">
                <Badge variant="outline" className="text-xs">
                  {image.size ? (image.size / 1024 / 1024).toFixed(1) + ' MB' : 'Unknown size'}
                </Badge>
                <span className="text-xs text-gray-500">
                  {image.mimetype || 'Unknown type'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)}

    </div>
  );
};

export default OverviewView;
