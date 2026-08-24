import { z } from "zod";
import { apiClient } from "../../../lib/axios";
import {
  BeneficiaryResponseSchema,
  type Beneficiary,
  type BeneficiaryFormData,
} from "../validation/beneficiarySchema";

/**
 * Fetches saved beneficiaries.
 *
 * Defensive against BOTH backend pagination shapes (flat array vs Spring
 * PagedModel `.content`), then enforces the Zod contract — previously this
 * returned untyped `any`, leaving every consumer to guess the shape.
 */
export const fetchBeneficiariesApi = async (): Promise<Beneficiary[]> => {
  const { data } = await apiClient.get<unknown>('/beneficiaries');

  const rawList = Array.isArray(data)
    ? data
    : ((data as { content?: unknown[] })?.content ?? []);

  return z.array(BeneficiaryResponseSchema).parse(rawList);
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