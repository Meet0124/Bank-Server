// public/js/api.js (The Complete and Correct Version)

/**
 * A helper function to make API requests.
 * @param {string} endpoint - The API endpoint (e.g., "/auth/login").
 * @param {string} method - The HTTP method (e.g., "GET", "POST").
 * @param {object} [body=null] - The request body for POST/PUT requests.
 * @returns {Promise<any>} - The JSON response from the server.
 */
async function apiRequest(endpoint, method = "GET", body = null) {
  const headers = {
    "Content-Type": "application/json",
  };

  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(endpoint, config);
    return await response.json();
  } catch (error) {
    console.error("API Request Error:", error);
    return { message: "Network error or server is unavailable." };
  }
}

// ===================================================================
// == MISSING FUNCTIONS TO ADD ==
// ===================================================================

/**
 * Decodes the JWT from localStorage to get the current user's data.
 * This function is needed by the customer and admin pages.
 */
function getCurrentUser() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    // Relies on the global jwt_decode function from the CDN script
    return jwt_decode(token);
  } catch {
    // If token is invalid, remove it to prevent login loops
    localStorage.removeItem("token");
    return null;
  }
}

/**
 * Logs the user out by clearing the token from localStorage and redirecting.
 * This is the function that was causing the error.
 */
// NEW CODE:
function logout() {
  console.log("Logging out user...");
  localStorage.removeItem("token");
  console.log("Token removed, redirecting to login");
  window.location.replace("/login.html");  
}
