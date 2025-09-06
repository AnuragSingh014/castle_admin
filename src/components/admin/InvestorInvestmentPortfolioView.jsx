// src/components/admin/InvestorInvestmentPortfolioView.jsx
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Eye,
  Loader2,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Building,
  PieChart
} from "lucide-react";

const InvestorInvestmentPortfolioView = ({ investorId }) => {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  const [calculatedSummary, setCalculatedSummary] = useState({
    totalInvestments: 0,
    totalAmountInvested: 0,
    totalCurrentValue: 0,
    activeInvestments: 0,
    exitedInvestments: 0,
    totalReturns: 0,
    averageStake: 0,
    totalROI: 0
  });

  useEffect(() => {
    loadPortfolioData();
  }, [investorId]);

  // ✅ FIXED: Current valuation calculation based on your data structure
  // ✅ SIMPLIFIED: Current valuation calculation in useEffect
useEffect(() => {
    if (!investments || investments.length === 0) {
      setCalculatedSummary({
        totalInvestments: 0,
        totalAmountInvested: 0,
        totalCurrentValue: 0,
        activeInvestments: 0,
        exitedInvestments: 0,
        totalReturns: 0,
        averageStake: 0,
        totalROI: 0
      });
      return;
    }
  
    let totalAmountInvested = 0;
    let totalCurrentValue = 0;
    let activeCount = 0;
    let exitedCount = 0;
    let totalReturns = 0;
    let totalStake = 0;
  
    investments.forEach(inv => {
      totalAmountInvested += inv.amountInvested || 0;
      
      if (inv.currentStatus === 'Active') {
        activeCount++;
        // ✅ FIXED: Just add the current valuation directly
        totalCurrentValue += inv.currentValuation || 0;
      } else if (inv.currentStatus === 'Exited') {
        exitedCount++;
        totalReturns += (inv.exitAmount || 0) - (inv.amountInvested || 0);
      }
      
      totalStake += inv.stakePercentage || 0;
    });
  
    const averageStake = investments.length > 0 ? totalStake / investments.length : 0;
    const totalROI = totalAmountInvested > 0 ? 
      ((totalCurrentValue + totalReturns - totalAmountInvested) / totalAmountInvested) * 100 : 0;
  
    setCalculatedSummary({
      totalInvestments: investments.length,
      totalAmountInvested,
      totalCurrentValue,
      activeInvestments: activeCount,
      exitedInvestments: exitedCount,
      totalReturns,
      averageStake,
      totalROI
    });
  }, [investments]);
  

  const loadPortfolioData = async () => {
    if (!investorId) return;
    
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('admin_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`https://castle-backend.onrender.com/api/admin/investors/${investorId}/investments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setInvestments(result.data.investments || []);
      } else {
        setError('Failed to load investment data');
      }
    } catch (error) {
      console.error('Load portfolio error:', error);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const openViewModal = (investment) => {
    setSelectedInvestment(investment);
    setIsViewModalOpen(true);
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '-';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value) => {
    if (!value && value !== 0) return '-';
    return `${parseFloat(value).toFixed(2)}%`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Exited': return 'bg-blue-100 text-blue-800';
      case 'IPO': return 'bg-purple-100 text-purple-800';
      case 'Acquired': return 'bg-orange-100 text-orange-800';
      case 'Written Off': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin mr-3" />
        <span>Loading investment portfolio...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculatedSummary.totalInvestments}</div>
            {calculatedSummary.totalInvestments > 0 && (
              <p className="text-xs text-muted-foreground">
                {calculatedSummary.activeInvestments} active, {calculatedSummary.exitedInvestments} exited
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(calculatedSummary.totalAmountInvested)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(calculatedSummary.totalCurrentValue)}</div>
            <p className="text-xs text-muted-foreground">ROI: {formatPercentage(calculatedSummary.totalROI)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Stake</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(calculatedSummary.averageStake)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Investments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Investment Portfolio</CardTitle>
          <CardDescription>Investor's complete investment portfolio (Admin View - Read Only)</CardDescription>
        </CardHeader>
        <CardContent>
          {investments.length === 0 ? (
            <div className="text-center py-8">
              <Building className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No investments</h3>
              <p className="mt-1 text-sm text-gray-500">This investor has not added any investments yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Company</th>
                    <th className="text-left py-3 px-2">Amount</th>
                    <th className="text-left py-3 px-2">Year</th>
                    <th className="text-left py-3 px-2">Valuation</th>
                    <th className="text-left py-3 px-2">Stake</th>
                    <th className="text-left py-3 px-2">Status</th>
                    <th className="text-left py-3 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {investments.map((investment, index) => (
                    <tr key={investment._id || index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <div>
                          <div className="font-medium text-gray-900">{investment.companyName}</div>
                          {investment.investmentRound && (
                            <div className="text-xs text-gray-500">{investment.investmentRound}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="font-medium">{formatCurrency(investment.amountInvested)}</div>
                      </td>
                      <td className="py-3 px-2">{investment.yearOfInvestment}</td>
                      <td className="py-3 px-2">
                        {investment.valuationAtInvestment ? (
                          <div>
                            <div className="text-sm">{formatCurrency(investment.valuationAtInvestment)}</div>
                            {investment.currentValuation && (
                              <div className="text-xs text-gray-500">
                                Now: {formatCurrency(investment.currentValuation)}
                              </div>
                            )}
                          </div>
                        ) : investment.currentValuation ? (
                          <div>
                            <div className="text-sm">{formatCurrency(investment.currentValuation)}</div>
                            <div className="text-xs text-gray-500">Current</div>
                          </div>
                        ) : (
                          <div className="text-sm">-</div>
                        )}
                      </td>
                      <td className="py-3 px-2">{formatPercentage(investment.stakePercentage)}</td>
                      <td className="py-3 px-2">
                        <Badge className={getStatusColor(investment.currentStatus)}>
                          {investment.currentStatus}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openViewModal(investment)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Modal - ✅ REMOVED LEAD INVESTOR FIELD */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedInvestment?.companyName}</DialogTitle>
            <DialogDescription>Investment Details (Admin View)</DialogDescription>
          </DialogHeader>
          
          {selectedInvestment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount Invested</Label>
                  <p className="font-medium">{formatCurrency(selectedInvestment.amountInvested)}</p>
                </div>
                <div>
                  <Label>Investment Year</Label>
                  <p className="font-medium">{selectedInvestment.yearOfInvestment}</p>
                </div>
                <div>
                  <Label>Valuation at Investment</Label>
                  <p className="font-medium">{formatCurrency(selectedInvestment.valuationAtInvestment)}</p>
                </div>
                <div>
                  <Label>Current Valuation</Label>
                  <p className="font-medium">{formatCurrency(selectedInvestment.currentValuation)}</p>
                </div>
                <div>
                  <Label>Stake Percentage</Label>
                  <p className="font-medium">{formatPercentage(selectedInvestment.stakePercentage)}</p>
                </div>
                <div>
                  <Label>Investment Round</Label>
                  <p className="font-medium">{selectedInvestment.investmentRound || '-'}</p>
                </div>
                {/* ✅ REMOVED LEAD INVESTOR FIELD */}
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusColor(selectedInvestment.currentStatus)}>
                    {selectedInvestment.currentStatus}
                  </Badge>
                </div>
              </div>
              
              {selectedInvestment.coInvestors && selectedInvestment.coInvestors.length > 0 && (
                <div>
                  <Label>Co-Investors</Label>
                  <p className="font-medium">{selectedInvestment.coInvestors.join(', ')}</p>
                </div>
              )}
              
              {selectedInvestment.notes && (
                <div>
                  <Label>Notes</Label>
                  <p className="font-medium">{selectedInvestment.notes}</p>
                </div>
              )}
              
              <div className="flex justify-end pt-4">
                <Button onClick={() => setIsViewModalOpen(false)} variant="outline">
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvestorInvestmentPortfolioView;
