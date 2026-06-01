export interface Notification {
  id: number;
  user: number;
  notification_type: string;
  subject: string;
  message: string;
  email_sent: boolean;
  read: boolean;
  created_at: string;
}
