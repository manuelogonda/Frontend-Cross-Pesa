import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchNotificationsApi, markNotificationAsReadApi } from "../api/notificationsApi";
import type { AppNotification } from "../validation/notificationSchema";
import { getApiErrorMessage } from "../../../lib/apiErrors";

export const NOTIFICATIONS_QUERY_KEY = ['notifications'] as const;

const POLL_INTERVAL_MS = 30_000;

export const useNotifications = () => {
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: fetchNotificationsApi,
    // Poll while visible; automatically pauses when the tab is hidden
    refetchInterval: POLL_INTERVAL_MS,
    refetchIntervalInBackground: false,
    staleTime: 15_000,
  });

  const readMutation = useMutation({
    mutationFn: markNotificationAsReadApi,

    // Optimistic update for snappy UX
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      const previous = queryClient.getQueryData<AppNotification[]>(NOTIFICATIONS_QUERY_KEY);
      queryClient.setQueryData<AppNotification[]>(NOTIFICATIONS_QUERY_KEY, (old) =>
        (old ?? []).map((n) => (n.id === id ? { ...n, status: 'READ' as const } : n))
      );
      return { previous };
    },

    // Roll back if the backend rejects it
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, context.previous);
      }
    },

    // Always re-sync with server truth afterwards
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });

  const notifications = notificationsQuery.data ?? [];

  return {
    notifications,
    // FIX: was an array before — consumers did `.length` at every call site
    unreadCount: notifications.filter(git add -A && git commit -m "fix(notifications): unify Zod contract, defensive parsing, numeric unreadCount, visibility-aware RQ polling"(n) => n.status === 'UNREAD').length,
    loading: notificationsQuery.isPending,
    error: notificationsQuery.error
      ? getApiErrorMessage(notificationsQuery.error, 'Failed to fetch notifications')
      : null,
    markAsRead: (id: string) => readMutation.mutateAsync(id),
    refresh: () => notificationsQuery.refetch(),
  };
};