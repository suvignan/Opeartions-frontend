/**
 * Centralized API Client
 * Uses base URL from environment variables, handles generic auth injection,
 * and performs generic error normalization.
 */

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

const apiFetch = async (endpoint, options = {}) => {
  const { params, ...fetchOptions } = options;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer placeholder_token',
    ...fetchOptions.headers,
  };

  const config = {
    ...fetchOptions,
    headers,
  };

  const queryString = params ? '?' + new URLSearchParams(
    Object.entries(params).filter(([_, v]) => v != null)
  ).toString() : '';

  try {
    const response = await fetch(`${BASE_URL}${endpoint}${queryString}`, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || `API error: ${response.status}`);
      // Attach response payload mirroring axios structure for graceful error handling
      error.response = {
         status: response.status,
         data: errorData || {}
      };
      throw error;
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const apiClient = {
  get: (endpoint, options) => apiFetch(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, data, options) => apiFetch(endpoint, { ...options, method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint, data, options) => apiFetch(endpoint, { ...options, method: 'PUT', body: JSON.stringify(data) }),
  patch: (endpoint, data, options) => apiFetch(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(data) }),
  delete: (endpoint, options) => apiFetch(endpoint, { ...options, method: 'DELETE' })
};
