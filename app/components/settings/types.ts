/**
 * Types for Settings Components
 */

export interface Settings {
  whatsappNumber: string;
  emailId: string;
  selectedPlan: string;
  reportSchedule: {
    frequency: string;
    day: string;
    time: string;
  };
  aiSuggestions: boolean;
  aiAudienceAnalysis: boolean;
}

export interface UserPreferences {
  language: string;
}

export interface LoaderData {
  settings: Settings;
  userPreferences: UserPreferences;
}

export interface ActionData {
  success: boolean;
  message: string;
  type?: string;
  settings?: Settings;
  userPreferences?: UserPreferences;
}

