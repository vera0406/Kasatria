/**
 * Authentication Module
 * Handles Google Sign-In and session management
 */

class AuthManager {
  constructor() {
    this.token = null;
    this.userInfo = null;
    this.init();
  }

  /**
   * Initialize authentication
   */
  init() {
    // Load stored credentials
    this.loadStoredCredentials();
  }

  /**
   * Load credentials from session storage
   */
  loadStoredCredentials() {
    try {
      this.token = sessionStorage.getItem('google_token');
      const userInfoStr = sessionStorage.getItem('user_info');
      if (userInfoStr) {
        this.userInfo = JSON.parse(userInfoStr);
      }
    } catch (error) {
      console.error('Error loading stored credentials:', error);
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!(this.token && this.userInfo);
  }

  /**
   * Get current user info
   */
  getUserInfo() {
    return this.userInfo;
  }

  /**
   * Get authentication token
   */
  getToken() {
    return this.token;
  }

  /**
   * Sign out user
   */
  signOut() {
    // Clear stored credentials
    sessionStorage.removeItem('google_token');
    sessionStorage.removeItem('user_info');

    // Reset local state
    this.token = null;
    this.userInfo = null;

    // Sign out from Google
    if (typeof google !== 'undefined' && google.accounts) {
      google.accounts.id.disableAutoSelect();
    }

    // Redirect to login page
    window.location.href = 'index.html';
  }

  /**
   * Store authentication data
   */
  storeAuth(token, userInfo) {
    this.token = token;
    this.userInfo = userInfo;
    sessionStorage.setItem('google_token', token);
    sessionStorage.setItem('user_info', JSON.stringify(userInfo));
  }
}

// Create global auth manager instance
const authManager = new AuthManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthManager;
}