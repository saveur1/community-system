import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// Note: Replace with your actual toast implementation
// import { toast } from 'sonner';
const toast = {
  success: (message: string) => console.log('Success:', message),
  error: (message: string) => console.error('Error:', message),
  info: (message: string) => console.info('Info:', message),
};
import {
  getNotifications,
  getUnreadCount,
  getNotificationById,
  createNotification,
  updateNotification,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications,
  type NotificationCreateRequest,
  type NotificationUpdateRequest,
  type NotificationFilters,
} from '@/api/notifications';

// Query keys
const QUERY_KEYS = {
  notifications: (filters: NotificationFilters) => ['notifications', filters],
  unreadCount: () => ['notifications', 'unread-count'],
  detail: (id: string) => ['notifications', 'detail', id],
} as const;

// Get notifications list with pagination and filters
export const useNotificationsList = (filters: NotificationFilters = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.notifications(filters),
    queryFn: () => getNotifications(filters),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute for real-time updates
  });
};

// Get unread notifications count
export const useUnreadCount = () => {
  return useQuery({
    queryKey: QUERY_KEYS.unreadCount(),
    queryFn: getUnreadCount,
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};

// Get single notification by ID
export const useNotification = (notificationId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.detail(notificationId),
    queryFn: () => getNotificationById(notificationId),
    enabled: !!notificationId,
  });
};

// Create notification
export const useCreateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NotificationCreateRequest) => createNotification(data),
    onSuccess: () => {
      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification sent successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to send notification');
    },
  });
};

// Update notification (mark as read/unread)
export const useUpdateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      notificationId,
      data,
    }: {
      notificationId: string;
      data: NotificationUpdateRequest;
    }) => updateNotification(notificationId, data),
    onSuccess: (_, { data }) => {
      // Invalidate and refetch notifications and unread count
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      if (data.isRead !== undefined) {
        const action = data.isRead ? 'marked as read' : 'marked as unread';
        toast.success(`Notification ${action}`);
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update notification');
    },
  });
};

// Mark all notifications as read
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllAsRead,
    onSuccess: (response) => {
      // Invalidate and refetch notifications and unread count
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      const count = response?.data?.data?.updated || 0;
      if (count > 0) {
        toast.success(`${count} notifications marked as read`);
      } else {
        toast.info('No unread notifications to mark');
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to mark notifications as read');
    },
  });
};

// Delete notification
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => deleteNotification(notificationId),
    onSuccess: () => {
      // Invalidate and refetch notifications and unread count
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification deleted');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete notification');
    },
  });
};

// Clear all read notifications
export const useClearReadNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearReadNotifications,
    onSuccess: (response) => {
      // Invalidate and refetch notifications and unread count
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      const count = response?.data?.data?.deleted || 0;
      if (count > 0) {
        toast.success(`${count} read notifications cleared`);
      } else {
        toast.info('No read notifications to clear');
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to clear notifications');
    },
  });
};

// Utility hook to get recent notifications for dropdown
export const useRecentNotifications = (limit: number = 5) => {
  return useNotificationsList({ 
    limit, 
    page: 1 
  });
};

// Infinite loading hook for notifications page
export const useInfiniteNotifications = (filters: Omit<NotificationFilters, 'page'> = {}) => {
  return useQuery({
    queryKey: ['notifications', 'infinite', filters],
    queryFn: async () => {
      // Start with page 1
      const firstPage = await getNotifications({ ...filters, page: 1 });
      return {
        pages: [firstPage.data],
        pageParams: [1],
      };
    },
    staleTime: 30 * 1000,
  });
};

// Hook to load more notifications for infinite scroll
export const useLoadMoreNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      filters, 
      nextPage 
    }: { 
      filters: Omit<NotificationFilters, 'page'>; 
      nextPage: number;
    }) => {
      const response = await getNotifications({ ...filters, page: nextPage });
      return response.data;
    },
    onSuccess: (newData, { filters }) => {
      // Update the infinite query cache
      queryClient.setQueryData(['notifications', 'infinite', filters], (oldData: any) => {
        if (!oldData) return { pages: [newData], pageParams: [1] };
        
        return {
          pages: [...oldData.pages, newData],
          pageParams: [...oldData.pageParams, oldData.pageParams.length + 1],
        };
      });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to load more notifications');
    },
  });
};
