import { apiClient } from "../../../lib/axios";
import type { AppNotification, PaginatedResponse } from "../types/PaginatedResponse";

export const fetchNotificationsApi = async (): Promise<AppNotification[]> => {
  const response = await apiClient.get<PaginatedResponse<AppNotification>>('/notifications');
  return response.data.content;
};

export const markNotificationAsReadApi = async (id: string): Promise<void> => {
  await apiClient.put(`/notifications/${id}/read`);
};