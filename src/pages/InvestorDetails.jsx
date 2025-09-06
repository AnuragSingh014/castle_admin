// src/components/InvestorDetails.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';
import InvestorCEODashboardView from '@/components/admin/InvestorCEODashboardView'
// Import the AdminInvestorProfileView component
import InvestorProfileView from '@/components/admin/InvestorProfileView';
import InvestorCFODashboardView from '@/components/admin/InvestorCFODashboardView';
import InvestorCFODashboardCharts from '@/components/admin/InvestorCFODashboardCharts';
import InvestorCEODashboardCharts from '@/components/admin/InvestorCEODashboardCharts';
import InvestorInvestmentPortfolioView from '@/components/admin/InvestorInvestmentPortfolioView';
import { 
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
    Building2,
    Target,
    DollarSign,
    PieChart,
    BarChart3,
    Briefcase,
    Shield,
    FileText,
    CheckCircle,
    Users,
    Award,
    Activity,
    LineChart
  } from 'lucide-react';

// Compact Investor Status Component
const CompactInvestorStatus = ({ 
  investorId, 
  currentStatus, 
  actionLoading, 
  onStatusUpdate 
}) => {
  const [selectedStatus, setSelectedStatus] = useState('active');

  const investorStatuses = [
    { value: 'active', label: 'Active Investor', color: 'green' },
    { value: 'inactive', label: 'Inactive', color: 'gray' },
    { value: 'suspended', label: 'Suspended', color: 'red' },
    { value: 'pending', label: 'Pending Verification', color: 'yellow' }
  ];

  const handleSubmit = async () => {
    await onStatusUpdate(investorId, selectedStatus);
  };

  const getCurrentStatusData = () => {
    return investorStatuses.find(status => status.value === currentStatus) || investorStatuses[0];
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Status Dropdown */}
      <select
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {investorStatuses.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={actionLoading}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg"
      >
        {actionLoading ? 'Updating...' : 'Update Status'}
      </Button>

      {/* Current Status Display */}
      {currentStatus && (
        <div className="text-xs text-gray-500 ml-2 flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${
            getCurrentStatusData().color === 'green' ? 'bg-green-500' :
            getCurrentStatusData().color === 'yellow' ? 'bg-yellow-500' :
            getCurrentStatusData().color === 'red' ? 'bg-red-500' : 'bg-gray-500'
          }`}></div>
          <span>Current: {getCurrentStatusData().label}</span>
        </div>
      )}
    </div>
  );
};

const InvestorDetails = ({ investorId, onBack }) => {
  const [selectedSection, setSelectedSection] = useState('investorProfile');
  const [investorDashboardData, setInvestorDashboardData] = useState(null);
  const [investorInfo, setInvestorInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // ✅ FIXED: Toggle Analytics Access for Investor (CEO and CFO Dashboards)
  const handleToggleInvestorAnalyticsAccess = async (investorId) => {
    setActionLoading(true);
    
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        throw new Error('No authentication token found');
      }
  
      // Check current status - if either is approved, we'll disable both
      const ceoCurrentlyApproved = investorDashboardData?.approvals?.ceoDashboard === 'approved';
      const cfoCurrentlyApproved = investorDashboardData?.approvals?.cfoDashboard === 'approved';
      const currentlyEnabled = ceoCurrentlyApproved || cfoCurrentlyApproved;
      
      const newState = currentlyEnabled ? 'locked' : 'approved';
      
      console.log('Toggling investor analytics access for:', investorId);
      console.log('Current CEO status:', ceoCurrentlyApproved);
      console.log('Current CFO status:', cfoCurrentlyApproved);
      console.log('New state will be:', newState);
      
      // Call both investor approval endpoints
      const [ceoResponse, cfoResponse] = await Promise.all([
        fetch(`https://castle-backend.onrender.com/api/admin/investors/${investorId}/approve-ceo-dashboard`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            state: newState
          })
        }),
        fetch(`https://castle-backend.onrender.com/api/admin/investors/${investorId}/approve-cfo-dashboard`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            state: newState
          })
        })
      ]);

      if (!ceoResponse.ok) {
        throw new Error(`Failed to update investor CEO dashboard: ${ceoResponse.status}`);
      }

      if (!cfoResponse.ok) {
        throw new Error(`Failed to update investor CFO dashboard: ${cfoResponse.status}`);
      }
      
      // ✅ FIXED: Reload the investor data to show updated status
      await refreshInvestorData();
      
      alert(`✅ Investor analytics access ${newState === 'approved' ? 'enabled' : 'disabled'} successfully!`);
      
    } catch (err) {
      console.error('Error toggling investor analytics access:', err);
      alert('Failed to toggle investor analytics access. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ FIXED: Function to refresh investor data
  const refreshInvestorData = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      
      // Fetch BOTH endpoints again to get fresh data
      const [investorResponse, dashboardResponse] = await Promise.all([
        fetch(`https://castle-backend.onrender.com/api/admin/investors/${investorId}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' 
          }
        }),
        fetch(`https://castle-backend.onrender.com/api/investor-dashboard/${investorId}`)
      ]);
      
      if (investorResponse.ok) {
        const investorData = await investorResponse.json();
        setInvestorInfo(investorData.investor);
        
        // ✅ CRITICAL FIX: Update dashboard data with fresh approvals
        if (investorData.dashboard) {
          setInvestorDashboardData(investorData.dashboard);
        }
      }
      
      // Also fetch from dashboard endpoint if available
      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        if (dashboardData.success && dashboardData.data) {
          setInvestorDashboardData(dashboardData.data);
        }
      }
      
      console.log('Investor data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing investor data:', error);
    }
  };

  // ✅ FIXED: Navigation sections for investor with proper structure
  const sections = [
    {
      id: 'investorProfile',
      title: 'Investor Profile',
      icon: User,
      description: 'Personal and professional info',
      component: InvestorProfileView
    },
    {
      id: 'investmentPortfolio', // ✅ FIXED: Added missing id
      title: 'Investment Portfolio', // ✅ FIXED: Changed name to title
      icon: TrendingUp,
      description: 'investment portfolio',
      component: InvestorInvestmentPortfolioView // ✅ FIXED: Added missing component
    },
    {
      id: 'ceoDashboard',
      title: 'CEO Analytics',
      icon: Building2,
      description: 'Financial performance data',
      component: InvestorCEODashboardView
    },
    {
      id: 'cfoDashboard',
      title: 'CFO Analytics',
      icon: BarChart3,
      description: 'Balance sheet and ratios',
      component: InvestorCFODashboardView
    },
    {
      id: 'ceoCharts',
      title: 'CEO Charts',
      icon: Activity,
      description: 'Business performance charts',
      component: InvestorCEODashboardCharts
    },
    {
      id: 'cfoCharts',
      title: 'CFO Charts',
      icon: TrendingUp,
      description: 'Financial analytics and trends',
      component: InvestorCFODashboardCharts
    },
  ];

  // Fetch investor data and dashboard information
  useEffect(() => {
    const fetchInvestorData = async () => {
      if (!investorId) return;
  
      setLoading(true);
      setError('');
  
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) {
          throw new Error('No authentication token found');
        }
  
        // Fetch BOTH endpoints in parallel
        const [investorResponse, dashboardResponse] = await Promise.all([
            fetch(`https://castle-backend.onrender.com/api/admin/investors/${investorId}`, {
              headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' 
              }
            }),
            fetch(`https://castle-backend.onrender.com/api/investor-dashboard/${investorId}`)
          ]);
          
        // Handle investor basic info
        if (!investorResponse.ok) {
          throw new Error(`Failed to fetch investor data: ${investorResponse.status}`);
        }
        const investorData = await investorResponse.json();
        setInvestorInfo(investorData.investor);
  
        // Handle dashboard data
        if (dashboardResponse.ok) {
          const dashboardData = await dashboardResponse.json();
          setInvestorDashboardData(dashboardData.success ? dashboardData.data : null);
        } else {
          setInvestorDashboardData(null);
        }
  
      } catch (err) {
        console.error('Error fetching investor data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchInvestorData();
  }, [investorId]);

  // Get completion status for a section
  const getSectionStatus = (sectionId) => {
    if (!investorDashboardData) return 'empty';
    
    const sectionData = investorDashboardData[sectionId];
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

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200 text-xs px-2 py-1">Completed</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-100 text-green-800 border-green-200 text-xs px-2 py-1">Partial</Badge>;
      case 'empty':
        return <Badge className="bg-gray-100 text-green-800 border-green-200 text-xs px-2 py-1">Not Started</Badge>;
      default:
        return <Badge variant="outline" className="text-xs px-2 py-1">Unknown</Badge>;
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        // return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'partial':
        // return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'empty':
        // return <AlertCircle className="w-4 h-4 text-gray-400" />;
      default:
        // return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  // ✅ FIXED: Render the selected section component
  const renderSectionContent = () => {
    const section = sections.find(s => s.id === selectedSection);
    if (!section) {
      return (
        <Card className="h-full flex items-center justify-center">
          <CardContent className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Section Not Found</h3>
            <p className="text-gray-500">The requested section could not be found.</p>
          </CardContent>
        </Card>
      );
    }

    // If no component is assigned, show placeholder
    if (!section.component) {
      return (
        <Card className="h-full flex items-center justify-center">
          <CardContent className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              {section.icon && React.createElement(section.icon, { className: "w-8 h-8 text-white" })}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{section.title}</h3>
            <p className="text-gray-500 mb-4">{section.description}</p>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-sm text-blue-700 dark:text-blue-300">
              Component placeholder: <code>{selectedSection}</code>
            </div>
            <p className="text-xs text-gray-400 mt-2">This section will be implemented soon</p>
          </CardContent>
        </Card>
      );
    }

    // Render the actual component
    const Component = section.component;
    
    // Special handling for investorProfile section
    if (selectedSection === 'investorProfile') {
      return (
        <Component 
          data={investorDashboardData?.investorProfile} 
          dashboardData={investorDashboardData}
        />
      );
    }
    
    // ✅ FIXED: Special handling for investmentPortfolio section
    if (selectedSection === 'investmentPortfolio') {
      return (
        <Component 
          investorId={investorId}
        />
      );
    }
    
    // Default for other components
    return (
      <Component 
        data={investorDashboardData?.[selectedSection]} 
        investorInfo={investorInfo}
        loading={loading}
        investorId={investorId}
      />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading investor details...</p>
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
              <span>Back to Investors</span>
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Investor Details</h1>
                <p className="text-slate-600">Comprehensive view of investor profile and data</p>
              </div>
            </div>
          </div>

          {/* Investor Info Header */}
          {investorInfo && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{investorInfo.name || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{investorInfo.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Joined</p>
                      <p className="font-medium">
                        {new Date(investorInfo.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="font-medium">
                        {investorDashboardData?.status || 'Active'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ✅ FIXED: Action Button for Analytics Toggle */}
                <div className="flex items-center justify-start pt-4 border-t border-gray-200">
                  <Button
                    onClick={() => handleToggleInvestorAnalyticsAccess(investorId)}
                    disabled={actionLoading}
                    variant="outline"
                    className={`px-6 py-2 rounded-lg border-2 transition-all duration-200 ${
                      (investorDashboardData?.approvals?.ceoDashboard === 'approved' || investorDashboardData?.approvals?.cfoDashboard === 'approved')
                        ? 'border-orange-300 text-orange-700 hover:bg-orange-50 hover:border-orange-400' 
                        : 'border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400'
                    }`}
                  >
                    {actionLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </>
                    ) : (investorDashboardData?.approvals?.ceoDashboard === 'approved' || investorDashboardData?.approvals?.cfoDashboard === 'approved') ? (
                      <>
                        <LineChart className="w-4 h-4 mr-2" />
                        Disable Analytics
                      </>
                    ) : (
                      <>
                        <LineChart className="w-4 h-4 mr-2" />
                        Enable Analytics
                      </>
                    )}
                  </Button>

                  {/* Debug Info - Remove in production */}
                  <div className="ml-4 text-xs text-gray-500">
                    CEO: {investorDashboardData?.approvals?.ceoDashboard || 'locked'} | 
                    CFO: {investorDashboardData?.approvals?.cfoDashboard || 'locked'}
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
                <CardTitle className="text-lg">Investor Dashboard</CardTitle>
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
                              ? "bg-gradient-to-r from-blue-500 to-green-500 text-white" 
                              : "hover:bg-slate-50"
                          }`}
                          onClick={() => setSelectedSection(section.id)}
                        >
                          <div className="flex items-start space-x-3 w-full min-w-0">
                            {/* Icon */}
                            {/* Icon */}
<div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
  isSelected ? "bg-white/20" : "bg-green-100"
}`}>
  <Icon className={`w-4 h-4 ${
    isSelected ? "text-white" : "text-green-600"
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

export default InvestorDetails;
