import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Search,
  Users,
  UserCheck,
  Calendar,
  Mail,
  LogOut,
  Shield,
  Clock,
  Eye,
  AlertCircle,
  MoreHorizontal,
  Building2,
  TrendingUp,
  Upload,
  CheckCircle2,
  FileImage,
  Download // ✅ ADD DOWNLOAD ICON
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Import both detail components
import Details from './Details';
import InvestorDetails from './InvestorDetails';

const UserInfo = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [investors, setInvestors] = useState([]);
  const [selectedUserType, setSelectedUserType] = useState('company');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [adminInfo, setAdminInfo] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [viewingUserType, setViewingUserType] = useState(null);
  
  // Signature upload states
  const [signatureFile, setSignatureFile] = useState(null);
  const [signatureUploading, setSignatureUploading] = useState(false);
  const [signatureStatus, setSignatureStatus] = useState({ type: '', message: '' });
  const [hasSignature, setHasSignature] = useState(false);
  const fileInputRef = useRef(null);

  // Get admin info from localStorage
  useEffect(() => {
    try {
      const admin = localStorage.getItem('admin_user');
      if (admin) {
        setAdminInfo(JSON.parse(admin));
      }
    } catch (err) {
      console.error('Error parsing admin info:', err);
    }
  }, []);

  // Check for existing admin signature
  useEffect(() => {
    const checkAdminSignature = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) return;

        const response = await fetch('https://castle-backend.onrender.com/api/admin/signature', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setHasSignature(!!data.signature);
        }
      } catch (err) {
        console.error('Error checking admin signature:', err);
      }
    };

    checkAdminSignature();
  }, []);

  // Fetch users with authentication
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError('');

      try {
        const token = localStorage.getItem('admin_token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('https://castle-backend.onrender.com/api/admin/users', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            handleLogout();
            return;
          }
          throw new Error(`Failed to fetch users: ${response.status}`);
        }

        const data = await response.json();
        setUsers(data.users || []);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Fetch investors with authentication
  useEffect(() => {
    const fetchInvestors = async () => {
      setLoading(true);
      setError('');

      try {
        const token = localStorage.getItem('admin_token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('https://castle-backend.onrender.com/api/admin/investors', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            handleLogout();
            return;
          }
          throw new Error(`Failed to fetch investors: ${response.status}`);
        }

        const data = await response.json();
        setInvestors(data.investors || []);
      } catch (err) {
        console.error('Error fetching investors:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInvestors();
  }, []);

  // Get current data based on selected type
  const currentData = selectedUserType === 'company' ? users : investors;

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return currentData;

    const term = searchTerm.toLowerCase();
    return currentData.filter(item =>
      (item.name && item.name.toLowerCase().includes(term)) ||
      (item.email && item.email.toLowerCase().includes(term))
    );
  }, [searchTerm, currentData]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/login', { replace: true });
  };

  // Handle view user details
  const handleViewUser = (userId, userType) => {
    setViewingUser(userId);
    setViewingUserType(userType);
  };

  // Handle back to list
  const handleBackToList = () => {
    setViewingUser(null);
    setViewingUserType(null);
  };

  // ✅ DOWNLOAD MANDATE HANDLER (Client-side PDF generation)
  const handleDownloadMandate = async (userId) => {
    if (!userId) {
      setSignatureStatus({ type: 'error', message: 'Please select a user to download mandate' });
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      setSignatureStatus({ type: 'info', message: 'Fetching e-mandate data...' });

      // ✅ Fetch the e-mandate data from backend using admin auth
      const response = await fetch(`https://castle-backend.onrender.com/api/dashboard/${userId}/emandate-info`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Company signature not found. Please ask the company to upload their signature first.');
        }
        throw new Error('Failed to fetch e-mandate data');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get e-mandate data');
      }

      setSignatureStatus({ type: 'info', message: 'Generating complete mandate PDF...' });

      // ✅ Dynamically import the client-side PDF generator
      const { generateEmandatePDF } = await import('../lib/generateEmandate');
      
      // ✅ Generate PDF on client-side using the fetched data
      const pdfBytes = await generateEmandatePDF(result.data);
      
      // ✅ Create download link and trigger download
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Generate filename with company name and date
      const companyName = result.data.companyName || 'Company';
      const founderName = result.data.founderName || 'Founder';
      const currentDate = new Date().toISOString().split('T')[0];
      a.download = `E-Mandate_${companyName.replace(/[^a-zA-Z0-9]/g, '_')}_${founderName.replace(/[^a-zA-Z0-9]/g, '_')}_${currentDate}.pdf`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setSignatureStatus({ type: 'success', message: 'Complete e-mandate downloaded successfully!' });
      setTimeout(() => setSignatureStatus({ type: '', message: '' }), 3000);

    } catch (err) {
      console.error('Download mandate error:', err);
      setSignatureStatus({ type: 'error', message: err.message || 'Failed to download e-mandate' });
      setTimeout(() => setSignatureStatus({ type: '', message: '' }), 5000);
    }
  };

  // Signature upload handlers
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setSignatureStatus({ type: 'error', message: 'Please select an image file' });
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setSignatureStatus({ type: 'error', message: 'File size must be less than 5MB' });
        return;
      }

      setSignatureFile(file);
      setSignatureStatus({ type: '', message: '' });
    }
  };

  const handleSignatureUpload = async () => {
    if (!signatureFile) {
      setSignatureStatus({ type: 'error', message: 'Please select a signature file first' });
      return;
    }

    setSignatureUploading(true);
    setSignatureStatus({ type: '', message: '' });

    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formData = new FormData();
      formData.append('signature', signatureFile);

      const response = await fetch('https://castle-backend.onrender.com/api/admin/upload-signature', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload signature');
      }

      const data = await response.json();
      setSignatureStatus({ type: 'success', message: 'Signature uploaded successfully!' });
      setHasSignature(true);
      setSignatureFile(null);
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setTimeout(() => {
        setSignatureStatus({ type: '', message: '' });
      }, 3000);

    } catch (err) {
      console.error('Signature upload error:', err);
      setSignatureStatus({ type: 'error', message: err.message });
      setTimeout(() => {
        setSignatureStatus({ type: '', message: '' });
      }, 5000);
    } finally {
      setSignatureUploading(false);
    }
  };

  // Get user initials for avatar
  const getUserInitials = (name, email) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <>
      {viewingUser ? (
        // Conditionally render the appropriate detail component based on user type
        viewingUserType === 'investor' ? (
          <InvestorDetails 
            investorId={viewingUser} 
            onBack={handleBackToList} 
          />
        ) : (
          <Details 
            userId={viewingUser} 
            onBack={handleBackToList} 
          />
        )
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Header Section with User Type Selector */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
                      <p className="text-slate-600">
                        Welcome back, {adminInfo?.username || 'Admin'}
                      </p>
                    </div>
                  </div>
                  
                  {/* User Type Selector Switch */}
                  <div className="flex items-center bg-slate-100 rounded-lg p-1">
                    <button
                      onClick={() => setSelectedUserType('company')}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        selectedUserType === 'company'
                          ? 'bg-white text-blue-700 shadow-sm border border-blue-200'
                          : 'text-slate-600 hover:text-slate-800'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Companies</span>
                    </button>
                    <button
                      onClick={() => setSelectedUserType('investor')}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        selectedUserType === 'investor'
                          ? 'bg-white text-green-700 shadow-sm border border-green-200'
                          : 'text-slate-600 hover:text-slate-800'
                      }`}
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>Investors</span>
                    </button>
                  </div>

                  {/* Signature Upload Section */}
                  <div className="flex items-center space-x-3 bg-slate-100 rounded-lg p-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                        hasSignature ? 'bg-green-100' : 'bg-orange-100'
                      }`}>
                        {hasSignature ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <FileImage className="w-4 h-4 text-orange-600" />
                        )}
                      </div>
                      <div className="text-sm">
                        <p className="font-medium text-slate-700">
                          {hasSignature ? 'Signature Added' : 'Add Signature'}
                        </p>
                        {signatureFile && (
                          <p className="text-xs text-slate-500 truncate max-w-24">
                            {signatureFile.name}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="signature-upload"
                      />
                      <Label htmlFor="signature-upload">
                        <Button
                          variant="outline"
                          size="sm"
                          className="cursor-pointer"
                          asChild
                        >
                          <span className="flex items-center space-x-1">
                            <Upload className="w-3 h-3" />
                            <span className="text-xs">Choose</span>
                          </span>
                        </Button>
                      </Label>
                      
                      {signatureFile && (
                        <Button
                          onClick={handleSignatureUpload}
                          disabled={signatureUploading}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {signatureUploading ? (
                            <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <span className="text-xs">Upload</span>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleLogout}
                variant="outline"
                className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>

            {/* Status Alert */}
            {signatureStatus.message && (
              <Alert className={`${
                signatureStatus.type === 'success' 
                  ? 'border-green-200 bg-green-50' 
                  : signatureStatus.type === 'info'
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-red-200 bg-red-50'
              }`}>
                {signatureStatus.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : signatureStatus.type === 'info' ? (
                  <Clock className="h-4 w-4 text-blue-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={
                  signatureStatus.type === 'success' ? 'text-green-800' 
                  : signatureStatus.type === 'info' ? 'text-blue-800'
                  : 'text-red-800'
                }>
                  {signatureStatus.message}
                </AlertDescription>
              </Alert>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 ${selectedUserType === 'company' ? 'bg-blue-100' : 'bg-green-100'} rounded-lg flex items-center justify-center`}>
                      {selectedUserType === 'company' ? (
                        <Building2 className="w-6 h-6 text-blue-600" />
                      ) : (
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-800">{currentData.length}</p>
                      <p className="text-slate-600">
                        Total {selectedUserType === 'company' ? 'Companies' : 'Investors'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <UserCheck className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-800">{filteredData.length}</p>
                      <p className="text-slate-600">Filtered Results</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              
            </div>

            {/* Main Content Card */}
            <Card className="shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-slate-800 flex items-center space-x-2">
                    {selectedUserType === 'company' ? (
                      <Building2 className="w-5 h-5" />
                    ) : (
                      <TrendingUp className="w-5 h-5" />
                    )}
                    <span>{selectedUserType === 'company' ? 'Company' : 'Investor'} Management</span>
                  </CardTitle>
                  <Badge variant="secondary" className="px-3 py-1">
                    {filteredData.length} {selectedUserType === 'company' ? 'companies' : 'investors'}
                  </Badge>
                </div>

                {/* Search Bar */}
                <div className="mt-4 max-w-md">
                  <Label htmlFor="search" className="text-sm font-medium text-slate-700 mb-2 block">
                    Search {selectedUserType === 'company' ? 'Companies' : 'Investors'}
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="search"
                      type="search"
                      placeholder={`Search by name or email...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-11 rounded-xl border-slate-200 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {/* Loading State */}
                {loading && (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                      <span className="text-slate-600">Loading {selectedUserType === 'company' ? 'companies' : 'investors'}...</span>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="p-6">
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        {error}
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {/* Data Table */}
                {!loading && !error && (
                  <div className="overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50/50 border-b border-slate-200">
                          <TableHead className="font-semibold text-slate-700">
                            {selectedUserType === 'company' ? 'Company' : 'Investor'}
                          </TableHead>
                          <TableHead className="font-semibold text-slate-700">Email</TableHead>
                          <TableHead className="font-semibold text-slate-700">Password</TableHead>
                          <TableHead className="font-semibold text-slate-700">Joined Date</TableHead>
                          <TableHead className="font-semibold text-slate-700 text-center">
                            Actions
                            {selectedUserType === 'company' && (
                              <span className="text-xs text-slate-500 block">View • Download</span>
                            )}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredData.length > 0 ? (
                          filteredData.map((item) => (
                            <TableRow
                              key={item._id}
                              className="hover:bg-slate-50/50 transition-colors border-b border-slate-100"
                            >
                              <TableCell className="py-4">
                                <div className="flex items-center space-x-3">
                                  <Avatar className={`w-10 h-10 bg-gradient-to-r ${
                                    selectedUserType === 'company' 
                                      ? 'from-blue-500 to-blue-600' 
                                      : 'from-green-500 to-green-600'
                                  }`}>
                                    <AvatarFallback className="text-white font-medium">
                                      {getUserInitials(item.name, item.email)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-slate-800">
                                      {item.name || 'No name provided'}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                      ID: {item._id.slice(-8)}...
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="flex items-center space-x-2">
                                  <Mail className="w-4 h-4 text-slate-400" />
                                  <span className="text-slate-700">{item.email}</span>
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="font-mono text-sm bg-slate-100 px-2 py-1 rounded border max-w-[120px] truncate">
                                  {item.password || 'N/A'}
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="flex items-center space-x-2">
                                  <Calendar className="w-4 h-4 text-slate-400" />
                                  <span className="text-slate-700">{formatDate(item.createdAt)}</span>
                                </div>
                              </TableCell>
                              {/* ✅ UPDATED ACTIONS COLUMN WITH DOWNLOAD BUTTON */}
                              <TableCell className="py-4 text-center">
                                <div className="flex items-center justify-center space-x-2">
                                  {/* View Details Button */}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewUser(item._id, selectedUserType)}
                                    className="w-8 h-8 p-0 text-slate-600 hover:text-blue-700 hover:bg-blue-50"
                                    title="View Details"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  
                                  {/* ✅ Download Mandate Button - Only for Companies */}
                                  {selectedUserType === 'company' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDownloadMandate(item._id)}
                                      className="w-8 h-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                      title="Download E-Mandate"
                                    >
                                      <Download className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-12">
                              <div className="flex flex-col items-center space-y-3">
                                {selectedUserType === 'company' ? (
                                  <Building2 className="w-12 h-12 text-slate-300" />
                                ) : (
                                  <TrendingUp className="w-12 h-12 text-slate-300" />
                                )}
                                <div>
                                  <p className="text-slate-500 font-medium">
                                    No {selectedUserType === 'company' ? 'companies' : 'investors'} found
                                  </p>
                                  <p className="text-sm text-slate-400">
                                    {searchTerm 
                                      ? 'Try adjusting your search criteria' 
                                      : `No ${selectedUserType === 'company' ? 'companies' : 'investors'} have registered yet`
                                    }
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  );
};

export default UserInfo;
