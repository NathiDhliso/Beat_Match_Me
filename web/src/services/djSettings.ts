/**
 * DJ Settings Service
 * GraphQL mutations for updating DJ set settings (request cap, base price, etc.)
 */

import { generateClient } from 'aws-amplify/api';

export interface DJSetSettings {
  basePrice?: number;
  requestCapPerHour?: number;
  isSoldOut?: boolean;
  spotlightSlots?: number;
  isAcceptingRequests?: boolean;
}

/**
 * Update DJ Set Settings
 * Persists request cap, pricing, and availability settings to DynamoDB
 */
export const updateDJSetSettings = async (
  setId: string,
  settings: DJSetSettings
): Promise<boolean> => {
  try {
    const client = generateClient();

    console.log('Updating DJ set settings:', { setId, settings });

    const mutation = `
      mutation UpdateDJSetSettings($input: UpdateDJSetSettingsInput!) {
        updateDJSetSettings(input: $input) {
          setId
          settings {
            basePrice
            requestCapPerHour
            isSoldOut
            spotlightSlots
            isAcceptingRequests
          }
        }
      }
    `;

    const response: any = await client.graphql({
      query: mutation,
      variables: {
        input: {
          setId,
          settings
        }
      }
    });

    console.log('✅ DJ settings updated successfully:', response.data.updateDJSetSettings);
    return true;
  } catch (error: any) {
    console.error('❌ Failed to update DJ settings:', error);
    
    // Handle specific error cases
    if (error.errors && error.errors.length > 0) {
      const firstError = error.errors[0];
      console.error('GraphQL Error:', firstError.message);
      
      // Check if it's a schema issue (mutation not deployed yet)
      if (firstError.message?.includes('Cannot query field') || 
          firstError.message?.includes('updateDJSetSettings')) {
        console.warn('⚠️ updateDJSetSettings mutation not deployed yet');
        console.warn('Settings will be stored locally until backend is updated');
        return false;
      }
    }
    
    throw error;
  }
};

/**
 * Update DJ Profile
 * Persists DJ profile data (bio, genres, etc.) to DynamoDB
 */
export interface DJProfileUpdate {
  name?: string;
  bio?: string;
  genres?: string[];
  basePrice?: number;
  photo?: string;
}

export const updateDJProfile = async (
  userId: string,
  updates: DJProfileUpdate
): Promise<boolean> => {
  try {
    const client = generateClient();

    console.log('Updating DJ profile:', { userId, updates });

    const mutation = `
      mutation UpdateDJProfile($input: UpdateDJProfileInput!) {
        updateDJProfile(input: $input) {
          userId
          name
          bio
          genres
          basePrice
          photo
        }
      }
    `;

    const response: any = await client.graphql({
      query: mutation,
      variables: {
        input: {
          userId,
          ...updates
        }
      }
    });

    console.log('✅ DJ profile updated successfully:', response.data.updateDJProfile);
    return true;
  } catch (error: any) {
    console.error('❌ Failed to update DJ profile:', error);
    
    // Handle specific error cases
    if (error.errors && error.errors.length > 0) {
      const firstError = error.errors[0];
      console.error('GraphQL Error:', firstError.message);
      
      // Check if it's a schema issue
      if (firstError.message?.includes('Cannot query field') || 
          firstError.message?.includes('updateDJProfile')) {
        console.warn('⚠️ updateDJProfile mutation not deployed yet');
        console.warn('Profile will be stored locally until backend is updated');
        return false;
      }
    }
    
    throw error;
  }
};

/**
 * Toggle Sold Out Mode
 * Quick helper to enable/disable request acceptance
 */
export const toggleSoldOutMode = async (
  setId: string,
  isSoldOut: boolean
): Promise<boolean> => {
  return updateDJSetSettings(setId, { isSoldOut });
};

/**
 * Update Request Cap
 * Quick helper to change requests per hour limit
 */
export const updateRequestCap = async (
  setId: string,
  requestCapPerHour: number
): Promise<boolean> => {
  return updateDJSetSettings(setId, { requestCapPerHour });
};
