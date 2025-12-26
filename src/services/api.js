// src/services/api.js

const getBaseUrl = () => {
  // Use VITE_BACKEND_URL if defined (e.g., for Vercel deployments),
  // otherwise default to '/api' for local development with Vite proxy.
  return import.meta.env.VITE_BACKEND_URL || '/api';
};

const baseUrl = getBaseUrl();

export const fetchData = async (endpoint, options) => {
  const response = await fetch(`${baseUrl}${endpoint}`, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Example usage (this function would be called from a React component)
/*
export const getSomeData = async () => {
  try {
    const data = await fetchData('/some-data');
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error fetching some data:", error);
    throw error;
  }
};
*/
