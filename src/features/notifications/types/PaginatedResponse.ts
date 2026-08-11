export interface PaginatedResponse<T> {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface AppNotification {
  id: string; 
  title: string;
  message: string;
  status?: string; 
  createdAt: string;
}