import { apiClient } from "../../../lib/axios";
import type { PaginatedResponse } from "../types/PaginatedResponse";
import type { Notification } from "../validation/notificationSchema";

export const fetchNotificationsApi = async () => {
  const response = await apiClient.get<PaginatedResponse<Notification>>('/notifications');
  return response.data.content;
};

export const markNotificationAsReadApi = async (id: string): Promise<void> => {
  await apiClient.put(`/notifications/${id}/read`);
};