import { apiClient } from "../../../lib/axios";
import type { BeneficiaryFormData } from "../validation/beneficiarySchema";

export const fetchBeneficiariesApi = async () => {
  const { data } = await apiClient.get('/beneficiaries');
  return data;
};

export const addBeneficiaryApi = async (data: BeneficiaryFormData) => {
  return await apiClient.post('/beneficiaries', data);
};

export const updateBeneficiaryApi = async (id: string, data: BeneficiaryFormData) => {
  return await apiClient.put(`/beneficiaries/${id}`, data);
};

export const deleteBeneficiaryApi = async (id: string) => {
  return await apiClient.delete(`/beneficiaries/${id}`);
};