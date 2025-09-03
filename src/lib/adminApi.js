// src/lib/adminApi.js (for your admin panel)
const API_BASE_URL = 'https://castle-backend.onrender.com/api/dashboard';

class AdminApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // Helper method for making HTTP requests
  async makeRequest(endpoint, options = {}) {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Admin API Request Error:', error);
      throw error;
    }
  }

  // Get all dashboard data for a user
  async getUserDashboardData(userId) {
    return this.makeRequest(`/${userId}`);
  }

  // Get completion status for a user
  async getUserCompletionStatus(userId) {
    return this.makeRequest(`/${userId}/completion-status`);
  }
}

// Create and export a singleton instance
const adminApi = new AdminApiService();
export default adminApi;
