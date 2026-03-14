/**
 * Application configuration with environment variable management
 * Handles both build-time and runtime environment variables for Next.js
 */

// Default relative API path for combined deployment
// When deployed with nginx, backend is available at /api
const DEFAULT_BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

/**
 * Get configuration values with proper fallbacks
 * This works in both browser and server environments
 */
const getConfig = () => {
  // Use relative path for production deployment with nginx
  // Allow override via environment variable for development/testing
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || DEFAULT_BACKEND_URL;
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  // App URL for Clerk redirects - use custom domain instead of Azure App Service URL
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://trustmedhelath.com";
  const afterSignInUrl = process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || "/dashboard";
  const afterSignUpUrl = process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || "/dashboard";
  
  return {
    backendUrl,
    clerkPublishableKey,
    appUrl,
    afterSignInUrl,
    afterSignUpUrl,
  };
};

export const config = getConfig();

// Log configuration in browser for debugging (production and development)
if (typeof window !== 'undefined') {
  console.log('🔧 Frontend API Configuration:', {
    backendUrl: config.backendUrl,
    clerkKey: config.clerkPublishableKey ? '***' + config.clerkPublishableKey.slice(-4) : 'Not set',
    environment: process.env.NODE_ENV,
    source: process.env.NEXT_PUBLIC_BACKEND_URL ? 'Environment Variable' : 'Default Relative Path',
    rawEnv: process.env.NEXT_PUBLIC_BACKEND_URL,
    defaultUrl: DEFAULT_BACKEND_URL
  });
}

