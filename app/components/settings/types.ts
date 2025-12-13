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

export interface LoaderData {
  settings: Settings;
}

export interface ActionData {
  success: boolean;
  message: string;
  type?: string;
  settings?: Settings;
}

