import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

// Import your components
import UserInfo from "./pages/UserInfo"; // The protected admin info/dashboard page
import Login from "./pages/Login"; // The admin login page

// Auth utility functions
const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('admin_user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

const getAdminToken = () => {
  try {
    return localStorage.getItem('admin_token');
  } catch {
    return null;
  }
};

// Protected Route wrapper component
function PrivateRoute({ children }) {
  const user = getCurrentUser();
  const token = getAdminToken();
  // Only allow if both token and user exist
  const isAuthenticated = !!user && !!token;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route - redirect based on auth status */}
        <Route
          path="/"
          element={
            getCurrentUser() && getAdminToken()
              ? <Navigate to="/userinfo" replace />
              : <Navigate to="/login" replace />
          }
        />
        {/* Admin login page - always public */}
        <Route path="/login" element={<Login />} />
        {/* Protected UserInfo page - only for authenticated admins */}
        <Route
          path="/userinfo"
          element={
            <PrivateRoute>
              <UserInfo />
            </PrivateRoute>
          }
        />
        {/* Catch all other routes - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
