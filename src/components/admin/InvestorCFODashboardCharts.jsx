// src/components/admin/InvestorCFODashboardCharts.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Loader2, 
  AlertCircle, 
  BarChart3, 
  TrendingUp, 
  Calculator, 
  DollarSign,
  Activity,
  PieChart as PieChartIcon
} from 'lucide-react';

const InvestorCFODashboardCharts = ({ investorId, loading }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('monthly');

  // Fetch CFO Dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!investorId) return;
      
      try {
        setDataLoading(true);
        setError('');
        
        const response = await fetch(`http://localhost:5000/api/investor-dashboard/${investorId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const result = await response.json();
        
        if (result.success && result.data.cfoDashboard) {
          setDashboardData(result.data.cfoDashboard);
        } else {
          setError('No CFO Dashboard data available for charts');
        }
      } catch (err) {
        console.error('Error fetching CFO dashboard data:', err);
        setError(err.message || 'Failed to load CFO Dashboard chart data');
      } finally {
        setDataLoading(false);
      }
    };

    fetchDashboardData();
  }, [investorId]);

  const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  const monthKeys = ['apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'jan', 'feb', 'mar'];

  // Format currency for display
  const formatCurrency = (value) => {
    if (!value || isNaN(value)) return '₹0';
    return `₹${(value / 1000).toFixed(1)}K`;
  };

  // Format percentage
  const formatPercentage = (value) => {
    if (!value || isNaN(value)) return '0%';
    return `${(parseFloat(value) * 100).toFixed(1)}%`;
  };

  // Prepare chart data for Monthly Dashboard
  const prepareMonthlyChartData = () => {
    if (!dashboardData) return [];

    return months.map((month, index) => {
      const monthKey = monthKeys[index];
      return {
        month,
        Revenue: parseFloat(dashboardData.revenue?.actual?.[monthKey]) || 0,
        RevenueTarget: parseFloat(dashboardData.revenue?.target?.[monthKey]) || 0,
        RevenueLastYear: parseFloat(dashboardData.revenue?.lastYear?.[monthKey]) || 0,
        GrossProfit: parseFloat(dashboardData.grossProfit?.actual?.[monthKey]) || 0,
        GrossProfitTarget: parseFloat(dashboardData.grossProfit?.target?.[monthKey]) || 0,
        OperatingProfit: parseFloat(dashboardData.operatingProfit?.actual?.[monthKey]) || 0,
        OperatingProfitTarget: parseFloat(dashboardData.operatingProfit?.target?.[monthKey]) || 0,
        NetProfitBeforeTax: parseFloat(dashboardData.netProfitBeforeTax?.actual?.[monthKey]) || 0,
        NetProfitMargin: parseFloat(dashboardData.netProfitMargin?.actual?.[monthKey]) || 0,
        CurrentRatio: parseFloat(dashboardData.currentRatio?.actual?.[monthKey]) || 0,
        QuickRatio: parseFloat(dashboardData.quickRatio?.actual?.[monthKey]) || 0,
        DebtEquityRatio: parseFloat(dashboardData.debtEquityRatio?.actual?.[monthKey]) || 0
      };
    });
  };

  // Prepare YTD chart data (cumulative)
  const prepareYTDChartData = () => {
    if (!dashboardData) return [];

    let cumulativeRevenue = 0;
    let cumulativeGrossProfit = 0;
    let cumulativeOperatingProfit = 0;
    let cumulativeNetProfit = 0;

    return months.map((month, index) => {
      const monthKey = monthKeys[index];
      
      cumulativeRevenue += parseFloat(dashboardData.revenue?.actual?.[monthKey]) || 0;
      cumulativeGrossProfit += parseFloat(dashboardData.grossProfit?.actual?.[monthKey]) || 0;
      cumulativeOperatingProfit += parseFloat(dashboardData.operatingProfit?.actual?.[monthKey]) || 0;
      cumulativeNetProfit += parseFloat(dashboardData.netProfitBeforeTax?.actual?.[monthKey]) || 0;

      return {
        month,
        RevenueCumulative: cumulativeRevenue,
        GrossProfitCumulative: cumulativeGrossProfit,
        OperatingProfitCumulative: cumulativeOperatingProfit,
        NetProfitCumulative: cumulativeNetProfit,
        NetProfitMarginAvg: cumulativeRevenue > 0 ? (cumulativeNetProfit / cumulativeRevenue) : 0
      };
    });
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: ${entry.name.includes('Margin') || entry.name.includes('Ratio') 
                ? formatPercentage(entry.value) 
                : formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Colors for charts
  const colors = {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
    danger: '#EF4444',
    purple: '#8B5CF6',
    pink: '#EC4899'
  };

  if (loading || dataLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Loading CFO Dashboard Charts</h3>
            <p className="text-slate-500">Preparing financial visualizations...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
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
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No Chart Data</h3>
            <p className="text-slate-500">CFO Dashboard data is not available for visualization.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const monthlyData = prepareMonthlyChartData();
  const ytdData = prepareYTDChartData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">CFO Dashboard Analytics</h2>
          <p className="text-slate-600">Financial performance visualization and trends</p>
        </div>
        <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
          <Activity className="w-3 h-3 mr-1" />
          Live Charts
        </Badge>
      </div>

      {/* Tabs for Monthly vs YTD */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="monthly" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Monthly Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="ytd" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>YTD Dashboard</span>
          </TabsTrigger>
        </TabsList>

        {/* Monthly Dashboard Charts */}
        <TabsContent value="monthly" className="space-y-6">
          {/* Revenue Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span>Monthly Revenue Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="Revenue" 
                    stroke={colors.primary} 
                    strokeWidth={3}
                    name="Actual Revenue"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="RevenueTarget" 
                    stroke={colors.secondary} 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Target Revenue"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="RevenueLastYear" 
                    stroke={colors.accent} 
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    name="Last Year Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Profitability Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span>Monthly Profitability Trends</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="GrossProfit" 
                    stackId="1"
                    stroke={colors.secondary} 
                    fill={colors.secondary}
                    fillOpacity={0.7}
                    name="Gross Profit"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="OperatingProfit" 
                    stackId="2"
                    stroke={colors.primary} 
                    fill={colors.primary}
                    fillOpacity={0.7}
                    name="Operating Profit"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="NetProfitBeforeTax" 
                    stroke={colors.purple} 
                    strokeWidth={3}
                    name="Net Profit Before Tax"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Financial Ratios Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="w-5 h-5 text-purple-600" />
                <span>Monthly Financial Ratios</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="CurrentRatio" 
                    stroke={colors.primary} 
                    strokeWidth={2}
                    name="Current Ratio"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="QuickRatio" 
                    stroke={colors.secondary} 
                    strokeWidth={2}
                    name="Quick Ratio"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="DebtEquityRatio" 
                    stroke={colors.danger} 
                    strokeWidth={2}
                    name="Debt:Equity Ratio"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Net Profit Margin Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChartIcon className="w-5 h-5 text-indigo-600" />
                <span>Monthly Net Profit Margin %</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={formatPercentage} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="NetProfitMargin" 
                    fill={colors.indigo}
                    name="Net Profit Margin %"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* YTD Dashboard Charts */}
        <TabsContent value="ytd" className="space-y-6">
          {/* YTD Cumulative Revenue */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span>Year-to-Date Cumulative Revenue</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={ytdData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="RevenueCumulative" 
                    stroke={colors.primary} 
                    fill={colors.primary}
                    fillOpacity={0.6}
                    name="Cumulative Revenue"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* YTD Profitability Stack */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span>Year-to-Date Profitability Growth</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={ytdData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="GrossProfitCumulative" 
                    stroke={colors.secondary} 
                    strokeWidth={3}
                    name="YTD Gross Profit"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="OperatingProfitCumulative" 
                    stroke={colors.primary} 
                    strokeWidth={3}
                    name="YTD Operating Profit"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="NetProfitCumulative" 
                    stroke={colors.purple} 
                    strokeWidth={3}
                    name="YTD Net Profit"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* YTD Net Profit Margin Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="w-5 h-5 text-indigo-600" />
                <span>YTD Average Net Profit Margin Trend</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={ytdData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={formatPercentage} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="NetProfitMarginAvg" 
                    stroke={colors.accent} 
                    fill={colors.accent}
                    fillOpacity={0.5}
                    name="YTD Avg Net Profit Margin"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* YTD Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(ytdData[ytdData.length - 1]?.RevenueCumulative || 0)}
                </div>
                <p className="text-sm text-slate-600">Total YTD Revenue</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(ytdData[ytdData.length - 1]?.NetProfitCumulative || 0)}
                </div>
                <p className="text-sm text-slate-600">Total YTD Net Profit</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {formatPercentage(ytdData[ytdData.length - 1]?.NetProfitMarginAvg || 0)}
                </div>
                <p className="text-sm text-slate-600">YTD Avg Margin</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvestorCFODashboardCharts;
