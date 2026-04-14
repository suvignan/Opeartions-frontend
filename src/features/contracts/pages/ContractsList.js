import React, { useState } from 'react';
import { Table } from '../../../shared/components/Table';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { Button } from '../../../shared/components/Button';
import { useContracts } from '../hooks/useContracts';
import { Plus, Edit } from 'lucide-react';
import { ContractDetailDrawer } from '../components/ContractDetailDrawer';
import { CreateContractDrawer } from '../components/CreateContractDrawer';

export const ContractsList = () => {
  // ── States ─────────────────────────────────────────────────────────
  const [params, setParams] = useState({ page: 1, limit: 10, status: 'ALL' });
  const { data: contracts, meta, loading, error, retry } = useContracts(params);
  
  const [selectedContractId, setSelectedContractId] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // ── Handlers ───────────────────────────────────────────────────────
  const handlePageChange = (newPage) => {
    setParams(prev => ({ ...prev, page: newPage }));
  };

  const handleStatusFilterChange = (e) => {
    setParams(prev => ({ ...prev, page: 1, status: e.target.value }));
  };

  const columns = [
    { header: 'ID', accessor: 'id', render: (row) => <span className="font-mono text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded truncate max-w-[80px] inline-block" title={row.id}>{row.id}</span> },
    { header: 'Title', accessor: 'title', render: (row) => <span className="font-semibold text-slate-700">{row.title}</span> },
    { header: 'Company', accessor: 'company', render: (row) => <span className="text-slate-500">{row.counterparty?.name || 'Unknown'}</span> },
    { header: 'Date Added', accessor: 'dateAdded', render: (row) => <span className="text-slate-500">{row.audit?.createdAt ? new Date(row.audit.createdAt).toLocaleDateString() : 'N/A'}</span> },
    { header: 'End Date', accessor: 'expires', render: (row) => <span className="text-slate-500">{row.timeline?.endDate ? new Date(row.timeline.endDate).toLocaleDateString() : 'N/A'}</span> },
    { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> },
    { 
      header: '', 
      accessor: 'actions', 
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); setSelectedContractId(row.id); }}
            title="Edit Details"
            className="p-2 text-slate-400 hover:text-primary hover:bg-primary-container/30 rounded-full transition-colors"
          >
            <Edit size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="animate-in fade-in w-full">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1 block">Repository</span>
          <h2 className="text-4xl font-bold tracking-tight text-on-surface">Contracts</h2>
        </div>
        <div className="flex gap-2">
          <select 
            className="p-2 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface text-sm outline-none focus:border-primary"
            value={params.status}
            onChange={handleStatusFilterChange}
          >
            <option value="ALL">All</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRED">Expired</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus size={16} /> New Contract
          </Button>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100/50 overflow-hidden min-h-[400px] flex flex-col">
        {error ? (
          <div className="p-8 text-center text-error border-b border-slate-50 flex-1">
            <p className="mb-4">{error}</p>
            <Button variant="secondary" onClick={retry} className="mx-auto">Retry API Connection</Button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <Table 
              columns={columns} 
              data={contracts} 
              isLoading={loading}
              onRowClick={(row) => setSelectedContractId(row.id)} 
              emptyMessage="No contracts found matching your filters."
            />
            {/* Pagination Controls */}
            {!loading && meta && Math.ceil(meta.total / meta.limit) > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-slate-100/50 bg-slate-50/50 mt-auto">
                <span className="text-sm text-slate-500">
                  Showing {Math.min((meta.page - 1) * meta.limit + 1, meta.total)} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} results
                </span>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => handlePageChange(meta.page - 1)} disabled={meta.page <= 1}>
                    Previous
                  </Button>
                  <Button variant="secondary" onClick={() => handlePageChange(meta.page + 1)} disabled={meta.page >= Math.ceil(meta.total / meta.limit)}>
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Embedded Drawers */}
      <CreateContractDrawer 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        onSuccess={retry} 
      />
      <ContractDetailDrawer 
        id={selectedContractId} 
        onClose={() => { setSelectedContractId(null); retry(); }} 
      />
    </div>
  );
};
