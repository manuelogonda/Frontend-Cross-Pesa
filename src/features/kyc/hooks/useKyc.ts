import { useCallback, useState } from "react";
import { fetchAdminSubmissions, fetchMyKycHistory, reviewKycSubmission, submitKycForm } from "../services/KycService";
import type { KycSubmissionFormData } from "../validation/kycSchema";

export const useKyc = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- USER ACTIONS ---
  const submitKyc = async (data: KycSubmissionFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      return await submitKycForm(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit KYC.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getMyHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      return await fetchMyKycHistory();
    } catch (err: any) {
      setError("Failed to fetch KYC history.");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- ADMIN ACTIONS ---
  const getAdminQueue = useCallback(async (page: number, size: number = 10, status: string = 'PENDING') => {
    setIsLoading(true);
    try {
      return await fetchAdminSubmissions(page, size, status);
    } catch (err: any) {
      setError("Failed to fetch admin queue.");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const processReview = async (id: string, action: 'APPROVED' | 'REJECTED', reason?: string) => {
    setIsLoading(true);
    try {
      return await reviewKycSubmission(id, action, reason);
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${action.toLowerCase()} submission.`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    submitKyc,
    getMyHistory,
    getAdminQueue,
    processReview
  };
};