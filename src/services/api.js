// src/services/api.js

const getBaseUrl = () => {
  // Use VITE_BACKEND_URL if defined (e.g., for Vercel deployments),
  // otherwise default to an empty string for local development with Vite proxy.
  return import.meta.env.VITE_BACKEND_URL || '';
};

const baseUrl = getBaseUrl();

export const fetchData = async (endpoint, options) => {
  const response = await fetch(`${baseUrl}${endpoint}`, options);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
  }
  // Check if response is JSON before parsing
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json();
  }
  // Return text for non-JSON responses
  return response.text();
};


export const testApiConnection = async () => {
  try {
    // Perform a HEAD request or a lightweight endpoint
    const response = await fetch(`${baseUrl}/api/gemini`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: "oi" }),
    });
    // No need to return anything, success is implied if no error is thrown
  } catch (error) {
    console.error("API connection test failed:", error);
    throw error; // Re-throw to be caught by the calling function
  }
};

export const sendMessages = async (items, sender) => {
  const body = {
    items: items.map(({ to, message }) => ({ to, message })),
  };
  if (sender) {
    body.sender = sender;
  }

  return fetchData('/api/send-1-1', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
};
