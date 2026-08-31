import { z } from "zod";
import { apiClient } from "../../../lib/axios";
import { STEP_UP_TOKEN_HEADER } from "../../../lib/stepUp";
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

export const addBeneficiaryApi = async (data: BeneficiaryFormData, stepUpToken?: string): Promise<Beneficiary> => {
  const { data: response } = await apiClient.post('/beneficiaries', data, stepUpToken ? {
    headers: {
      [STEP_UP_TOKEN_HEADER]: stepUpToken,
    },
  } : undefined);
  return BeneficiaryResponseSchema.parse(response);
};

export const updateBeneficiaryApi = async (id: string, data: BeneficiaryFormData, stepUpToken?: string): Promise<Beneficiary> => {
  const { data: response } = await apiClient.put(`/beneficiaries/${id}`, data, stepUpToken ? {
    headers: {
      [STEP_UP_TOKEN_HEADER]: stepUpToken,
    },
  } : undefined);
  return BeneficiaryResponseSchema.parse(response);
};

export const deleteBeneficiaryApi = async (id: string, stepUpToken?: string): Promise<void> => {
  await apiClient.delete(`/beneficiaries/${id}`, stepUpToken ? {
    headers: {
      [STEP_UP_TOKEN_HEADER]: stepUpToken,
    },
  } : undefined);
};
