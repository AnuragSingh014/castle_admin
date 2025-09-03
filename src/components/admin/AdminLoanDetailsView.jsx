// src/components/admin/AdminLoanDetailsView.jsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Banknote, 
  FileText, 
  Calendar, 
  Percent, 
  DollarSign, 
  Building2, 
  CheckCircle2, 
  Calculator, 
  CreditCard,
  Info,
  AlertCircle
} from "lucide-react";

const columns = [
  { key: "bank", label: "Bank/NBFC Name", icon: Building2 },
  { key: "loanType", label: "Loan Type", icon: CreditCard },
  { key: "limit", label: "Sanctioned Limit (₹)", icon: DollarSign, type: "number" },
  { key: "tenor", label: "Tenor (Years)", icon: Calendar, type: "number" },
  { key: "roi", label: "ROI (%)", icon: Percent, type: "number" },
  { key: "closingBal", label: "Closing Balance (₹)", icon: Calculator, type: "number" },
  { key: "year", label: "Year of Sanction", icon: Calendar, type: "number" },
  { key: "emi", label: "EMI (₹)", icon: Banknote, type: "number" },
];

// Helper for missing/empty fields
const display = val =>
  val !== undefined && val !== null && val !== "" ? val : <span className="text-gray-400 italic">Not provided</span>;

function AdminLoanDetailsView({ data, userName, userEmail }) {
  // Handle case if no data
  if (!data || !data.loans || !Array.isArray(data.loans) || data.loans.length === 0) {
    return (
      <Card className="border-amber-200 bg-amber-50 mb-4">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Banknote className="w-5 h-5 text-amber-600" />
            <CardTitle className="text-amber-800">Loan Details - Not Submitted</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-amber-700">This user has not yet submitted any loan details.</p>
        </CardContent>
      </Card>
    );
  }

  // ✅ CALCULATE MISSING VARIABLES HERE
// ✅ CALCULATE MISSING VARIABLES HERE
const rows = data.loans.map(loan => ({
  bank: loan._frontend_data?.bank || 'N/A',
  loanType: loan.loanType,
  limit: loan.amount,
  tenor: loan.term,
  roi: loan.interestRate,
  closingBal: loan._frontend_data?.closingBalance || 0,
  year: loan._frontend_data?.yearOfSanction || 
        (loan.repaymentSchedule?.startDate ? new Date(loan.repaymentSchedule.startDate).getFullYear() : 'N/A'),
  emi: loan._frontend_data?.emi || 0
}));


  // Calculate completion statistics
  const completedRows = rows.filter(row => columns.every(col => row[col.key] && row[col.key].toString().trim() !== "")).length;
  const totalRows = rows.length;
  const progress = totalRows > 0 ? Math.round((completedRows / totalRows) * 100) : 0;

  // Calculate totals
  const totalSanctioned = rows.reduce((sum, row) => sum + (parseFloat(row.limit) || 0), 0);
  const totalClosingBalance = rows.reduce((sum, row) => sum + (parseFloat(row.closingBal) || 0), 0);
  const totalEMI = rows.reduce((sum, row) => sum + (parseFloat(row.emi) || 0), 0);

  return (
    <Card className="mb-6 border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Banknote className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Loan Details Sheet</CardTitle>
              <CardDescription>
                Portfolio for {userName || userEmail}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge
              variant={progress === 100 ? "default" : "secondary"}
              className={progress === 100 ? "bg-green-100 text-green-800" : ""}
            >
              {progress}% Complete
            </Badge>
            <Badge variant="outline" className="text-xs">
              {completedRows}/{totalRows} entries
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
            <CardContent className="pt-4 text-center">
              <DollarSign className="w-5 h-5 text-blue-600 mx-auto" />
              <p className="text-sm text-blue-700">Total Sanctioned</p>
              <p className="text-xl font-bold text-blue-900">₹{totalSanctioned.toLocaleString("en-IN")}</p>
            </CardContent>
          </Card>
          <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100">
            <CardContent className="pt-4 text-center">
              <Calculator className="w-5 h-5 text-orange-600 mx-auto" />
              <p className="text-sm text-orange-700">Total Outstanding</p>
              <p className="text-xl font-bold text-orange-900">₹{totalClosingBalance.toLocaleString("en-IN")}</p>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-gradient-to-r from-green-50 to-green-100">
            <CardContent className="pt-4 text-center">
              <Banknote className="w-5 h-5 text-green-600 mx-auto" />
              <p className="text-sm text-green-700">Total Monthly EMI</p>
              <p className="text-xl font-bold text-green-900">₹{totalEMI.toLocaleString("en-IN")}</p>
            </CardContent>
          </Card>
        </section>

        {/* Important Notice */}
        <section>
          <Card className="bg-blue-50 border-blue-200 mb-3">
            <CardContent className="py-3">
              <div className="flex items-center space-x-2">
                <Info className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-800">
                  This table displays all existing loan details as submitted by the user.
                </span>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Table of loans */}
        <section>
          <div className="bg-slate-50 p-4 rounded-lg overflow-auto border border-slate-200">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="px-3 py-2 border-b font-medium text-left text-slate-600">#</th>
                  {columns.map(col => (
                    <th key={col.key} className="px-3 py-2 border-b font-medium text-left text-slate-600">
                      <span className="flex items-center">
                        <col.icon className="w-4 h-4 mr-1" />{col.label}
                      </span>
                    </th>
                  ))}
                  <th className="px-3 py-2 border-b font-medium text-center text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => {
                  const isComplete = columns.every(col => row[col.key] && row[col.key].toString().trim() !== "");
                  return (
                    <tr key={idx} className={isComplete ? "bg-white" : "bg-slate-50"}>
                      <td className="px-3 py-1 border-b text-xs">{idx + 1}</td>
                      {columns.map(col => (
  <td key={col.key} className="px-3 py-1 border-b">
    {col.type === "number" && row[col.key] && col.key !== "year"
      ? (
        <>
          {col.key === "roi"
            ? `${parseFloat(row[col.key]).toFixed(2)}%`
            : `₹${parseFloat(row[col.key]).toLocaleString("en-IN")}`}
        </>
      ) : col.key === "year" && row[col.key] 
        ? row[col.key] // Display year as plain number
        : display(row[col.key])}
  </td>
))}

                      <td className="px-3 py-1 border-b text-center">
                        {isComplete ? (
                          <Badge variant="default" className="bg-green-100 text-green-700 border-green-200 text-xs">
                            <CheckCircle2 className="w-3 h-3 mr-1" />Complete
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs"><AlertCircle className="w-3 h-3 mr-1" />Incomplete</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </CardContent>
    </Card>
  );
}

export default AdminLoanDetailsView;
