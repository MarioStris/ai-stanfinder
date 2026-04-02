export enum UserTier {
  FREE = "FREE",
  PREMIUM = "PREMIUM",
}

export interface User {
  id: string;
  email: string;
  tier: UserTier;
  clerkId: string;
  pushToken?: string;
  notificationSettings: NotificationSettings;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  minMatchPercentage: number;
  frequency: NotificationFrequency;
}

export enum NotificationFrequency {
  INSTANT = "INSTANT",
  DAILY_DIGEST = "DAILY_DIGEST",
  DISABLED = "DISABLED",
}
