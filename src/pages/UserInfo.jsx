import React, { useEffect, useState, useMemo } from 'react';
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
  TrendingUp
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Import both detail components
import Details from './Details';
import InvestorDetails from './InvestorDetails'; // Add this import

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
  const [viewingUserType, setViewingUserType] = useState(null); // Add this state

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

        const response = await fetch('http://localhost:5000/api/admin/users', {
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

        const response = await fetch('http://localhost:5000/api/admin/investors', {
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

  // Updated handle view user details - store both ID and type
  const handleViewUser = (userId, userType) => {
    setViewingUser(userId);
    setViewingUserType(userType);
  };

  // Updated back handler - clear both states
  const handleBackToList = () => {
    setViewingUser(null);
    setViewingUserType(null);
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

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-800">
                        {currentData.filter(u => {
                          const created = new Date(u.createdAt);
                          const today = new Date();
                          const diffTime = Math.abs(today - created);
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          return diffDays <= 7;
                        }).length}
                      </p>
                      <p className="text-slate-600">This Week</p>
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
                          <TableHead className="font-semibold text-slate-700 text-center">Actions</TableHead>
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
                              <TableCell className="py-4 text-center">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => handleViewUser(item._id, selectedUserType)}
                                      className="cursor-pointer"
                                    >
                                      <Eye className="w-4 h-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
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
