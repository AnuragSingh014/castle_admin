// src/components/admin/InvestorCFODashboardView.jsx
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
  PieChart,
  Briefcase,
  Activity,
  Target
} from 'lucide-react';

const InvestorCFODashboardView = ({ investorId, loading }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');

  const months = ['apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'jan', 'feb', 'mar'];
  const monthLabels = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

  // Fetch CFO Dashboard data
  useEffect(() => {
    const fetchCFODashboardData = async () => {
      if (!investorId) return;
      
      try {
        setDataLoading(true);
        setError('');
        
        const response = await fetch(`https://castle-backend.onrender.com/api/investor-dashboard/${investorId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const result = await response.json();
        
        if (result.success && result.data.cfoDashboard) {
          setDashboardData(result.data.cfoDashboard);
        } else {
          setError('No CFO Dashboard data available');
        }
      } catch (err) {
        console.error('Error fetching CFO dashboard data:', err);
        setError(err.message || 'Failed to load CFO Dashboard data');
      } finally {
        setDataLoading(false);
      }
    };

    fetchCFODashboardData();
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

  // Format ratio
  const formatRatio = (value) => {
    if (!value || isNaN(value)) return '0.00';
    return parseFloat(value).toFixed(2);
  };

  // Calculate YTD totals
  const calculateYTDTotal = (fieldData, type = 'actual') => {
    if (!fieldData || !fieldData[type]) return 0;
    return months.reduce((total, month) => {
      return total + (parseFloat(fieldData[type][month]) || 0);
    }, 0);
  };

  // Render financial section with table
  const renderFinancialSection = (title, fieldName, icon, types = ['actual', 'target', 'lastYear'], isCalculated = false, isRatio = false, isPercentage = false) => {
    const fieldData = dashboardData?.[fieldName];
    
    if (!fieldData) return null;

    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
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
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                          {isPercentage 
                            ? formatPercentage(value)
                            : isRatio 
                            ? formatRatio(value)
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
                        {isPercentage
                          ? formatPercentage(ytdTotal / 12) // Average for percentages
                          : isRatio
                          ? formatRatio(ytdTotal / 12) // Average for ratios
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
      </Card>
    );
  };

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
        title: 'Total Assets (Latest)',
        value: dashboardData?.totalAssets?.actual?.mar || 0,
        icon: <Briefcase className="w-6 h-6 text-purple-600" />,
        color: 'purple'
      },
      {
        title: 'Current Ratio (Latest)',
        value: dashboardData?.currentRatio?.actual?.mar || 0,
        icon: <Calculator className="w-6 h-6 text-indigo-600" />,
        color: 'indigo',
        isRatio: true
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summaryData.map((item, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg bg-${item.color}-100`}>
                  {item.icon}
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600 mb-1">{item.title}</p>
                  <p className="text-lg font-bold text-slate-900">
                    {item.isRatio ? formatRatio(item.value) : formatCurrency(item.value)}
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
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-600" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Loading CFO Dashboard</h3>
          <p className="text-slate-500">Fetching financial statements and ratios...</p>
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
            <PieChart className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No CFO Dashboard Data</h3>
          <p className="text-slate-500">This investor hasn't completed their CFO Dashboard yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">CFO Dashboard</h2>
          <p className="text-slate-600">Balance sheet, cash flow and financial ratios overview</p>
        </div>
        <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Admin View
        </Badge>
      </div>

      {/* Summary Cards */}
      {renderSummaryCards()}

      <Separator />

      {/* P&L Section */}
      <div>
        <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-green-600" />
          Profit & Loss Statement
        </h3>
        
        {renderFinancialSection(
          'Revenue', 
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
          true,
          false,
          true
        )}
      </div>

      <Separator />

      {/* Cash Flow Section */}
      <div>
        <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-green-600" />
          Cash Flow Statement
        </h3>
        
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
      </div>

      <Separator />

      {/* Balance Sheet Section */}
      <div>
        <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
          <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
          Balance Sheet
        </h3>
        
        {renderFinancialSection(
          'Fixed Assets', 
          'fixedAssets', 
          <Building2 className="w-5 h-5 text-gray-600" />,
          ['actual']
        )}
        
        {renderFinancialSection(
          'Current Assets', 
          'currentAssets', 
          <PieChart className="w-5 h-5 text-blue-600" />,
          ['actual']
        )}
        
        {renderFinancialSection(
          'Other Assets', 
          'otherAssets', 
          <BarChart3 className="w-5 h-5 text-purple-600" />,
          ['actual']
        )}
        
        {renderFinancialSection(
          'Total Assets', 
          'totalAssets', 
          <Calculator className="w-5 h-5 text-blue-600" />,
          ['actual'],
          true
        )}
        
        {renderFinancialSection(
          'Current Liabilities', 
          'currentLiabilities', 
          <AlertCircle className="w-5 h-5 text-red-600" />,
          ['actual']
        )}
        
        {renderFinancialSection(
          'Long Term Liabilities', 
          'longTermLiabilities', 
          <BarChart3 className="w-5 h-5 text-orange-600" />,
          ['actual']
        )}
        
        {renderFinancialSection(
          'Equity', 
          'equity', 
          <TrendingUp className="w-5 h-5 text-green-600" />,
          ['actual']
        )}
        
        {renderFinancialSection(
          'Total Liabilities & Equity', 
          'totalLiabilitiesAndEquity', 
          <Calculator className="w-5 h-5 text-purple-600" />,
          ['actual'],
          true
        )}
      </div>

      <Separator />

      {/* Working Capital Section */}
      <div>
        <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-indigo-600" />
          Working Capital Management
        </h3>
        
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
          true,
          false,
          true
        )}
        
        {renderFinancialSection(
          'Accounts Payable', 
          'accountsPayable', 
          <DollarSign className="w-5 h-5 text-orange-600" />,
          ['actual']
        )}
        
        {renderFinancialSection(
          'Days Payable Outstanding', 
          'daysPayableOutstanding', 
          <BarChart3 className="w-5 h-5 text-green-600" />,
          ['actual']
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

      <Separator />

      {/* Financial Ratios Section */}
      <div>
        <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
          <Calculator className="w-5 h-5 mr-2 text-green-600" />
          Financial Ratios
        </h3>
        
        {renderFinancialSection(
          'Current Ratio', 
          'currentRatio', 
          <TrendingUp className="w-5 h-5 text-blue-600" />,
          ['actual'],
          true,
          true
        )}
        
        {renderFinancialSection(
          'Quick Ratio', 
          'quickRatio', 
          <BarChart3 className="w-5 h-5 text-green-600" />,
          ['actual'],
          true,
          true
        )}
        
        {renderFinancialSection(
          'Debt : Equity Ratio', 
          'debtEquityRatio', 
          <PieChart className="w-5 h-5 text-orange-600" />,
          ['actual'],
          true,
          true
        )}
      </div>
    </div>
  );
};

export default InvestorCFODashboardView;
