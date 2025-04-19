import { supabase } from './supabase';

/**
 * Checks if a vendor profile exists for a given user ID
 * @param userId The user ID to check
 * @returns Boolean indicating if profile exists
 */
export const checkIfVendorProfileExists = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('vendor_profiles')
      .select('user_id')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      // PGRST116 is the error code for "no rows returned"
      console.error('Error checking vendor profile:', error);
      return false;
    }
    
    return !!data; // Convert to boolean - true if data exists, false otherwise
  } catch (error) {
    console.error('Error checking vendor profile:', error);
    return false;
  }
}; 