import { useCallback, useState } from "react";
import { createBeneficiary, getBeneficiaries, modifyBeneficiary, removeBeneficiary } from "../services/beneficiaryService";
import type { BeneficiaryFormData } from "../validation/beneficiarySchema";

export const useBeneficiaries = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getBeneficiaries();
      setData(res);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const add = async (payload: BeneficiaryFormData) => {
    await createBeneficiary(payload);
    await load();
  };

    const update = async (id: string, payload: BeneficiaryFormData) => {
    await modifyBeneficiary(id, payload);
    await load();
  };

  const remove = async (id: string) => {
    await removeBeneficiary(id); 
    await load();
  };

  return { data, isLoading, error, load, add, remove, update };
};