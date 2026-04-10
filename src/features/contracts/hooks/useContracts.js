import { useState, useEffect, useCallback } from 'react';
import { getContracts } from '../services/contractApi';

export const useContracts = (params = {}) => {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stringify params for useEffect dependency array to avoid infinite loops
  const paramsStr = JSON.stringify(params);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Decode params back
      const queryParams = paramsStr ? JSON.parse(paramsStr) : {};
      const result = await getContracts(queryParams);
      setData(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(err.message || 'Failed to fetch contracts.');
    } finally {
      setLoading(false);
    }
  }, [paramsStr]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, meta, loading, error, retry: fetchData };
};
