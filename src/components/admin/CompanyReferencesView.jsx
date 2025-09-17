// src/components/admin/CompanyReferencesView.jsx
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Crown,
  Download,
  File,
  Calendar,
  HardDrive,
  Upload,
  RefreshCw
} from 'lucide-react';

const CompanyReferencesView = ({ data, userInfo, loading, userId }) => {
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Function to handle PDF download
  const handleDownloadPDF = async () => {
    const userIdToUse = userId || userInfo?.id || userInfo?._id;
    
    console.log('Using userId:', userIdToUse); // DEBUG
    
    if (!userIdToUse) {
      alert('❌ User ID not found. Cannot download PDF.');
      return;
    }
    
    setDownloadLoading(true);
    
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`https://castle-backend.onrender.com/api/admin/users/${userIdToUse}/pdf/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          alert('📄 No PDF uploaded. Please upload a presentation first.');
          return;
        }
        throw new Error(`Failed to download PDF: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${userInfo?.name || 'user'}-company-documents.pdf`;
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert(`❌ Failed to download PDF: ${err.message}`);
    } finally {
      setDownloadLoading(false);
    }
  };

  // Function to trigger file input
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Function to handle file selection and upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      alert('❌ Please select a PDF file only.');
      return;
    }

    // Validate file size (15MB limit)
    if (file.size > 15 * 1024 * 1024) {
      alert('❌ File size must be less than 15MB.');
      return;
    }

    const userIdToUse = userId || userInfo?.id || userInfo?._id;
    
    if (!userIdToUse) {
      alert('❌ User ID not found. Cannot upload PDF.');
      return;
    }

    setUploadLoading(true);

    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formData = new FormData();
      formData.append('presentation', file);
      formData.append('title', `${userInfo?.name || 'Company'} Presentation`);
      formData.append('description', 'Company presentation uploaded by admin');

      const response = await fetch(`https://castle-backend.onrender.com/api/admin/users/${userIdToUse}/pdf/replace`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Upload failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        alert('✅ PDF uploaded successfully!');
      } else {
        throw new Error(result.message || 'Upload failed');
      }
      
    } catch (err) {
      console.error('Error uploading PDF:', err);
      alert(`❌ Failed to upload PDF: ${err.message}`);
    } finally {
      setUploadLoading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Function to check if user has uploaded PDF
  const checkUserHasPDF = () => {
    // This would need to be passed as prop or fetched separately
    // For now, we'll show the button and handle the 404 in the download function
    return true;
  };

  // Function to format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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

  return (
    <div className="space-y-6">
      {/* PDF Download Section */}
      <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-purple-900">Company Documents</CardTitle>
                <p className="text-purple-700">Download company uploaded pitch deck</p>
              </div>
            </div>
            <Badge className="bg-purple-100 text-purple-800 border-purple-200">
              Admin Access
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* User Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">User Information</span>
              </div>
              <div className="bg-white rounded-lg p-3 border border-purple-200">
                <p className="font-semibold text-purple-900">{userInfo?.name || 'Unknown User'}</p>
                <p className="text-sm text-purple-600">{userInfo?.email}</p>
                {userInfo?.createdAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    Joined: {new Date(userInfo.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            {/* File Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <File className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">File Information</span>
              </div>
              <div className="bg-white rounded-lg p-3 border border-purple-200">
                <p className="text-sm text-purple-900">PDF Presentation</p>
        
                <p className="text-xs text-gray-500 mt-1">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Download/Upload Actions */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Download className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Actions</span>
              </div>
              <div className="bg-white rounded-lg p-3 border border-purple-200 space-y-2">
                {/* Download Button */}
                <Button
                  onClick={handleDownloadPDF}
                  disabled={downloadLoading}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {downloadLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </>
                  )}
                </Button>

                {/* Upload Button */}
                <Button
                  onClick={handleUploadClick}
                  disabled={uploadLoading}
                  variant="outline"
                  className="w-full border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 transition-all duration-200"
                >
                  {uploadLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload New PDF
                    </>
                  )}
                </Button>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="application/pdf"
                  style={{ display: 'none' }}
                />

                <p className="text-xs text-center text-gray-500 mt-2">
                  Admin-only access
                </p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-4 pt-4 border-t border-purple-200">
            <div className="flex items-center justify-between text-xs text-purple-600">
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Secure upload/download</span>
                </span>
                <span className="flex items-center space-x-1">
                  <File className="w-3 h-3" />
                  <span>PDF format only</span>
                </span>
                <span className="flex items-center space-x-1">
                 
                  
                </span>
              </div>
              <span className="text-gray-400">
                Last updated: {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Original Header */}
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
                {data?.references?.length || 0} {(data?.references?.length || 0) === 1 ? 'Reference' : 'References'}
              </Badge>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                Total: {data?.totalReferences || data?.references?.length || 0}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Handle no references */}
      {(!data || !data.references || data.references.length === 0) ? (
        <Card className="h-full">
          <CardContent className="flex items-center justify-center h-96">
            <div className="text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Company References Submitted</h3>
              <p className="text-gray-500">User hasn't submitted company references yet.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* References List */}
          <div className="grid grid-cols-1 gap-6">
            {data.references.map((reference, index) => {
              const getCompletionStatus = (ref) => {
                const requiredFields = ['companyName', 'contactPerson', 'position', 'email', 'phone', 'relationship'];
                const filledFields = requiredFields.filter(field => ref[field] && ref[field].trim() !== '');
                return {
                  completed: filledFields.length === requiredFields.length,
                  percentage: Math.round((filledFields.length / requiredFields.length) * 100)
                };
              };

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
                    {data.references.filter(ref => {
                      const requiredFields = ['companyName', 'contactPerson', 'position', 'email', 'phone', 'relationship'];
                      const filledFields = requiredFields.filter(field => ref[field] && ref[field].trim() !== '');
                      return filledFields.length === requiredFields.length;
                    }).length}
                  </div>
                  <div className="text-sm text-slate-600">Complete References</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(
                      data.references.reduce((acc, ref) => {
                        const requiredFields = ['companyName', 'contactPerson', 'position', 'email', 'phone', 'relationship'];
                        const filledFields = requiredFields.filter(field => ref[field] && ref[field].trim() !== '');
                        return acc + Math.round((filledFields.length / requiredFields.length) * 100);
                      }, 0) / data.references.length || 0
                    )}%
                  </div>
                  <div className="text-sm text-slate-600">Average Completion</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default CompanyReferencesView;
