// src/components/admin/InvestorCEODashboardView.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  BarChart3,
  Building2,
  Calculator,
  TrendingUp,
  Users,
  Briefcase,
  PieChart,
  Target,
  Activity,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

const InvestorCEODashboardView = ({ investorId, loading }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');

  const months = ['apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'jan', 'feb', 'mar'];
  const monthLabels = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

  // State for managing collapsed sections
  const [collapsedSections, setCollapsedSections] = useState({
    // Financial Performance
    revenue: false,
    costOfGoodsSold: true,
    grossProfit: true,
    operatingExpenses: true,
    operatingProfit: true,
    otherIncome: true,
    financeExpense: true,
    netProfitBeforeTax: true,
    netProfitMargin: true,
    // Product Sales
    product1Sales: true,
    product2Sales: true,
    product3Sales: true,
    product4Sales: true,
    product5Sales: true,
    totalSalesByProduct: true,
    // Employee Information
    employeeCost: true,
    headcountMale: true,
    headcountFemale: true,
    totalHeadcount: true,
    // Cash Flow & Working Capital
    netOperatingCashFlow: true,
    netFinancingCashFlow: true,
    netInvestingCashFlow: true,
    cashAtEndOfMonth: true,
    accountsReceivable: true,
    daysReceivableOutstanding: true,
    overdueAccountsReceivable: true,
    overdueReceivablePercentage: true,
    inventory: true,
    daysInventoryOutstanding: true
  });

  // Toggle section collapse
  const toggleSection = (sectionKey) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // Expand all sections in a category
  const expandAllInCategory = (categoryFields) => {
    setCollapsedSections(prev => {
      const updated = { ...prev };
      categoryFields.forEach(field => {
        updated[field] = false;
      });
      return updated;
    });
  };

  // Collapse all sections in a category
  const collapseAllInCategory = (categoryFields) => {
    setCollapsedSections(prev => {
      const updated = { ...prev };
      categoryFields.forEach(field => {
        updated[field] = true;
      });
      return updated;
    });
  };

  // Fetch CEO Dashboard data
  useEffect(() => {
    const fetchCEODashboardData = async () => {
      if (!investorId) return;
      
      try {
        setDataLoading(true);
        setError('');
        
        const response = await fetch(`https://castle-backend.onrender.com/api/investor-dashboard/${investorId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const result = await response.json();
        
        if (result.success && result.data.ceoDashboard) {
          setDashboardData(result.data.ceoDashboard);
        } else {
          setError('No CEO Dashboard data available');
        }
      } catch (err) {
        console.error('Error fetching CEO dashboard data:', err);
        setError(err.message || 'Failed to load CEO Dashboard data');
      } finally {
        setDataLoading(false);
      }
    };

    fetchCEODashboardData();
  }, [investorId]);

  // Format currency
  const formatCurrency = (value) => {
    if (!value || isNaN(value)) return '₹0.00';
    return `₹${parseFloat(value).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Format percentage
  const formatPercentage = (value) => {
    if (!value || isNaN(value)) return '0.00%';
    return `${(parseFloat(value) * 100).toFixed(2)}%`;
  };

  // Calculate YTD totals
  const calculateYTDTotal = (fieldData, type = 'actual') => {
    if (!fieldData || !fieldData[type]) return 0;
    return months.reduce((total, month) => {
      return total + (parseFloat(fieldData[type][month]) || 0);
    }, 0);
  };

  // Enhanced render function with collapsible functionality
  const renderFinancialSection = (title, fieldName, icon, types = ['actual', 'target', 'lastYear'], isCalculated = false) => {
    const fieldData = dashboardData?.[fieldName];
    const isCollapsed = collapsedSections[fieldName];
    
    if (!fieldData) return null;

    return (
      <Card className="mb-4 transition-all duration-200 hover:shadow-md">
        <CardHeader 
          className="pb-3 cursor-pointer select-none hover:bg-slate-50 transition-colors duration-150 rounded-t-lg"
          onClick={() => toggleSection(fieldName)}
        >
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {icon}
              <span>{title}</span>
              <Badge variant="outline" className="ml-2">
                {isCalculated ? (
                  <>
                    <Calculator className="w-3 h-3 mr-1" />
                    Auto-calculated
                  </>
                ) : (
                  'Input Data'
                )}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              {isCollapsed ? (
                <ChevronRight className="w-5 h-5 text-slate-500 transition-transform duration-200" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-500 transition-transform duration-200" />
              )}
            </div>
          </CardTitle>
        </CardHeader>
        
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isCollapsed ? 'max-h-0' : 'max-h-[2000px]'
        }`}>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="border border-gray-200 px-3 py-2 text-left font-medium text-slate-700">Month</th>
                    {types.map(type => (
                      <th key={type} className="border border-gray-200 px-3 py-2 text-center font-medium text-slate-700 capitalize">
                        {type === 'lastYear' ? 'Last Year' : type}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monthLabels.map((monthLabel, index) => (
                    <tr key={months[index]} className="hover:bg-slate-25">
                      <td className="border border-gray-200 px-3 py-2 font-medium text-slate-800">
                        {monthLabel}
                      </td>
                      {types.map(type => {
                        const value = fieldData[type]?.[months[index]] || 0;
                        return (
                          <td key={type} className="border border-gray-200 px-3 py-2 text-center text-slate-600">
                            {fieldName === 'netProfitMargin' || fieldName === 'overdueReceivablePercentage' 
                              ? formatPercentage(value)
                              : formatCurrency(value)
                            }
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {/* YTD Total Row */}
                  <tr className="bg-slate-100 font-semibold">
                    <td className="border border-gray-200 px-3 py-2 text-slate-800">YTD Total</td>
                    {types.map(type => {
                      const ytdTotal = calculateYTDTotal(fieldData, type);
                      return (
                        <td key={type} className="border border-gray-200 px-3 py-2 text-center text-slate-800">
                          {fieldName === 'netProfitMargin' || fieldName === 'overdueReceivablePercentage'
                            ? formatPercentage(ytdTotal / 12) // Average for percentages
                            : formatCurrency(ytdTotal)
                          }
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  };

  // Category control buttons component
  const CategoryControls = ({ categoryName, categoryFields }) => (
    <div className="flex items-center space-x-2 mb-4">
      <button
        onClick={() => expandAllInCategory(categoryFields)}
        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md transition-colors duration-150 font-medium"
      >
        Expand All
      </button>
      <button
        onClick={() => collapseAllInCategory(categoryFields)}
        className="px-3 py-1 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md transition-colors duration-150 font-medium"
      >
        Collapse All
      </button>
    </div>
  );

  // Render summary cards
  const renderSummaryCards = () => {
    const summaryData = [
      {
        title: 'Total Revenue (YTD)',
        value: calculateYTDTotal(dashboardData?.revenue),
        icon: <DollarSign className="w-6 h-6 text-green-600" />,
        color: 'green'
      },
      {
        title: 'Gross Profit (YTD)',
        value: calculateYTDTotal(dashboardData?.grossProfit),
        icon: <TrendingUp className="w-6 h-6 text-blue-600" />,
        color: 'blue'
      },
      {
        title: 'Operating Profit (YTD)',
        value: calculateYTDTotal(dashboardData?.operatingProfit),
        icon: <BarChart3 className="w-6 h-6 text-purple-600" />,
        color: 'purple'
      },
      {
        title: 'Net Profit Before Tax (YTD)',
        value: calculateYTDTotal(dashboardData?.netProfitBeforeTax),
        icon: <Calculator className="w-6 h-6 text-indigo-600" />,
        color: 'indigo'
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summaryData.map((item, index) => (
          <Card key={index} className="relative overflow-hidden hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg bg-${item.color}-100`}>
                  {item.icon}
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600 mb-1">{item.title}</p>
                  <p className="text-lg font-bold text-slate-900">
                    {formatCurrency(item.value)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (loading || dataLoading) {
    return (
      <Card className="flex items-center justify-center h-96">
        <CardContent className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Loading CEO Dashboard</h3>
          <p className="text-slate-500">Fetching financial data...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!dashboardData) {
    return (
      <Card className="flex items-center justify-center h-96">
        <CardContent className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No CEO Dashboard Data</h3>
          <p className="text-slate-500">This investor hasn't completed their CEO Dashboard yet.</p>
        </CardContent>
      </Card>
    );
  }

  // Define category fields for bulk operations
  const financialFields = ['revenue', 'costOfGoodsSold', 'grossProfit', 'operatingExpenses', 'operatingProfit', 'otherIncome', 'financeExpense', 'netProfitBeforeTax', 'netProfitMargin'];
  const productFields = ['product1Sales', 'product2Sales', 'product3Sales', 'product4Sales', 'product5Sales', 'totalSalesByProduct'];
  const employeeFields = ['employeeCost', 'headcountMale', 'headcountFemale', 'totalHeadcount'];
  const cashFlowFields = ['netOperatingCashFlow', 'netFinancingCashFlow', 'netInvestingCashFlow', 'cashAtEndOfMonth', 'accountsReceivable', 'daysReceivableOutstanding', 'overdueAccountsReceivable', 'overdueReceivablePercentage', 'inventory', 'daysInventoryOutstanding'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">CEO Dashboard</h2>
          <p className="text-slate-600">Financial performance and business metrics overview</p>
        </div>
        <Badge className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Admin View
        </Badge>
      </div>

      {/* Summary Cards */}
      {renderSummaryCards()}

      <Separator />

      {/* Financial Performance Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-slate-800 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-green-600" />
            Financial Performance
          </h3>
          <CategoryControls categoryName="Financial Performance" categoryFields={financialFields} />
        </div>
        
        {renderFinancialSection(
          'Total Revenue', 
          'revenue', 
          <DollarSign className="w-5 h-5 text-green-600" />
        )}
        
        {renderFinancialSection(
          'Cost of Goods Sold', 
          'costOfGoodsSold', 
          <BarChart3 className="w-5 h-5 text-red-600" />
        )}
        
        {renderFinancialSection(
          'Gross Profit', 
          'grossProfit', 
          <TrendingUp className="w-5 h-5 text-blue-600" />,
          ['actual', 'target', 'lastYear'],
          true
        )}
        
        {renderFinancialSection(
          'Operating Expenses', 
          'operatingExpenses', 
          <Building2 className="w-5 h-5 text-orange-600" />
        )}
        
        {renderFinancialSection(
          'Operating Profit (EBIT)', 
          'operatingProfit', 
          <BarChart3 className="w-5 h-5 text-purple-600" />,
          ['actual', 'target', 'lastYear'],
          true
        )}
        
        {renderFinancialSection(
          'Other Income', 
          'otherIncome', 
          <TrendingUp className="w-5 h-5 text-green-600" />
        )}
        
        {renderFinancialSection(
          'Finance Expense', 
          'financeExpense', 
          <DollarSign className="w-5 h-5 text-red-600" />
        )}
        
        {renderFinancialSection(
          'Net Profit Before Tax', 
          'netProfitBeforeTax', 
          <Calculator className="w-5 h-5 text-indigo-600" />,
          ['actual', 'target', 'lastYear'],
          true
        )}
        
        {renderFinancialSection(
          'Net Profit Margin %', 
          'netProfitMargin', 
          <PieChart className="w-5 h-5 text-green-600" />,
          ['actual', 'target', 'lastYear'],
          true
        )}
      </div>

      <Separator />

      {/* Product Sales Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-slate-800 flex items-center">
            <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
            Sales by Product
          </h3>
          <CategoryControls categoryName="Product Sales" categoryFields={productFields} />
        </div>
        
        {renderFinancialSection(
          'Product 1 Sales', 
          'product1Sales', 
          <Briefcase className="w-5 h-5 text-blue-600" />,
          ['actual', 'target']
        )}
        
        {renderFinancialSection(
          'Product 2 Sales', 
          'product2Sales', 
          <Briefcase className="w-5 h-5 text-blue-600" />,
          ['actual', 'target']
        )}
        
        {renderFinancialSection(
          'Product 3 Sales', 
          'product3Sales', 
          <Briefcase className="w-5 h-5 text-blue-600" />,
          ['actual', 'target']
        )}
        
        {renderFinancialSection(
          'Product 4 Sales', 
          'product4Sales', 
          <Briefcase className="w-5 h-5 text-blue-600" />,
          ['actual', 'target']
        )}
        
        {renderFinancialSection(
          'Product 5 Sales', 
          'product5Sales', 
          <Briefcase className="w-5 h-5 text-blue-600" />,
          ['actual', 'target']
        )}
        
        {renderFinancialSection(
          'Total Sales by Product', 
          'totalSalesByProduct', 
          <Calculator className="w-5 h-5 text-blue-600" />,
          ['actual', 'target'],
          true
        )}
      </div>

      <Separator />

      {/* Employee Information Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-slate-800 flex items-center">
            <Users className="w-5 h-5 mr-2 text-purple-600" />
            Employee Information
          </h3>
          <CategoryControls categoryName="Employee Information" categoryFields={employeeFields} />
        </div>
        
        {renderFinancialSection(
          'Employee Cost', 
          'employeeCost', 
          <Users className="w-5 h-5 text-purple-600" />,
          ['actual']
        )}
        
        {renderFinancialSection(
          'Male Headcount', 
          'headcountMale', 
          <Users className="w-5 h-5 text-blue-600" />,
          ['actual']
        )}
        
        {renderFinancialSection(
          'Female Headcount', 
          'headcountFemale', 
          <Users className="w-5 h-5 text-pink-600" />,
          ['actual']
        )}
        
        {renderFinancialSection(
          'Total Headcount', 
          'totalHeadcount', 
          <Calculator className="w-5 h-5 text-purple-600" />,
          ['actual'],
          true
        )}
      </div>

      <Separator />

      {/* Cash Flow & Working Capital Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-slate-800 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-indigo-600" />
            Cash Flow & Working Capital
          </h3>
          <CategoryControls categoryName="Cash Flow & Working Capital" categoryFields={cashFlowFields} />
        </div>
        
        {renderFinancialSection(
          'Net Operating Cash Flow', 
          'netOperatingCashFlow', 
          <TrendingUp className="w-5 h-5 text-green-600" />,
          ['actual']
        )}
        
        {renderFinancialSection(
          'Net Financing Cash Flow', 
          'netFinancingCashFlow', 
          <DollarSign className="w-5 h-5 text-blue-600" />,
          ['actual']
        )}
        
        {renderFinancialSection(
          'Net Investing Cash Flow', 
          'netInvestingCashFlow', 
          <BarChart3 className="w-5 h-5 text-orange-600" />,
          ['actual']
        )}
        
        {renderFinancialSection(
          'Cash at End of Month', 
          'cashAtEndOfMonth', 
          <DollarSign className="w-5 h-5 text-green-600" />,
          ['actual']
        )}
        
        {renderFinancialSection(
          'Accounts Receivable', 
          'accountsReceivable', 
          <Building2 className="w-5 h-5 text-blue-600" />,
          ['actual']
        )}
        
        {renderFinancialSection(
          'Days Receivable Outstanding', 
          'daysReceivableOutstanding', 
          <BarChart3 className="w-5 h-5 text-orange-600" />,
          ['actual']
        )}
        
        {renderFinancialSection(
          'Overdue Accounts Receivable', 
          'overdueAccountsReceivable', 
          <AlertCircle className="w-5 h-5 text-red-600" />,
          ['actual']
        )}
        
        {renderFinancialSection(
          '% Overdue Receivable', 
          'overdueReceivablePercentage', 
          <Calculator className="w-5 h-5 text-red-600" />,
          ['actual'],
          true
        )}
        
        {renderFinancialSection(
          'Inventory', 
          'inventory', 
          <Building2 className="w-5 h-5 text-purple-600" />,
          ['actual']
        )}
        
        {renderFinancialSection(
          'Days Inventory Outstanding', 
          'daysInventoryOutstanding', 
          <BarChart3 className="w-5 h-5 text-purple-600" />,
          ['actual']
        )}
      </div>
    </div>
  );
};

export default InvestorCEODashboardView;
