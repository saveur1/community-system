import { client } from './client';

export interface Notification {
  id: string;
  type: 'survey' | 'feedback' | 'community_session' | 'system';
  title: string;
  message: string;
  icon?: string;
  link?: string;
  entityId?: string;
  entityType?: string;
  isRead: boolean;
  userId: string;
  createdBy?: string;
  organizationId?: string;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    name: string;
  };
  recipient?: {
    id: string;
    name: string;
  };
}

export interface NotificationCreateRequest {
  type: 'survey' | 'feedback' | 'community_session' | 'system';
  title: string;
  message: string;
  icon?: string;
  link?: string;
  entityId?: string;
  entityType?: string;
  userIds: string[];
}

export interface NotificationUpdateRequest {
  isRead?: boolean;
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  type?: 'survey' | 'feedback' | 'community_session' | 'system';
  isRead?: boolean;
  startDate?: string;
  endDate?: string;
}

// Get notifications with pagination and filters
export const getNotifications = async (filters: NotificationFilters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.type) params.append('type', filters.type);
  if (typeof filters.isRead === 'boolean') params.append('isRead', filters.isRead.toString());
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);

  return client.get(`/notifications?${params.toString()}`);
};

// Get unread notifications count
export const getUnreadCount = async () => {
  return client.get('/notifications/unread-count');
};

// Get notification by ID
export const getNotificationById = async (notificationId: string) => {
  return client.get(`/notifications/${notificationId}`);
};

// Create notification
export const createNotification = async (data: NotificationCreateRequest) => {
  return client.post('/notifications', data);
};

// Update notification (mark as read/unread)
export const updateNotification = async (
  notificationId: string,
  data: NotificationUpdateRequest
) => {
  return client.put(`/notifications/${notificationId}`, data);
};

// Mark all notifications as read
export const markAllAsRead = async () => {
  return client.put('/notifications/mark-all-read', {});
};

// Delete notification
export const deleteNotification = async (notificationId: string) => {
  return client.delete(`/notifications/${notificationId}`);
};

// Clear all read notifications
export const clearReadNotifications = async () => {
  return client.delete('/notifications/clear-read');
};
