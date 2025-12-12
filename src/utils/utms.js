// Function to get all query parameters from URL
function getQueryParams() {
  const params = {};
  const queryString = window.location.search;

  if (queryString) {
    const urlParams = new URLSearchParams(queryString);
    urlParams.forEach(function (value, key) {
      // Convert the key to lowercase for consistent handling
      const lowercaseKey = key.toLowerCase();
      params[lowercaseKey] = value;
    });
  }

  return params;
}

// Save parameters to sessionStorage as a single JSON object
function saveParamsToSession(params) {
  if (Object.keys(params).length > 0) {
    // Store all UTM parameters as a single JSON string
    sessionStorage.setItem('utmWebParams', JSON.stringify(params));
  }
}

// Get parameters from sessionStorage
export function getParamsFromSession() {
  const utmParamsString = sessionStorage.getItem('utmWebParams');

  // Return empty object if no params found
  if (!utmParamsString) {
    return {};
  }

  try {
    // Parse the JSON string back to an object
    return JSON.parse(utmParamsString);
  } catch (e) {
    console.error('Error parsing UTM params from sessionStorage:', e);
    return {};
  }
}

// Function to handle form parameters - preserves ALL UTMs
export function handleUTMParams() {
  // Get URL parameters first
  const urlParams = getQueryParams();

  // ALWAYS get existing params from session first
  const sessionParams = getParamsFromSession();

  // Start with all existing parameters
  const mergedParams = { ...sessionParams };

  // Add any new URL parameters or update existing ones
  if (Object.keys(urlParams).length > 0) {
    // Only update the specific parameters present in the URL
    Object.keys(urlParams).forEach((key) => {
      mergedParams[key] = urlParams[key];
    });

    // Save back to session
    saveParamsToSession(mergedParams);
  }

  return mergedParams;
}

// Initialize on page load with jQuery
$(document).ready(function () {
  const params = handleUTMParams();
  console.log('UTM Parameters:', params);
});

// Debug function to view current UTM parameters (can be removed in production)
export function showCurrentUTMs() {
  return getParamsFromSession();
}
