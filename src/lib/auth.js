export const getCurrentUser = () => {
    try {
      const user = localStorage.getItem('admin_user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  };
  
  export const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.href = '/login';
  };
  
  export const isAuthenticated = () => {
    return getCurrentUser() && localStorage.getItem('admin_token');
  };
  