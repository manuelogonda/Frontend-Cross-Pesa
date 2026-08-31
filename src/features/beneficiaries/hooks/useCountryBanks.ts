import { useState, useEffect } from 'react';

interface Bank {
  id: number;
  code: string; // This goes directly into your Beneficiary entity's bankCode field
  name: string; // e.g., "KCB Bank", "NCBA Bank", "Stanbic Bank", "Absa Bank", "Co-operative Bank"
}

export function useCountryBanks(countryCode: string) {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!countryCode) return;
    setLoading(true);
    fetch(`/api/v1/payouts/banks/${countryCode}`)
      .then(res => res.json())
      .then(data => {
        setBanks(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [countryCode]);

  const getBankNameByCode = (code: string) => {
    return banks.find(b => b.code === code)?.name || code;
  };

  return { banks, loading, getBankNameByCode };
}