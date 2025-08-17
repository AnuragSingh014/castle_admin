// src/components/admin/InformationView.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  User, 
  Phone, 
  Mail, 
  Globe, 
  MapPin,
  Calendar,
  Users,
  FileText,
  Target,
  BarChart3,
  Briefcase
} from 'lucide-react';

const InformationView = ({ data, userInfo, loading }) => {
  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading information...</p>
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
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Information Submitted</h3>
            <p className="text-gray-500">User hasn't submitted company information yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Company Information</CardTitle>
              <p className="text-slate-600">Basic company details and contact information</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Company Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="w-5 h-5" />
            <span>Company Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Company Name</label>
                <p className="text-lg font-semibold text-gray-900">
                  {data.companyName || 'Not provided'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Company Type</label>
                <p className="text-gray-900">{data.companyType || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Industry</label>
                <div className="flex items-center space-x-2">
                  <p className="text-gray-900">{data.industry || 'Not provided'}</p>
                  {data.industry && <Badge variant="outline">{data.industry}</Badge>}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Founded Year</label>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{data.foundedYear || 'Not provided'}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Employee Count</label>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{data.employeeCount || 'Not provided'}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Headquarters</label>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{data.headquarters || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>
          
          {data.website && (
            <div className="mt-4 pt-4 border-t">
              <label className="text-sm font-medium text-gray-500">Website</label>
              <div className="flex items-center space-x-2 mt-1">
                <Globe className="w-4 h-4 text-gray-400" />
                <a 
                  href={data.website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  {data.website}
                </a>
              </div>
            </div>
          )}
          
          {data.description && (
            <div className="mt-4 pt-4 border-t">
              <label className="text-sm font-medium text-gray-500">Company Description</label>
              <p className="text-gray-900 mt-1 whitespace-pre-wrap">{data.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Information */}
      {data.contactInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Contact Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <div className="flex items-center space-x-2 mt-1">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a 
                    href={`mailto:${data.contactInfo.email}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {data.contactInfo.email || 'Not provided'}
                  </a>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <div className="flex items-center space-x-2 mt-1">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a 
                    href={`tel:${data.contactInfo.phone}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {data.contactInfo.phone || 'Not provided'}
                  </a>
                </div>
              </div>
            </div>
            {data.contactInfo.address && (
              <div className="mt-4 pt-4 border-t">
                <label className="text-sm font-medium text-gray-500">Business Address</label>
                <div className="flex items-start space-x-2 mt-1">
                  <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                  <p className="text-gray-900 whitespace-pre-wrap">{data.contactInfo.address}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Business Overview */}
      {data.businessOverview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Business Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {data.businessOverview.businessModel && (
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Briefcase className="w-4 h-4 text-blue-500" />
                  <label className="text-sm font-medium text-gray-500">Business Model</label>
                </div>
                <p className="text-gray-900 whitespace-pre-wrap bg-blue-50 p-3 rounded-lg">
                  {data.businessOverview.businessModel}
                </p>
              </div>
            )}
            
            {data.businessOverview.marketOpportunity && (
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-green-500" />
                  <label className="text-sm font-medium text-gray-500">Market Opportunity</label>
                </div>
                <p className="text-gray-900 whitespace-pre-wrap bg-green-50 p-3 rounded-lg">
                  {data.businessOverview.marketOpportunity}
                </p>
              </div>
            )}
            
            {data.businessOverview.growthStrategy && (
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="w-4 h-4 text-purple-500" />
                  <label className="text-sm font-medium text-gray-500">Growth Strategy</label>
                </div>
                <p className="text-gray-900 whitespace-pre-wrap bg-purple-50 p-3 rounded-lg">
                  {data.businessOverview.growthStrategy}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InformationView;
