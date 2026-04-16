/**
 * Strict Data Mappers
 * Maps actual backend payload schemas to reliable frontend UI models.
 * If backend drops a required field, this throws!
 */

export const mapContractResponse = (apiContract) => {
  if (!apiContract.id || !apiContract.counterparty || !apiContract.financials) {
      throw new Error(`Invalid API Payload: Contract ${apiContract.id} is missing core fields`);
  }

  // Extract company strictly from backend
  const cpName = apiContract.counterparty.name || 'Unknown';

  return {
    id: String(apiContract.id),
    contract_code: apiContract.contract_code || null,
    contractCode: apiContract.contract_code || null,
    title: apiContract.title,
    type: apiContract.type,
    status: apiContract.status,
    
    counterparty: {
      id: apiContract.counterparty.id || null,
      name: cpName
    },
    
    financials: {
      tcvCents: apiContract.financials?.tcv_cents || 0,
      acvCents: apiContract.financials?.acv_cents || 0,
      currency: apiContract.financials?.currency || 'USD'
    },
    
    timeline: {
      startDate: apiContract.timeline?.start_date,
      endDate: apiContract.timeline?.end_date || null,
      autoRenew: !!apiContract.timeline?.auto_renew
    },
    
    audit: {
      ownerId: apiContract.audit?.created_by,
      createdAt: apiContract.audit?.created_at,
      updatedAt: apiContract.audit?.updated_at
    }
  };
};

export const mapContractsListResponse = (apiData) => {
  // apiData from backend comes as { data: [], meta: {} }
  const data = apiData?.data || [];
  return {
    data: data.map(mapContractResponse),
    meta: apiData?.meta || { page: 1, limit: 10, total: 0 }
  };
};

export const mapDashboardStats = (apiData) => {
  // Simple pass-through for backend-derived scalars
  return {
    totalContractValue: apiData.total_contract_value || 0,
    activeContracts: apiData.active_contracts || 0,
    expiringSoon: apiData.expiring_soon || 0,
    pendingReview: apiData.pending_review || 0,
  };
};
