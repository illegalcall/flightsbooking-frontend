import { supabase } from './client';

/**
 * Get the access token for authenticated API requests
 * @returns The access token or null if not authenticated
 */
export const getAccessToken = async (): Promise<string | null> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error || !data.session) {
      console.error('Error getting session:', error?.message);
      return null;
    }
    
    return data.session.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

/**
 * Get the authentication headers for API requests
 * @returns Object with Authorization header or empty object if not authenticated
 */
export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await getAccessToken();
  
  if (!token) {
    return {};
  }
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}; 