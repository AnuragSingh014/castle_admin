// src/pages/admin/AdminLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  AlertCircle,
  ArrowRight,
  Settings,
  Users,
  BarChart3,
  Database,
  CheckCircle
} from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
  
    try {
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          username: form.username,
          password: form.password
        })
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        // Handle specific error messages
        let errorMessage = 'Login failed';
        switch(data.error) {
          case 'username_and_password_required':
            errorMessage = 'Please enter both username and password';
            break;
          case 'invalid_credentials':
            errorMessage = 'Invalid username or password';
            break;
          case 'unauthorized':
            errorMessage = 'Access denied. Please check your credentials.';
            break;
          default:
            errorMessage = data.error || `Server error: ${response.status}`;
        }
        throw new Error(errorMessage);
      }
      
      if (data.ok && data.token) {
        // Store JWT token and admin info
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_user', JSON.stringify(data.admin));
        
        // Add debug logs
        console.log('Token stored:', data.token);
        console.log('Admin info stored:', data.admin);
        
        // ✅ Navigate to the correct route that exists in App.jsx
        navigate('/userinfo', { replace: true });
      } else {
        throw new Error('Login failed - invalid response');
      }
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  

  const isFormValid = form.username && form.password;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Branding */}
          <div className="text-center lg:text-left space-y-8">
            {/* Logo Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-center lg:justify-start space-x-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl">
                    <Shield className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center animate-pulse">
                    <Settings className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-1">Admin Portal</h1>
                  <p className="text-purple-200">Control Center</p>
                </div>
              </div>
              
              <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                Secure
                <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent"> Administrative</span>
                <br />Access
              </h2>
              
              <p className="text-xl text-purple-100 max-w-md mx-auto lg:mx-0">
                Manage users, monitor activities, and control system settings with powerful admin tools.
              </p>
            </div>

            {/* Feature Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-3">
                  <Users className="w-5 h-5 text-purple-300" />
                </div>
                <h3 className="font-semibold text-white text-sm mb-1">User Management</h3>
                <p className="text-xs text-purple-200">Complete control</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-3">
                  <BarChart3 className="w-5 h-5 text-indigo-300" />
                </div>
                <h3 className="font-semibold text-white text-sm mb-1">Analytics</h3>
                <p className="text-xs text-purple-200">Real-time insights</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-3">
                  <Database className="w-5 h-5 text-blue-300" />
                </div>
                <h3 className="font-semibold text-white text-sm mb-1">Data Control</h3>
                <p className="text-xs text-purple-200">System management</p>
              </div>
            </div>

            {/* Security Features */}
            <div className="flex items-center justify-center lg:justify-start space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">99.9%</div>
                <div className="text-sm text-purple-200">Uptime</div>
              </div>
              <div className="w-px h-12 bg-white/20"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">256-bit</div>
                <div className="text-sm text-purple-200">Encryption</div>
              </div>
              <div className="w-px h-12 bg-white/20"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">24/7</div>
                <div className="text-sm text-purple-200">Monitoring</div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto">
            {/* Form Header */}
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-white mb-2">
                Administrator Login
              </h3>
              <p className="text-purple-200">
                Enter your credentials to access the admin panel
              </p>
            </div>

            {/* Login Form */}
            <Card className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl">
              <CardHeader className="space-y-1 pb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl text-center text-slate-800">Secure Access</CardTitle>
                <CardDescription className="text-center text-slate-600">
                  Protected administrative area
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Username Field */}
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium text-slate-700 flex items-center">
                      <div className="w-5 h-5 bg-purple-100 rounded-md flex items-center justify-center mr-2">
                        <Mail className="w-3 h-3 text-purple-600" />
                      </div>
                      Administrator Username
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      name="username"
                      placeholder="admin@company.com"
                      value={form.username}
                      onChange={handleChange}
                      required
                      className="h-12 rounded-xl border-slate-200 focus:border-purple-500 focus:ring-purple-500/20"
                      autoComplete="username"
                    />
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-slate-700 flex items-center">
                      <div className="w-5 h-5 bg-indigo-100 rounded-md flex items-center justify-center mr-2">
                        <Lock className="w-3 h-3 text-indigo-600" />
                      </div>
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Enter your admin password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        className="h-12 rounded-xl pr-12 border-slate-200 focus:border-purple-500 focus:ring-purple-500/20"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        {showPassword ? 
                          <EyeOff className="w-4 h-4 text-slate-500" /> : 
                          <Eye className="w-4 h-4 text-slate-500" />
                        }
                      </button>
                    </div>
                  </div>

                  {/* Error Alert */}
                  {error && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    disabled={!isFormValid || isLoading}
                    className="w-full h-12 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Authenticating...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <span>Access Admin Panel</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </Button>
                </form>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-center space-x-6 text-xs text-slate-500">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>Secure</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-100"></div>
                      <span>Encrypted</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-200"></div>
                      <span>Protected</span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-slate-400 text-center mt-3">
                    Unauthorized access is strictly prohibited and monitored.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Demo Credentials (Development Only) */}
            {process.env.NODE_ENV === 'development' && (
  <div className="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
    {/* ✅ Change <p> to <div> */}
    <div className="text-xs text-purple-200 mb-2 font-medium flex items-center">
      <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
      Demo Admin Credentials:
    </div>
    <button 
      type="button"
      onClick={() => setForm({ username: 'admin@company.com', password: 'supersecret123' })}
      className="text-xs text-purple-300 hover:text-purple-100 transition-colors duration-200 hover:underline"
    >
      Username: admin@company.com | Password: supersecret123
    </button>
  </div>
)}
          </div>
        </div>
      </div>
    </div>
  );
}
