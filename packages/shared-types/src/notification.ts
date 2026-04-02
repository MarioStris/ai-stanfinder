export enum NotificationType {
  NEW_MATCH = "NEW_MATCH",
  AI_SUGGESTION = "AI_SUGGESTION",
  WEEKLY_DIGEST = "WEEKLY_DIGEST",
  SYSTEM = "SYSTEM",
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: NotificationData;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationData {
  matchId?: string;
  filterId?: string;
  listingId?: string;
  actionUrl?: string;
}
