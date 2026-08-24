import { z } from "zod";
import { apiClient } from "../../../lib/axios";
import { NotificationSchema, type AppNotification } from "../validation/notificationSchema";

/**
 * Fetches the authenticated user's notifications.
 *
 * Defensive against BOTH backend pagination shapes (flat array vs Spring
 * PagedModel `.content`) — a mismatch here used to yield `undefined` typed
 * as a valid list. The strict Zod contract is then enforced so the UI can
 * never render malformed payloads.
 */
export const fetchNotificationsApi = async (): Promise<AppNotification[]> => {
  const { data } = await apiClient.get<unknown>('/notifications');

  // Safely extract the array, whether flat or wrapped in Spring's `.content`
  const rawList = Array.isArray(data)
    ? data
    : ((data as { content?: unknown[] })?.content ?? []);

  return z.array(NotificationSchema).parse(rawList);
};

export const markNotificationAsReadApi = async (id: string): Promise<void> => {
  await apiClient.put(`/notifications/${id}/read`);
};