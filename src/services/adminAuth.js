// src/services/adminAuth.js
export const adminAuthService = {
  getToken: () => localStorage.getItem('admin_token'),
  
  getAdmin: () => {
    const admin = localStorage.getItem('admin_user');
    return admin ? JSON.parse(admin) : null;
  },
  
  isAuthenticated: () => {
    const token = localStorage.getItem('admin_token');
    return !!token;
  },
  
  logout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  },
  
  getAuthHeaders: () => {
    const token = localStorage.getItem('admin_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  },

  // Check if token is expired (basic check)
  isTokenExpired: () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
};
