// src/components/admin/CompanyReferencesView.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  Mail, 
  Phone, 
  User,
  Briefcase,
  FileText,
  CheckCircle2,
  AlertCircle,
  Crown
} from 'lucide-react';

const CompanyReferencesView = ({ data, userInfo, loading }) => {
  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading company references...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.references || data.references.length === 0) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Company References Submitted</h3>
            <p className="text-gray-500">User hasn't submitted company references yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getCompletionStatus = (ref) => {
    const requiredFields = ['companyName', 'contactPerson', 'position', 'email', 'phone', 'relationship'];
    const filledFields = requiredFields.filter(field => ref[field] && ref[field].trim() !== '');
    return {
      completed: filledFields.length === requiredFields.length,
      percentage: Math.round((filledFields.length / requiredFields.length) * 100)
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Company References</CardTitle>
                <p className="text-slate-600">Business references and professional relationships</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {data.references.length} {data.references.length === 1 ? 'Reference' : 'References'}
              </Badge>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                Total: {data.totalReferences || data.references.length}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* References List */}
      <div className="grid grid-cols-1 gap-6">
        {data.references.map((reference, index) => {
          const status = getCompletionStatus(reference);
          
          return (
            <Card key={index} className="border border-slate-200 hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-medium">{index + 1}</span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {reference.companyName || 'Unnamed Company'}
                      </CardTitle>
                      <p className="text-sm text-slate-600">
                        Reference #{index + 1}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {status.completed ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Complete
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {status.percentage}% Complete
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Company Information */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Building2 className="w-4 h-4 text-blue-500" />
                        <label className="text-sm font-medium text-gray-500">Company Name</label>
                      </div>
                      <p className="text-gray-900 font-semibold">
                        {reference.companyName || 'Not provided'}
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Users className="w-4 h-4 text-green-500" />
                        <label className="text-sm font-medium text-gray-500">Relationship</label>
                      </div>
                      <p className="text-gray-900">
                        {reference.relationship || 'Not specified'}
                      </p>
                    </div>
                    
                    {reference.yearsOfRelationship && (
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <FileText className="w-4 h-4 text-purple-500" />
                          <label className="text-sm font-medium text-gray-500">Duration</label>
                        </div>
                        <p className="text-gray-900">
                          {reference.yearsOfRelationship} {reference.yearsOfRelationship === 1 ? 'year' : 'years'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="w-4 h-4 text-indigo-500" />
                        <label className="text-sm font-medium text-gray-500">Contact Person</label>
                      </div>
                      <p className="text-gray-900 font-semibold">
                        {reference.contactPerson || 'Not provided'}
                      </p>
                      {reference.position && (
                        <p className="text-sm text-gray-600">
                          {reference.position}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Mail className="w-4 h-4 text-red-500" />
                        <label className="text-sm font-medium text-gray-500">Email</label>
                      </div>
                      {reference.email ? (
                        <a 
                          href={`mailto:${reference.email}`}
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          {reference.email}
                        </a>
                      ) : (
                        <p className="text-gray-500">Not provided</p>
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Phone className="w-4 h-4 text-orange-500" />
                        <label className="text-sm font-medium text-gray-500">Phone</label>
                      </div>
                      {reference.phone ? (
                        <a 
                          href={`tel:${reference.phone}`}
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          {reference.phone}
                        </a>
                      ) : (
                        <p className="text-gray-500">Not provided</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Description */}
                {reference.description && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <label className="text-sm font-medium text-gray-500">Description</label>
                    </div>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {reference.description}
                    </p>
                  </div>
                )}
                
                {/* Reference Quality Indicator */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-gray-500">Reference Quality:</span>
                      {status.completed ? (
                        <span className="text-xs text-green-600 font-medium">Excellent</span>
                      ) : status.percentage >= 75 ? (
                        <span className="text-xs text-blue-600 font-medium">Good</span>
                      ) : status.percentage >= 50 ? (
                        <span className="text-xs text-yellow-600 font-medium">Fair</span>
                      ) : (
                        <span className="text-xs text-red-600 font-medium">Incomplete</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            status.percentage >= 75 ? 'bg-green-500' :
                            status.percentage >= 50 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${status.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{status.percentage}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-slate-50 to-slate-100">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800">
                {data.references.length}
              </div>
              <div className="text-sm text-slate-600">Total References</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {data.references.filter(ref => getCompletionStatus(ref).completed).length}
              </div>
              <div className="text-sm text-slate-600">Complete References</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(
                  data.references.reduce((acc, ref) => acc + getCompletionStatus(ref).percentage, 0) / 
                  data.references.length || 0
                )}%
              </div>
              <div className="text-sm text-slate-600">Average Completion</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyReferencesView;
