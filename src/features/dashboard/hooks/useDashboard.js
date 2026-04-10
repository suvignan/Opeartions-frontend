import { useState, useEffect, useCallback } from 'react';
import { getDashboardStats, getContracts } from '../../contracts/services/contractApi';

export const useDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Execute concurrently
      const [apiStats, allContracts] = await Promise.all([
        getDashboardStats(),
        getContracts()
      ]);

      // FRONTEND DERIVED LOGIC
      // Compute actual expiring soon list directly based on real date diffs
      const now = new Date();
      const expiringList = allContracts
        .filter(c => c.expires && c.status === 'Active')
        .map(c => {
          const expiresDate = new Date(c.expires);
          const diffTime = expiresDate - now;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return { ...c, daysLeft: diffDays };
        })
        .filter(c => c.daysLeft > 0 && c.daysLeft <= 30)
        .sort((a, b) => a.daysLeft - b.daysLeft);

      // Merge backend stats with frontend computed metrics
      const computedStats = {
        ...apiStats,
        expiringSoon: { value: expiringList.length }, // Override with actual computed count
        expiringContractsList: expiringList
      };

      setStats({
        ...computedStats,
        recentContracts: allContracts.slice(0, 5)
      });
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { data: stats, loading, error, retry: fetchDashboard };
};
