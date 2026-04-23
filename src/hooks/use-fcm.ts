'use client';

/**
 * Push notification services have been removed from the application.
 * This hook is now a placeholder.
 */
export function useFCM() {
  return { 
    permissionStatus: 'unsupported' as const, 
    requestPermission: async () => false, 
    isRegistering: false, 
    hasToken: false 
  };
}
