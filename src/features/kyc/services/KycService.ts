import { apiClient } from "../../../lib/axios";
import type { KycSubmissionFormData } from "../validation/KycShema";

export interface KycResponse {
  id: string;
  documentType: string;
  documentCountry: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  createdAt: string;
  idImageUrl?: string;     
  selfieImageUrl?: string; 
  userEmail?: string;      
}

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number; 
}

export const submitKycForm = async (data: KycSubmissionFormData): Promise<KycResponse> => {
  const response = await apiClient.post<KycResponse>('/kyc/submit', data);
  return response.data;
};

export const fetchMyKycHistory = async (): Promise<KycResponse[]> => {
  const response = await apiClient.get<KycResponse[]>('/kyc/my-history');
  return response.data;
};

// Admin Methods
export const fetchAdminSubmissions = async (page: number, size: number, status?: string): Promise<PaginatedResponse<KycResponse>> => {
  const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
  if (status && status !== 'ALL') params.append('status', status);
  
  const response = await apiClient.get<PaginatedResponse<KycResponse>>(`/kyc/admin/submissions?${params.toString()}`);
  return response.data;
};

export const reviewKycSubmission = async (id: string, action: 'APPROVED' | 'REJECTED', reason?: string): Promise<KycResponse> => {
  const response = await apiClient.post<KycResponse>(`/kyc/admin/submissions/${id}/review`, { action, reason });
  return response.data;
};