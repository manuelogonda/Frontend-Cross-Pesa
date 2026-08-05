import { useCallback, useState } from "react";
import type { BeneficiaryFormData } from "../validation/beneficiarySchema";
import { addBeneficiaryApi, deleteBeneficiaryApi, fetchBeneficiariesApi, updateBeneficiaryApi } from "../api/beneficiaryApi";
import { ZodError } from "zod";
import type { Beneficiary } from "../../transfer/types/finance";

export const useBeneficiaries = () => {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to extract clean error messages from the backend
  const handleError = (err: any) => {
    if (err instanceof ZodError) {
      console.error("Zod Validation Error:", err.errors);
      setError("Data format error. Please check your inputs.");
    } else {
      setError(err.response?.data?.message || err.message || "An unexpected error occurred.");
    }
    throw err; // Re-throw so the UI form knows to stop its loading state
  };

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchBeneficiariesApi();
      setBeneficiaries(data);
    } catch (err: any) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const add = async (payload: BeneficiaryFormData) => {
    setError(null);
    try {
      await addBeneficiaryApi(payload);
      await load(); // Refresh the list automatically
    } catch (err: any) {
      handleError(err);
    }
  };

  const update = async (id: string, payload: BeneficiaryFormData) => {
    setError(null);
    try {
      await updateBeneficiaryApi(id, payload);
      await load();
    } catch (err: any) {
      handleError(err);
    }
  };

  const remove = async (id: string) => {
    setError(null);
    try {
      await deleteBeneficiaryApi(id);
      await load();
    } catch (err: any) {
      handleError(err);
    }
  };

  return { 
    beneficiaries, 
    isLoading, 
    error, 
    load, 
    refetch: load,
    add, 
    update, 
    remove 
  };
};