// src/components/admin/AdminCFODashboardView.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Activity
} from 'lucide-react';

const AdminCFODashboardView = ({ data, userName, userEmail }) => {
  const months = ['apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'jan', 'feb', 'mar'];
  const monthLabels = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

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

  // Format ratio (for financial ratios)
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

  // ✅ REMOVED DATA CHECKING - ALWAYS RENDER ALL SECTIONS
  const renderFinancialSection = (title, fieldName, icon, types = ['actual', 'target', 'lastYear'], isCalculated = false, isRatio = false) => {
    const fieldData = data?.[fieldName] || {};
    
    // ✅ CREATE DEFAULT STRUCTURE IF DATA DOESN'T EXIST
    const defaultData = {};
    types.forEach(type => {
      defaultData[type] = {};
      months.forEach(month => {
        defaultData[type][month] = fieldData[type]?.[month] || '';
      });
    });

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
                      const value = defaultData[type]?.[months[index]] || 0;
                      return (
                        <td key={type} className="border border-gray-200 px-3 py-2 text-center text-slate-600">
                          {isRatio && (fieldName.includes('Ratio') || fieldName.includes('ratio'))
                            ? formatRatio(value)
                            : (fieldName === 'netProfitMargin' || fieldName === 'overdueReceivablePercentage') 
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
                        {isRatio && (fieldName.includes('Ratio') || fieldName.includes('ratio'))
                          ? formatRatio(ytdTotal / 12) // Average for ratios
                          : (fieldName === 'netProfitMargin' || fieldName === 'overdueReceivablePercentage')
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
      </Card>
    );
  };

  // Render summary cards
  const renderSummaryCards = () => {
    const summaryData = [
      {
        title: 'Total Assets (YTD)',
        value: calculateYTDTotal(data?.totalAssets),
        icon: <Building2 className="w-6 h-6 text-blue-600" />,
        color: 'blue'
      },
      {
        title: 'Total Liabilities & Equity (YTD)',
        value: calculateYTDTotal(data?.totalLiabilitiesAndEquity),
        icon: <PieChart className="w-6 h-6 text-red-600" />,
        color: 'red'
      },
      {
        title: 'Net Operating Cash Flow (YTD)',
        value: calculateYTDTotal(data?.netOperatingCashFlow),
        icon: <TrendingUp className="w-6 h-6 text-green-600" />,
        color: 'green'
      },
      {
        title: 'Net Profit Before Tax (YTD)',
        value: calculateYTDTotal(data?.netProfitBeforeTax),
        icon: <Calculator className="w-6 h-6 text-indigo-600" />,
        color: 'indigo'
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

  if (!data) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No CFO Dashboard Data</h3>
            <p className="text-gray-500">This company hasn't submitted CFO dashboard information yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  console.log('Admin CFO Dashboard Data:', data); // ✅ DEBUG LOG

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">CFO Dashboard</h2>
          <p className="text-slate-600">Financial statements, balance sheet data, and financial ratios</p>
          <div className="text-sm text-gray-600 mt-2">
            <p>CFO: {userName}</p>
            <p>Email: {userEmail}</p>
          </div>
        </div>
        <Badge className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Admin View
        </Badge>
      </div>

      {/* Summary Cards */}
      {renderSummaryCards()}

      <Separator />

      {/* ✅ ALWAYS RENDER ALL SECTIONS - MATCHING YOUR FRONTEND STRUCTURE */}
      {/* P&L Statement Section */}
      <div>
        <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-green-600" />
          Profit & Loss Statement
        </h3>

        {renderFinancialSection('Revenue', 'revenue', <DollarSign className="w-5 h-5 text-green-600" />)}
        {renderFinancialSection('Cost of Goods Sold', 'costOfGoodsSold', <BarChart3 className="w-5 h-5 text-red-600" />)}
        {renderFinancialSection('Gross Profit', 'grossProfit', <TrendingUp className="w-5 h-5 text-blue-600" />, ['actual', 'target', 'lastYear'], true)}
        {renderFinancialSection('Total Operating Expenses', 'operatingExpenses', <Building2 className="w-5 h-5 text-orange-600" />)}
        {renderFinancialSection('Operating Profit (EBIT)', 'operatingProfit', <BarChart3 className="w-5 h-5 text-purple-600" />, ['actual', 'target', 'lastYear'], true)}
        {renderFinancialSection('Other Non-Operating Income/(Expense)', 'otherIncome', <TrendingUp className="w-5 h-5 text-green-600" />)}
        {renderFinancialSection('Finance Expense', 'financeExpense', <DollarSign className="w-5 h-5 text-red-600" />)}
        {renderFinancialSection('Net Profit Before Tax', 'netProfitBeforeTax', <Calculator className="w-5 h-5 text-indigo-600" />, ['actual', 'target', 'lastYear'], true)}
        {renderFinancialSection('Net Profit Margin %', 'netProfitMargin', <BarChart3 className="w-5 h-5 text-green-600" />, ['actual', 'target', 'lastYear'], true)}
      </div>

      <Separator />

      {/* Cash Flow Statement Section */}
      <div>
        <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
          Cash Flow Statement
        </h3>

        {renderFinancialSection('Net Operating Cash Flow', 'netOperatingCashFlow', <TrendingUp className="w-5 h-5 text-green-600" />, ['actual'])}
        {renderFinancialSection('Net Financing Cash Flow', 'netFinancingCashFlow', <DollarSign className="w-5 h-5 text-blue-600" />, ['actual'])}
        {renderFinancialSection('Net Investing Cash Flow', 'netInvestingCashFlow', <BarChart3 className="w-5 h-5 text-orange-600" />, ['actual'])}
        {renderFinancialSection('Cash at End of Month', 'cashAtEndOfMonth', <DollarSign className="w-5 h-5 text-green-600" />, ['actual'])}
      </div>

      <Separator />

      {/* Balance Sheet - Assets Section */}
      <div>
        <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
          <Building2 className="w-5 h-5 mr-2 text-blue-600" />
          Balance Sheet - Assets
        </h3>

        {renderFinancialSection('Fixed Assets', 'fixedAssets', <Building2 className="w-5 h-5 text-gray-600" />, ['actual'])}
        {renderFinancialSection('Current Assets', 'currentAssets', <PieChart className="w-5 h-5 text-blue-600" />, ['actual'])}
        {renderFinancialSection('Other Assets', 'otherAssets', <BarChart3 className="w-5 h-5 text-purple-600" />, ['actual'])}
        {renderFinancialSection('Total Assets', 'totalAssets', <Calculator className="w-5 h-5 text-blue-600" />, ['actual'], true)}
      </div>

      <Separator />

      {/* Balance Sheet - Liabilities & Equity Section */}
      <div>
        <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
          <PieChart className="w-5 h-5 mr-2 text-red-600" />
          Balance Sheet - Liabilities & Equity
        </h3>

        {renderFinancialSection('Current Liabilities', 'currentLiabilities', <AlertCircle className="w-5 h-5 text-red-600" />, ['actual'])}
        {renderFinancialSection('Long Term Liabilities', 'longTermLiabilities', <BarChart3 className="w-5 h-5 text-orange-600" />, ['actual'])}
        {renderFinancialSection('Equity', 'equity', <TrendingUp className="w-5 h-5 text-green-600" />, ['actual'])}
        {renderFinancialSection('Total Liabilities & Equity', 'totalLiabilitiesAndEquity', <Calculator className="w-5 h-5 text-purple-600" />, ['actual'], true)}
      </div>

      <Separator />

      {/* Working Capital Management Section */}
      <div>
        <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-indigo-600" />
          Working Capital Management
        </h3>

        {renderFinancialSection('Accounts Receivable', 'accountsReceivable', <Building2 className="w-5 h-5 text-blue-600" />, ['actual'])}
        {renderFinancialSection('Days Receivable Outstanding', 'daysReceivableOutstanding', <BarChart3 className="w-5 h-5 text-orange-600" />, ['actual'])}
        {renderFinancialSection('Overdue Accounts Receivable', 'overdueAccountsReceivable', <AlertCircle className="w-5 h-5 text-red-600" />, ['actual'])}
        {renderFinancialSection('% of Overdue Receivable', 'overdueReceivablePercentage', <Calculator className="w-5 h-5 text-red-600" />, ['actual'], true)}
        {renderFinancialSection('Accounts Payable', 'accountsPayable', <DollarSign className="w-5 h-5 text-orange-600" />, ['actual'])}
        {renderFinancialSection('Days Payable Outstanding', 'daysPayableOutstanding', <BarChart3 className="w-5 h-5 text-green-600" />, ['actual'])}
        {renderFinancialSection('Inventory', 'inventory', <Building2 className="w-5 h-5 text-purple-600" />, ['actual'])}
        {renderFinancialSection('Days Inventory Outstanding', 'daysInventoryOutstanding', <BarChart3 className="w-5 h-5 text-purple-600" />, ['actual'])}
      </div>

      <Separator />

      {/* Financial Ratios Section */}
      <div>
        <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
          <Calculator className="w-5 h-5 mr-2 text-green-600" />
          Financial Ratios
        </h3>

        {renderFinancialSection('Current Ratio', 'currentRatio', <TrendingUp className="w-5 h-5 text-blue-600" />, ['actual'], true, true)}
        {renderFinancialSection('Quick Ratio', 'quickRatio', <BarChart3 className="w-5 h-5 text-green-600" />, ['actual'], true, true)}
        {renderFinancialSection('Debt : Equity Ratio', 'debtEquityRatio', <PieChart className="w-5 h-5 text-orange-600" />, ['actual'], true, true)}
      </div>
    </div>
  );
};

export default AdminCFODashboardView;
