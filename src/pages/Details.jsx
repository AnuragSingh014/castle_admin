// src/components/Details.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';

import { 
    Building2, 
    TrendingUp, 
    User,
    CheckCircle2,
    Clock,
    AlertCircle,
    Eye,
    EyeOff,
    ArrowLeft,
    Calendar,
    Mail,
    Phone,
    Globe,
    MapPin,
    Users,
    Target,
    DollarSign,
    PieChart,
    BarChart3,
    Briefcase,
    Shield,
    FileText,
    CheckCircle,
    Calculator
  } from 'lucide-react';
  
// Corrected imports based on your file structure
import InformationView from '../components/admin/InformationView';
import OverviewView from '../components/admin/OverviewView';
import CompanyReferencesView from '../components/admin/CompanyReferencesView';
import AdminInformationSheetView from '@/components/admin/AdminInformationSheetView';
import AdminBeneficialOwnerView from '@/components/admin/AdminBeneficialOwnerView';
import AdminDDFormView from '@/components/admin/AdminDDFormView';
import AdminLoanDetailsView from '@/components/admin/AdminLoanDetailsView';
// ✅ NEW IMPORTS FOR CEO AND CFO DASHBOARD VIEWS
import AdminCEODashboardView from '@/components/admin/AdminCEODashboardView';
import AdminCFODashboardView from '@/components/admin/AdminCFODashboardView';

// Compact Deal Status Component
const CompactDealStatus = ({ 
  userId, 
  currentAmount, 
  actionLoading, 
  onAmountUpdate 
}) => {
  const [selectedStatus, setSelectedStatus] = useState('looking');
  const [customAmount, setCustomAmount] = useState('');

  const dealStatuses = [
    { value: 'looking', label: 'Looking for Investment', amount: null },
    { value: 'partial', label: 'Partially Closed', amount: -100 },
    { value: 'closed', label: 'Deal Closed', amount: -200 }
  ];

  const handleSubmit = async () => {
    const selectedStatusData = dealStatuses.find(status => status.value === selectedStatus);
    const amountToSubmit = selectedStatus === 'looking' 
      ? parseFloat(customAmount) || 0 
      : selectedStatusData.amount;
    
    await onAmountUpdate(userId, amountToSubmit);
  };

  const getCurrentStatus = () => {
    if (currentAmount === -100) return 'partial';
    if (currentAmount === -200) return 'closed';
    if (currentAmount > 0) return 'looking';
    return 'looking';
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Status Dropdown */}
      <select
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {dealStatuses.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>

      {/* Amount Input (only for 'looking' status) */}
      {selectedStatus === 'looking' && (
        <input
          type="number"
          placeholder="Amount (₹)"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          min="0"
          step="1000"
        />
      )}

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={actionLoading || (selectedStatus === 'looking' && (!customAmount || parseFloat(customAmount) <= 0))}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg"
      >
        {actionLoading ? 'Updating...' : 'Update Deal'}
      </Button>

      {/* Current Status Display */}
      {currentAmount !== 0 && (
        <div className="text-xs text-gray-500 ml-2">
          Current: {currentAmount > 0 ? `₹${currentAmount.toLocaleString()}` : 
                   currentAmount === -100 ? 'Partially Closed' : 'Closed'}
        </div>
      )}
    </div>
  );
};

const Details = ({ userId, onBack }) => {
  const [selectedSection, setSelectedSection] = useState('information');
  const [userDashboardData, setUserDashboardData] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Updated handler function to accept amount parameter
  const handleSetPublicAmount = async (userId, amount) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/public-amount`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: amount
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to update amount: ${response.status}`);
      }

      await refreshUserData();
      alert('✅ Deal status updated successfully!');
    } catch (err) {
      console.error('Error updating amount:', err);
      alert('Failed to update deal status. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handler for approving form completion
  const handleApproveFormCompletion = async (userId) => {
    setActionLoading(true);
    
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        throw new Error('No authentication token found');
      }
  
      console.log('Starting approval process for user:', userId);
  
      // Approve specific sections that need approval
      const sectionsToApprove = ['informationSheet', 'beneficialOwnerCertification', 'ddform', 'loanDetails','companyReferences', 'ceoDashboard', 'cfoDashboard'];
      const results = [];
      
      for (const section of sectionsToApprove) {
        console.log(`Approving section: ${section}`);
        
        const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/approve`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            component: section,
            state: 'approved'
          })
        });
  
        console.log(`Response for ${section}:`, response.status, response.statusText);
        
        // Check if response redirected
        if (response.redirected) {
          console.error('Unexpected redirect detected:', response.url);
          throw new Error('Server redirected request - check authentication');
        }
  
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(`Failed to approve ${section}: ${errorData.error || response.status}`);
        }
  
        const data = await response.json();
        console.log(`Success for ${section}:`, data);
        results.push({ section, data });
      }
      
      console.log('All approvals completed:', results);
      
      // Reload the user data to show updated approval status
      await refreshUserData();
      
      alert('✅ All sections approved successfully! User can now complete the remaining forms.');
      
    } catch (err) {
      console.error('Error approving sections:', err);
      alert(`❌ Failed to approve sections: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };
  
  // Add this function to refresh user data
  const refreshUserData = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const updatedData = await response.json();
        setUserInfo(updatedData.user);
        setUserDashboardData(updatedData.dashboard);
        console.log('User data refreshed:', updatedData);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  // ✅ UPDATED Navigation sections - ADDED CEO AND CFO DASHBOARD SECTIONS
  const sections = [
    {
      id: 'information',
      title: 'Company Information',
      icon: Building2,
      description: 'Basic company details',
      component: InformationView
    },
    {
      id: 'overview',
      title: 'Business Overview',
      icon: TrendingUp,
      description: 'Financial highlights',
      component: OverviewView
    },
    {
      id: 'informationSheet',
      title: 'Information Sheet',
      icon: FileText,
      description: 'Information sheet',
      component: AdminInformationSheetView
    },
    {
      id: 'beneficialOwnerCertification',
      title: 'Beneficial Owner',
      icon: User,
      description: 'Ownership certification',
      component: AdminBeneficialOwnerView
    },
    {
        id: 'companyReferences',
        title: 'Company References',
        icon: Users,
        description: 'Business references',
        component: CompanyReferencesView
    },
    {
      id: 'ddform',
      title: 'DD Form',
      icon: Shield,
      description: 'Due diligence form',
      component: AdminDDFormView
    },
    {
      id: 'loanDetails',
      title: 'Loan Details',
      icon: DollarSign,
      description: 'Loan application details',
      component: AdminLoanDetailsView
    },
    // ✅ NEW SECTIONS FOR CEO AND CFO DASHBOARDS
    {
      id: 'ceoDashboard',
      title: 'CEO Dashboard',
      icon: Building2,
      description: 'Financial performance data',
      component: AdminCEODashboardView
    },
    {
      id: 'cfoDashboard',
      title: 'CFO Dashboard',
      icon: BarChart3,
      description: 'Financial statements & ratios',
      component: AdminCFODashboardView
    }
  ];

  // Fetch user data and dashboard information
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;

      setLoading(true);
      setError('');

      try {
        const token = localStorage.getItem('admin_token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Fetch user details and dashboard data
        const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.status}`);
        }

        const data = await response.json();
        setUserInfo(data.user);
        setUserDashboardData(data.dashboard);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  // Get completion status for a section
  const getSectionStatus = (sectionId) => {
    if (!userDashboardData) return 'empty';
    
    const sectionData = userDashboardData[sectionId];
    if (!sectionData) return 'empty';
    
    // Check if section has any meaningful data
    const hasData = typeof sectionData === 'object' 
      ? Object.values(sectionData).some(value => 
          value !== null && value !== '' && 
          (typeof value !== 'object' || Object.keys(value).length > 0)
        )
      : sectionData !== '' && sectionData !== null;
    
    return hasData ? 'completed' : 'empty';
  };

  const handleWebsiteDisplayToggle = async (userId) => {
    setActionLoading(true);
    
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/website-display`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          displayOnWebsite: !userDashboardData?.isDisplayedOnWebsite
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update website display: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Reload the user data to show updated status
      await refreshUserData();
      
      alert(`✅ Website display ${data.isDisplayedOnWebsite ? 'enabled' : 'disabled'} successfully!`);
      
    } catch (err) {
      console.error('Error toggling website display:', err);
      alert('Failed to update website display. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200 text-xs px-2 py-1">Completed</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs px-2 py-1">Partial</Badge>;
      case 'empty':
        return <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-xs px-2 py-1">Not Started</Badge>;
      default:
        return <Badge variant="outline" className="text-xs px-2 py-1">Unknown</Badge>;
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'partial':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'empty':
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  // ✅ UPDATED Render the selected section component - ADDED CEO AND CFO DASHBOARD HANDLING
  const renderSectionContent = () => {
    const section = sections.find(s => s.id === selectedSection);
    if (!section || !section.component) {
      return (
        <Card className="h-full flex items-center justify-center">
          <CardContent className="text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Section Not Available</h3>
            <p className="text-gray-500">This section is not yet implemented.</p>
          </CardContent>
        </Card>
      );
    }

    const Component = section.component;
    
    // Special handling for components that need specific props
    if (selectedSection === 'beneficialOwnerCertification') {
      return (
        <Component 
          data={userDashboardData?.[selectedSection]} 
          userName={userInfo?.name}
          userEmail={userInfo?.email}
        />
      );
    }
    
    if (selectedSection === 'informationSheet') {
      return (
        <Component 
          data={userDashboardData?.[selectedSection]} 
          userName={userInfo?.name}
          userEmail={userInfo?.email}
        />
      );
    }
    
    if (selectedSection === 'ddform') {
      return (
        <Component
          data={userDashboardData?.[selectedSection]}
          userName={userInfo?.name}
          userEmail={userInfo?.email}
        />
      );
    }

    if (selectedSection === 'loanDetails') {
      return (
        <Component 
          data={userDashboardData?.[selectedSection]}
          userName={userInfo?.name}
          userEmail={userInfo?.email}
        />
      );
    }

    // ✅ NEW HANDLING FOR CEO AND CFO DASHBOARDS
    if (selectedSection === 'ceoDashboard' || selectedSection === 'cfoDashboard') {
      return (
        <Component 
          data={userDashboardData?.[selectedSection]}
          userName={userInfo?.name}
          userEmail={userInfo?.email}
        />
      );
    }
    
    // Default for other components
    return (
      <Component 
        data={userDashboardData?.[selectedSection]} 
        userInfo={userInfo}
        loading={loading}
        userId={userId}
      />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading user details...</p>
        </div>
      </div>  
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-4xl mx-auto">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onBack}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Users</span>
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">User Details</h1>
                <p className="text-slate-600">Comprehensive view of user submissions</p>
              </div>
            </div>
          </div>

          {/* User Info Header */}
          {userInfo && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{userInfo.name || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{userInfo.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Joined</p>
                      <p className="font-medium">
                        {new Date(userInfo.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Completion</p>
                      <p className="font-medium">
                        {userDashboardData?.completionPercentage || 0}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons - Compact Layout */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3 flex-wrap">
                    {/* Approval Button for Form Completion */}
                    <Button
                      onClick={() => handleApproveFormCompletion(userId)}
                      disabled={actionLoading}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      {actionLoading ? 'Processing...' : 'Approve Form Access'}
                    </Button>

                    {/* Website Display Toggle Button */}
                    <Button
                      onClick={() => handleWebsiteDisplayToggle(userId)}
                      disabled={actionLoading}
                      variant="outline"
                      className={`px-6 py-2 rounded-lg border-2 transition-all duration-200 ${
                        userDashboardData?.isDisplayedOnWebsite 
                          ? 'border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400' 
                          : 'border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400'
                      }`}
                    >
                      {userDashboardData?.isDisplayedOnWebsite ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-2" />
                          Remove from Website
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-2" />
                          Display on Website
                        </>
                      )}
                    </Button>

                    {/* Compact Deal Status Component */}
                    <CompactDealStatus
                      userId={userId}
                      currentAmount={userDashboardData?.publicAmount || 0}
                      actionLoading={actionLoading}
                      onAmountUpdate={handleSetPublicAmount}
                    />
                  </div>

                  {/* Status Indicators */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        userDashboardData?.completionPercentage >= 100 ? 'bg-green-500' : 'bg-yellow-500'
                      }`}></div>
                      <span className="text-xs text-gray-600">
                        {userDashboardData?.completionPercentage >= 100 ? 'Complete' : 'Incomplete'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        userDashboardData?.isDisplayedOnWebsite ? 'bg-blue-500' : 'bg-gray-400'
                      }`}></div>
                      <span className="text-xs text-gray-600">
                        {userDashboardData?.isDisplayedOnWebsite ? 'On Website' : 'Not Published'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Content */}
          <div className="lg:col-span-3">
            {renderSectionContent()}
          </div>

          {/* Right Panel - Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Submission Progress</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                  <div className="space-y-2 p-4">
                    {sections.map((section, index) => {
                      const status = getSectionStatus(section.id);
                      const Icon = section.icon;
                      const isSelected = selectedSection === section.id;

                      return (
                        <Button
                          key={section.id}
                          variant={isSelected ? "default" : "ghost"}
                          className={`w-full justify-start h-auto p-3 text-left ${
                            isSelected 
                              ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white" 
                              : "hover:bg-slate-50"
                          }`}
                          onClick={() => setSelectedSection(section.id)}
                        >
                          <div className="flex items-start space-x-3 w-full min-w-0">
                            {/* Icon */}
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              isSelected 
                                ? "bg-white/20" 
                                : status === 'completed' 
                                  ? "bg-green-100" 
                                  : "bg-gray-100"
                            }`}>
                              <Icon className={`w-4 h-4 ${
                                isSelected 
                                  ? "text-white" 
                                  : status === 'completed' 
                                    ? "text-green-600" 
                                    : "text-gray-400"
                              }`} />
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-1">
                                <h4 className={`font-medium text-sm leading-tight ${
                                  isSelected ? "text-white" : "text-slate-900"
                                }`}>
                                  {section.title}
                                </h4>
                                <div className="flex-shrink-0 ml-2">
                                  {getStatusIcon(status)}
                                </div>
                              </div>
                              
                              <p className={`text-xs leading-relaxed mb-2 ${
                                isSelected ? "text-white/80" : "text-slate-500"
                              }`}>
                                {section.description}
                              </p>
                              
                              <div className="flex justify-start">
                                {getStatusBadge(status)}
                              </div>
                            </div>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Details;
