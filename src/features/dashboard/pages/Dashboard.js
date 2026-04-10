import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table } from '../../../shared/components/Table';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { Button } from '../../../shared/components/Button';
import { SkeletonBox } from '../../../shared/components/SkeletonLoader';
import { useDashboard } from '../hooks/useDashboard';
import { ContractDetailDrawer } from '../../contracts/components/ContractDetailDrawer';
import { ConfirmationDialog } from '../../../shared/components/ConfirmationDialog';
import { deleteContract } from '../../contracts/services/contractApi';
import { Trash2 } from 'lucide-react';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { data: stats, loading, error, retry } = useDashboard();
  
  // Drawer states
  const [selectedContractId, setSelectedContractId] = useState(null);

  // Delete states
  const [contractToDelete, setContractToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!contractToDelete) return;
    setIsDeleting(true);
    try {
      await deleteContract(contractToDelete.id);
      retry();
    } catch (err) {
      console.error("Failed to delete", err);
    } finally {
      setIsDeleting(false);
      setContractToDelete(null);
    }
  };

  if (error) {
    return (
      <div className="bg-error-container text-on-error-container p-6 rounded-xl my-6">
        <h3 className="font-bold text-lg mb-2">Error Loading Dashboard</h3>
        <p>{error}</p>
        <Button variant="secondary" className="mt-4" onClick={retry}>Retry</Button>
      </div>
    );
  }

  const contractColumns = [
    { header: 'ID', accessor: 'id', render: (row) => <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1 py-0.5 rounded truncate max-w-[80px] inline-block" title={row.id}>{row.id}</span> },
    { header: 'Client / Project', accessor: 'title', render: (row) => (
      <div>
        <p className="font-bold">{row.company}</p>
        <p className="text-xs text-on-surface-variant font-medium">{row.title}</p>
      </div>
    )},
    { header: 'Value', accessor: 'value', render: (row) => <span className="font-bold text-on-surface">{row.value}</span> },
    { header: 'End Date', accessor: 'dateAdded', render: (row) => <span className="text-on-surface-variant font-medium">{row.expires ? new Date(row.expires).toLocaleDateString() : 'N/A'}</span> },
    { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> },
    { 
      header: '', 
      accessor: 'actions', 
      render: (row) => (
        <button 
          onClick={(e) => { e.stopPropagation(); setContractToDelete(row); }}
          className="p-2 text-slate-400 hover:text-error hover:bg-error-container/30 rounded-full transition-colors"
        >
          <Trash2 size={16} />
        </button>
      )
    }
  ];

  return (
    <div className="animate-in fade-in max-w-[1600px] w-full">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">Dashboard Overview</h2>
          <p className="text-on-surface-variant mt-1 font-medium">Live operational intelligence for your organization.</p>
        </div>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {loading ? (
             Array.from({ length: 4 }).map((_, i) => (
               <div key={i} className="bg-surface-container-lowest p-6 rounded-xl border border-slate-100 shadow-sm">
                 <SkeletonBox className="h-4 w-32 mb-4 rounded-lg" />
                 <SkeletonBox className="h-10 w-24 mb-2 rounded-lg" />
               </div>
             ))
        ) : (
          <>
            <div className="bg-surface-container-lowest shadow-sm p-6 rounded-xl border-l-4 border-primary group hover:bg-surface-container-high transition-all">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Active Contracts</p>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-bold text-on-surface">{stats?.activeContracts || 0}</h3>
                <div className="text-primary bg-primary-container/10 p-2 rounded-lg">
                  <span className="material-symbols-outlined">description</span>
                </div>
              </div>
            </div>
            
            <div className="bg-surface-container-lowest shadow-sm p-6 rounded-xl border-l-4 border-primary group hover:bg-surface-container-high transition-all">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Total Value</p>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-bold text-on-surface">${stats?.totalContractValue ? (stats.totalContractValue / 100).toLocaleString() : '0'}</h3>
                <div className="text-primary bg-primary-container/10 p-2 rounded-lg">
                  <span className="material-symbols-outlined">trending_up</span>
                </div>
              </div>
            </div>
            
            <div className="bg-surface-container-lowest shadow-sm p-6 rounded-xl border-l-4 border-tertiary group hover:bg-surface-container-high transition-all">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Pending Review</p>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-bold text-on-surface">{stats?.pendingReview || 0}</h3>
                <div className="text-tertiary bg-tertiary-fixed/10 p-2 rounded-lg">
                  <span className="material-symbols-outlined">pending_actions</span>
                </div>
              </div>
            </div>
            
            <div className="bg-surface-container-lowest shadow-sm p-6 rounded-xl border-l-4 border-secondary group hover:bg-surface-container-high transition-all">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Total Employees</p>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-bold text-on-surface">12</h3>
                <div className="text-secondary bg-secondary-container/20 p-2 rounded-lg">
                  <span className="material-symbols-outlined">groups</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Action Required Section */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-error" style={{fontVariationSettings: "'FILL' 1"}}>warning</span>
          <h3 className="text-lg font-bold">Action Required</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 bg-error-container/30 border border-error/10 rounded-xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-error text-on-error p-2 rounded-lg">
                <span className="material-symbols-outlined text-sm">event_busy</span>
              </div>
              <div>
                <p className="font-bold text-on-error-container">{stats?.expiringSoon || 0} Contracts expiring in 30 days</p>
                <p className="text-xs font-medium text-on-error-container/70">Requires your immediate renewal review.</p>
              </div>
            </div>
            <button onClick={() => navigate('/contracts')} className="text-xs font-bold px-4 py-2 bg-error text-on-error rounded-lg hover:bg-error/90 transition-colors shadow-sm tracking-wide">Review</button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-tertiary-fixed/30 border border-tertiary/10 rounded-xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-tertiary text-on-tertiary p-2 rounded-lg">
                <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
              </div>
              <div>
                <p className="font-bold text-on-tertiary-container">Pending payment for Project X</p>
                <p className="text-xs font-medium text-on-tertiary-container/70">Invoice #4582 is 3 days overdue</p>
              </div>
            </div>
            <button className="text-xs font-bold px-4 py-2 bg-tertiary text-on-tertiary rounded-lg hover:bg-tertiary/90 transition-colors shadow-sm tracking-wide">Remind</button>
          </div>
        </div>
      </section>

      {/* Bento Grid Insights */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Contracts Module */}
        <div className="col-span-12 lg:col-span-7 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Recent Contracts</h3>
            <button onClick={() => navigate('/contracts')} className="text-primary text-sm font-semibold hover:underline">View All</button>
          </div>
          <Table 
              columns={contractColumns} 
              data={stats?.recentContracts} 
              isLoading={loading}
              onRowClick={(row) => setSelectedContractId(row.id)} 
              emptyMessage="No contracts found."
            />
        </div>

        {/* Finance & HR Modules */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm">
            <h3 className="text-lg font-bold mb-4">Revenue Summary</h3>
            <div className="h-32 flex items-end justify-between gap-2">
              {[40, 60, 85, 55, 100, 75, 90].map((height, i) => (
                 <div key={i} className="w-full bg-primary-container/20 rounded-t-lg transition-all hover:bg-primary cursor-pointer" style={{ height: `${height}%` }}></div>
              ))}
            </div>
            <div className="mt-4 flex justify-between items-center border-t border-slate-100 pt-3">
              <p className="text-xs text-on-surface-variant font-medium">Last 7 Months Performance</p>
              <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded">+12.4%</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm">
            <h3 className="text-lg font-bold mb-4">HR & Talent</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-surface rounded-lg">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <span className="material-symbols-outlined">trending_up</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">Team Growth</p>
                  <p className="text-xs font-medium text-on-surface-variant">+2 new hires this month</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 bg-surface rounded-lg">
                <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary border border-tertiary/20">
                  <span className="material-symbols-outlined">beach_access</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">Upcoming Leaves</p>
                  <p className="text-xs font-medium text-on-surface-variant">Sarah Mitchell (Oct 30-Nov 4)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Drawers */}
      <ContractDetailDrawer 
        id={selectedContractId} 
        onClose={() => setSelectedContractId(null)} 
      />
      <ConfirmationDialog 
        isOpen={!!contractToDelete}
        onClose={() => setContractToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Contract"
        message={`Are you sure you want to delete "${contractToDelete?.title}"? This action cannot be undone.`}
        isProcessing={isDeleting}
      />
    </div>
  );
};
