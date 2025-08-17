// src/components/admin/AdminDDFormView.jsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  FileText, 
  Building2, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Clock, 
  AlertTriangle
} from "lucide-react";

/**
 * Admin view for Due Diligence form (readonly)
 * @param {Object} props
 * @param {Object} props.data - DDForm data object from dashboard
 * @param {string} props.userName - Name of the user (for context)
 * @param {string} props.userEmail - Email of the user (for context)
 */
function AdminDDFormView({ data, userName, userEmail }) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <Card className="border-amber-200 bg-amber-50 mb-4">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-amber-600" />
            <CardTitle className="text-amber-800">Due Diligence Form - Not Submitted</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-amber-700">This user has not yet submitted their Due Diligence form.</p>
        </CardContent>
      </Card>
    );
  }

  // Helper to display fields
  const display = (val) =>
    val !== undefined && val !== null && val !== "" ?
      val :
      <span className="text-gray-400 italic">Not provided</span>;

  // Completion Calculation
  const businessFields = data.businessDetails || {};
  const financialFields = data.financialInformation || {};
  const complianceFields = data.compliance || {};
  const riskFields = data.riskAssessment || {};

  const businessCompletion = Object.values(businessFields).filter(val => val).length;
  const financialCompletion = Object.values(financialFields).filter(val => val).length;
  const complianceCompletion = Object.values(complianceFields).filter(val => typeof val === 'boolean' ? val : !!val).length;
  const totalFields = 4 + 4 + 4;
  const completedFields = businessCompletion + financialCompletion + complianceCompletion;
  const progress = Math.round((completedFields / totalFields) * 100);

  // Generate risk labels
  const risks = ['marketRisk', 'operationalRisk', 'financialRisk', 'complianceRisk'];

  return (
    <Card className="mb-6 border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Due Diligence Form</CardTitle>
              <CardDescription>
                Submission for {userName || userEmail}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={progress === 100 ? "default" : "secondary"} className={progress === 100 ? "bg-green-100 text-green-800" : ""}>
              {progress}% Complete
            </Badge>
            <Badge variant="outline" className="text-xs">
              {completedFields}/{totalFields} fields
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Business Details */}
        <section>
          <div className="flex items-center space-x-2 mb-3">
            <Building2 className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-slate-800">Business Details</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
            <div>
              <label className="text-xs font-medium text-slate-600">Legal Structure</label>
              <p className="text-sm">{display(businessFields.legalStructure)}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Registration Number</label>
              <p className="text-sm">{display(businessFields.registrationNumber)}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Tax Identification</label>
              <p className="text-sm">{display(businessFields.taxIdentification)}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Business License</label>
              <p className="text-sm">{display(businessFields.businessLicense)}</p>
            </div>
          </div>
        </section>

        {/* Financial Information */}
        <section>
          <div className="flex items-center space-x-2 mb-3">
            <DollarSign className="w-4 h-4 text-green-600" />
            <h3 className="font-semibold text-slate-800">Financial Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
            <div>
              <label className="text-xs font-medium text-slate-600">Annual Revenue</label>
              <p className="text-sm">{display(financialFields.annualRevenue)}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Profit Margin</label>
              <p className="text-sm">{display(financialFields.profitMargin)}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Debt Ratio</label>
              <p className="text-sm">{display(financialFields.debtRatio)}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Cash Flow</label>
              <p className="text-sm">{display(financialFields.cashFlow)}</p>
            </div>
          </div>
        </section>

        {/* Compliance */}
        <section>
          <div className="flex items-center space-x-2 mb-3">
            <Shield className="w-4 h-4 text-amber-600" />
            <h3 className="font-semibold text-slate-800">Compliance</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
            {[
              { key: 'regulatoryCompliance', label: 'Regulatory Compliance' },
              { key: 'environmentalCompliance', label: 'Environmental Compliance' },
              { key: 'laborCompliance', label: 'Labor Compliance' },
              { key: 'taxCompliance', label: 'Tax Compliance' }
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="text-xs font-medium text-slate-600">{label}</label>
                <p className="text-sm">
                  {complianceFields[key] ? (<Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Yes</Badge>)
                    : (<Badge variant="outline" className="text-xs">No</Badge>)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Risk Assessment */}
        <section>
          <div className="flex items-center space-x-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <h3 className="font-semibold text-slate-800">Risk Assessment</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
            {risks.map((riskType) => (
              <div key={riskType}>
                <label className="text-xs font-medium text-slate-600">{riskType.replace("Risk", " Risk")}</label>
                <p className="text-sm">{display(riskFields[riskType])}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Progress Summary */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2 pt-2">
            <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardContent className="text-center py-6">
                <div className="text-xl font-bold text-blue-600">{progress}%</div>
                <div className="text-sm text-blue-700">Overall Progress</div>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-gradient-to-r from-green-50 to-teal-50">
              <CardContent className="text-center py-6">
                <div className="text-xl font-bold text-green-600">{businessCompletion}/4</div>
                <div className="text-sm text-green-700">Business Details</div>
              </CardContent>
            </Card>
            <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
              <CardContent className="text-center py-6">
                <div className="text-xl font-bold text-purple-600">{financialCompletion}/4</div>
                <div className="text-sm text-purple-700">Financial Info</div>
              </CardContent>
            </Card>
          </div>
        </section>
      </CardContent>
    </Card>
  );
}

export default AdminDDFormView;
