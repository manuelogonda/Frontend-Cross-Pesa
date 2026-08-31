import { useCallback, useEffect, useState } from "react";
import type { BeneficiaryFormData } from "../validation/beneficiarySchema";
import { addBeneficiaryApi, deleteBeneficiaryApi, fetchBeneficiariesApi, updateBeneficiaryApi } from "../api/beneficiaryApi";
import { ZodError } from "zod";
import type { Beneficiary } from "../validation/beneficiarySchema";

export const useBeneficiaries = () => {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to extract clean error messages from the backend
  const handleError = (err: any) => {
    if (err instanceof ZodError) {
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

  const add = async (payload: BeneficiaryFormData, stepUpToken?: string) => {
    setError(null);
    try {
      await addBeneficiaryApi(payload, stepUpToken);
      await load(); // Refresh the list automatically
    } catch (err: any) {
      handleError(err);
    }
  };

  const update = async (id: string, payload: BeneficiaryFormData, stepUpToken?: string) => {
    setError(null);
    try {
      await updateBeneficiaryApi(id, payload, stepUpToken);
      await load();
    } catch (err: any) {
      handleError(err);
    }
  };

  const remove = async (id: string, stepUpToken?: string) => {
    setError(null);
    try {
      await deleteBeneficiaryApi(id, stepUpToken);
      await load();
    } catch (err: any) {
      handleError(err);
    }
  };

  // Auto-fetch on mount so every consumer (TransferForm dropdown,
  // BeneficiaryPage list) gets data without calling load() manually.
  useEffect(() => {
    load().catch(() => {
      // handleError already stored the message in state for consumers to render
    });
  }, [load]);

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
