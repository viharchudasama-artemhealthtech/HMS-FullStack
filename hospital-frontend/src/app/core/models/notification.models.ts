export type AppNotificationType = 'success' | 'error' | 'info';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: AppNotificationType;
  createdAt: string;
  read: boolean;
}
