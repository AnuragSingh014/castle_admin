// src/components/admin/AdminBeneficialOwnerView.jsx
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  User, 
  Users,
  Globe, 
  CreditCard, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Building2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Crown,
  Percent
} from "lucide-react";

/**
 * Admin view for Beneficial Owner Certification data
 * @param {Object} props
 * @param {Object} props.data - Beneficial owner data from user submission
 * @param {string} props.userName - Name of the user for context
 * @param {string} props.userEmail - Email of the user for context
 */
function AdminBeneficialOwnerView({ data, userName, userEmail }) {
  // No data state
  if (!data || Object.keys(data).length === 0) {
    return (
      <Card className="border-amber-200 bg-amber-50 mb-4">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-amber-600" />
            <CardTitle className="text-amber-800">Beneficial Owner Certification - Not Submitted</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-amber-700">This user has not yet submitted their Beneficial Owner Certification.</p>
        </CardContent>
      </Card>
    );
  }

  // Check for owners array
  if (!data.owners || !Array.isArray(data.owners) || data.owners.length === 0) {
    return (
      <Card className="border-amber-200 bg-amber-50 mb-4">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-amber-600" />
            <CardTitle className="text-amber-800">Beneficial Owner Certification - No Owners</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-amber-700">No beneficial owners have been registered for this certification.</p>
        </CardContent>
      </Card>
    );
  }

  // Helper to format missing/empty fields
  const display = (value) => (
    value !== undefined && value !== null && value !== "" ? 
    value : 
    <span className="text-gray-400 italic">Not provided</span>
  );

  // Helper to format dates
  const formatDate = (dateString) => {
    if (!dateString) return display("");
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      return display("");
    }
  };

  // Calculate completion for each owner
  const getOwnerCompletion = (owner) => {
    const requiredFields = ['name', 'nationality', 'passportNumber', 'dateOfBirth', 'residentialAddress', 'percentageOwnership', 'sourceOfFunds'];
    const filledFields = requiredFields.filter(field => {
      const value = owner[field];
      return value !== undefined && value !== null && value !== "" && value.toString().trim() !== "";
    });
    return Math.round((filledFields.length / requiredFields.length) * 100);
  };

  // Calculate total ownership percentage
  const totalOwnership = data.owners.reduce((total, owner) => {
    const percentage = parseFloat(owner.percentageOwnership) || 0;
    return total + percentage;
  }, 0);

  // Count complete owners
  const completeOwners = data.owners.filter(owner => getOwnerCompletion(owner) === 100);

  return (
    <Card className="mb-6 border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Beneficial Owner Certification</CardTitle>
              <CardDescription>
                Ownership structure for {userName || userEmail}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge 
              variant={data.isCertified ? "default" : "secondary"}
              className={data.isCertified ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}
            >
              {data.isCertified ? (
                <><CheckCircle2 className="w-3 h-3 mr-1" />Certified</>
              ) : (
                <><AlertCircle className="w-3 h-3 mr-1" />Not Certified</>
              )}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {data.owners.length} {data.owners.length === 1 ? 'Owner' : 'Owners'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Certification Summary */}
        <section>
          <div className="flex items-center space-x-2 mb-3">
            <FileText className="w-4 h-4 text-green-600" />
            <h3 className="font-semibold text-slate-800">Certification Details</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg">
            <div>
              <label className="text-xs font-medium text-slate-600">Certification Date</label>
              <p className="text-sm">{formatDate(data.certificationDate)}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Total Ownership</label>
              <p className="text-sm font-semibold text-blue-600">{totalOwnership.toFixed(1)}%</p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Complete Entries</label>
              <p className="text-sm font-semibold text-green-600">
                {completeOwners.length}/{data.owners.length}
              </p>
            </div>
          </div>
        </section>

        {/* Ownership Summary Cards */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
              <CardContent className="pt-4">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-700">Total Owners</p>
                    <p className="text-xl font-bold text-blue-900">{data.owners.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100">
              <CardContent className="pt-4">
                <div className="flex items-center space-x-2">
                  <Percent className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-purple-700">Total Ownership</p>
                    <p className="text-xl font-bold text-purple-900">{totalOwnership.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-gradient-to-r from-green-50 to-green-100">
              <CardContent className="pt-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-green-700">Complete Entries</p>
                    <p className="text-xl font-bold text-green-900">{completeOwners.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Individual Owners */}
        <section>
          <div className="flex items-center space-x-2 mb-4">
            <Users className="w-4 h-4 text-indigo-600" />
            <h3 className="font-semibold text-slate-800">Beneficial Owners</h3>
          </div>
          
          <div className="space-y-4">
            {data.owners.map((owner, index) => {
              const completion = getOwnerCompletion(owner);
              const ownership = parseFloat(owner.percentageOwnership) || 0;
              const isSignificant = ownership >= 25;
              
              return (
                <Card key={index} className="border border-slate-200 bg-slate-50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs">
                            Owner {index + 1}
                          </Badge>
                          {completion === 100 && (
                            <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Complete
                            </Badge>
                          )}
                          {isSignificant && (
                            <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">
                              <Crown className="w-3 h-3 mr-1" />
                              Significant Control
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {completion}% Complete
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Personal Information */}
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        Personal Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white p-3 rounded border">
                        <div>
                          <label className="text-xs font-medium text-slate-600">Full Name</label>
                          <p className="text-sm font-medium">{display(owner.name)}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-600">Nationality</label>
                          <p className="text-sm flex items-center">
                            <Globe className="w-3 h-3 mr-1" />
                            {display(owner.nationality)}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-600">Passport/ID Number</label>
                          <p className="text-sm flex items-center">
                            <CreditCard className="w-3 h-3 mr-1" />
                            {display(owner.passportNumber)}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-600">Date of Birth</label>
                          <p className="text-sm flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(owner.dateOfBirth)}
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-xs font-medium text-slate-600">Residential Address</label>
                          <p className="text-sm flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {display(owner.residentialAddress)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Ownership Information */}
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center">
                        <Building2 className="w-3 h-3 mr-1" />
                        Ownership Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white p-3 rounded border">
                        <div>
                          <label className="text-xs font-medium text-slate-600">Percentage Ownership</label>
                          <p className="text-sm font-semibold flex items-center">
                            <Percent className="w-3 h-3 mr-1" />
                            {owner.percentageOwnership}%
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-600">Source of Funds</label>
                          <p className="text-sm flex items-center">
                            <DollarSign className="w-3 h-3 mr-1" />
                            {display(owner.sourceOfFunds)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Ownership Level Indicator */}
                    <div className="bg-white p-3 rounded border">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">Control Level:</span>
                        <div className="flex items-center space-x-2">
                          {isSignificant ? (
                            <>
                              <span className="text-orange-600 font-medium text-xs">Significant Control</span>
                              <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">
                                {ownership}%
                              </Badge>
                            </>
                          ) : (
                            <>
                              <span className="text-blue-600 font-medium text-xs">Minor Stakeholder</span>
                              <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                                {ownership}%
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Documents */}
                    {owner.documents && owner.documents.length > 0 ? (
                      <div>
                        <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center">
                          <FileText className="w-3 h-3 mr-1" />
                          Documents ({owner.documents.length})
                        </h4>
                        <div className="bg-white p-3 rounded border">
                          <div className="flex flex-wrap gap-2">
                            {owner.documents.map((doc, docIndex) => (
                              <Badge key={docIndex} variant="outline" className="text-xs">
                                {doc.type || `Document ${docIndex + 1}`}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center">
                          <FileText className="w-3 h-3 mr-1" />
                          Documents
                        </h4>
                        <div className="bg-white p-3 rounded border">
                          <p className="text-xs text-gray-500 italic">No documents uploaded</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Compliance Notes */}
        <section className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-800 mb-1">Regulatory Notes</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• All beneficial owners with 25% or more ownership require documentation</li>
                <li>• Total ownership percentage: {totalOwnership.toFixed(1)}%</li>
                <li>• {completeOwners.length} out of {data.owners.length} entries are complete</li>
                <li>• Certification status: {data.isCertified ? 'Certified' : 'Pending certification'}</li>
              </ul>
            </div>
          </div>
        </section>
      </CardContent>
    </Card>
  );
}

export default AdminBeneficialOwnerView;
