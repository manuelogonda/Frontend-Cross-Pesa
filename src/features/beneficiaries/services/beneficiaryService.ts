import { addBeneficiaryApi, deleteBeneficiaryApi, fetchBeneficiariesApi, updateBeneficiaryApi } from "../api/beneficiaryApi";
import { beneficiarySchema, type BeneficiaryFormData } from "../validation/beneficiarySchema";

export const getBeneficiaries = async () => {
  return await fetchBeneficiariesApi();
};

export const createBeneficiary = async (data: BeneficiaryFormData) => {
  const validated = beneficiarySchema.parse(data);
  return await addBeneficiaryApi(validated);
};

export const modifyBeneficiary = async (id: string, data: BeneficiaryFormData) => {
  const validated = beneficiarySchema.parse(data);
  return await updateBeneficiaryApi(id, validated);
};

export const removeBeneficiary = async (id: string) => {
  return await deleteBeneficiaryApi(id);
};