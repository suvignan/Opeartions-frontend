import { apiClient } from '../../../shared/utils/apiClient';
import { mapContractResponse, mapContractsListResponse, mapDashboardStats } from '../utils/contractMappers';



export const getContracts = async (params = {}) => {
  console.log(`[API CALL] METHOD: GET, URL: /contracts/`);
  const data = await apiClient.get('/contracts/', { params });
  return mapContractsListResponse(data);
};

export const getContractById = async (id) => {
  console.log(`[API CALL] METHOD: GET, URL: /contracts/${id}`);
  const data = await apiClient.get(`/contracts/${id}`);
  return mapContractResponse(data);
};

export const createContract = async (payload) => {
  console.log(`[API CALL] METHOD: POST, URL: /contracts/, PAYLOAD:`, payload);
  const data = await apiClient.post('/contracts/', payload);
  return mapContractResponse(data);
};

export const updateContract = async (id, payload) => {
  console.log(`[API CALL] METHOD: PATCH, URL: /contracts/${id}, PAYLOAD:`, payload);
  const data = await apiClient.patch(`/contracts/${id}`, payload);
  return mapContractResponse(data);
};

export const updateContractStatus = async (id, status) => {
  console.log(`[API CALL] METHOD: PATCH, URL: /contracts/${id}/status, PAYLOAD:`, { status });
  const data = await apiClient.patch(`/contracts/${id}/status`, { status });
  return mapContractResponse(data);
};

export const deleteContract = async (id) => {
  // Hard delete is usually prohibited. Archiving preferred.
  // Including for mock fallback structure.
  await apiClient.delete(`/contracts/${id}`);
  return true;
};

export const getDashboardStats = async () => {
  // Use mock or handle fallback since backend doesn't have this yet
  try {
    const data = await apiClient.get('/dashboard/summary');
    return mapDashboardStats(data);
  } catch(e) {
    // Fallback while stats endpoint isn't built
    return mapDashboardStats({
      total_contract_value: 0,
      active_contracts: 0,
      expiring_soon: 0,
      pending_review: 0
    });
  }
};
