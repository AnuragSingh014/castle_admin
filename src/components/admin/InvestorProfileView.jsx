// src/components/admin/InvestorProfileView.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone } from 'lucide-react';

const InvestorProfileView = ({ investorInfo, dashboardData }) => {
  const display = (value) => value || 'Not provided';
  
  // Get profile data from dashboard
  const profileData = dashboardData?.investorProfile || {};
  
  // Check if profile is complete (has all 3 fields)
  const isComplete = profileData.name && profileData.email && profileData.phone;

  return (
    <div className="space-y-6">
      {/* Profile Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Investor Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Profile Status</span>
            <Badge variant={isComplete ? 'default' : 'secondary'}>
              {isComplete ? 'Complete' : 'Incomplete'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isComplete ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">This investor has not yet completed their profile.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Name */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-gray-700">Name</span>
                </div>
                <span className="text-gray-900">{display(profileData.name)}</span>
              </div>

              {/* Email */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-gray-700">Email</span>
                </div>
                <span className="text-gray-900">{display(profileData.email)}</span>
              </div>

              {/* Phone */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-gray-700">Phone</span>
                </div>
                <span className="text-gray-900">{display(profileData.phone)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvestorProfileView;
