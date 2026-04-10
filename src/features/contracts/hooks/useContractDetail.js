import { useState, useEffect, useCallback } from 'react';
import { getContractById } from '../services/contractApi';

export const useContractDetail = (id) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getContractById(id);
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to fetch contract details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, retry: fetchData };
};
