import React, { useState } from 'react';
import { useContractDetail } from '../hooks/useContractDetail';
import { Edit, Download, Star, Sparkles } from 'lucide-react';
import { Button } from '../../../shared/components/Button';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { SkeletonBox } from '../../../shared/components/SkeletonLoader';
import { Drawer } from '../../../shared/components/Drawer';
import { updateContract, updateContractStatus } from '../services/contractApi';

export const ContractDetailDrawer = ({ id, onClose }) => {
  const { data: contract, loading, error, retry } = useContractDetail(id);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({});
  const [saveError, setSaveError] = useState(null);
  const [isApproving, setIsApproving] = useState(false);
  const [approveError, setApproveError] = useState(null);

  const startEdit = () => {
    setEditData({
      title: contract.title || '',
      type: contract.type || 'SUBSCRIPTION',
      counterpartyId: contract.counterparty?.id || '',
      counterpartyName: contract.counterparty?.name || '',
      tcv: (contract.financials?.tcvCents / 100) || '',
      acv: (contract.financials?.acvCents / 100) || '',
      currency: contract.financials?.currency || 'USD',
      startDate: contract.timeline?.startDate || '',
      endDate: contract.timeline?.endDate || '',
      autoRenew: !!contract.timeline?.autoRenew,
    });
    setSaveError(null);
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    
    // Detect changes and build partial payload
    const payload = {};
    // 0. Title and Type
    if (editData.title !== contract.title) payload.title = editData.title;
    if (editData.type !== contract.type) payload.type = editData.type;

    // 1. Counterparty check
    const oldCp = contract.counterparty || {};
    if (editData.counterpartyName !== oldCp.name) {
      // They changed the name; send the name (backend will resolve/create).
      payload.counterparty = { name: editData.counterpartyName };
    } else if (editData.counterpartyId !== String(oldCp.id || '')) {
      // (Fallback) They somehow changed the ID, send ID.
      if (editData.counterpartyId) payload.counterparty_id = editData.counterpartyId;
    }

    // 2. Financials
    const currFin = contract.financials || {};
    const finPayload = {};
    const newTcv = parseInt(String(editData.tcv).replace(/[^0-9]/g, ''), 10) * 100;
    const newAcv = parseInt(String(editData.acv).replace(/[^0-9]/g, ''), 10) * 100;

    if (!isNaN(newTcv) && newTcv !== currFin.tcvCents) finPayload.tcv_cents = newTcv;
    if (!isNaN(newAcv) && newAcv !== currFin.acvCents) finPayload.acv_cents = newAcv;
    if (editData.currency !== currFin.currency) finPayload.currency = editData.currency;
    if (Object.keys(finPayload).length > 0) payload.financials = finPayload;

    // 3. Timeline
    const currTime = contract.timeline || {};
    const timePayload = {};
    if (editData.startDate !== currTime.startDate) timePayload.start_date = editData.startDate;
    if (editData.endDate !== (currTime.endDate || '')) timePayload.end_date = editData.endDate || null;
    if (editData.autoRenew !== currTime.autoRenew) timePayload.auto_renew = editData.autoRenew;
    if (Object.keys(timePayload).length > 0) payload.timeline = timePayload;

    // No changes sent if empty
    if (Object.keys(payload).length === 0) {
      setIsEditing(false);
      setIsSaving(false);
      return;
    }

    try {
      await updateContract(id, payload);
      await retry();
      setIsEditing(false);
    } catch (err) {
      if (err.response?.status === 409) {
        setSaveError("Conflict: A contract with this counterparty and start date already exists.");
      } else {
        const detail = err.response?.data?.detail;
        setSaveError(Array.isArray(detail) ? detail[0]?.msg : (detail || err.message || "Failed to update"));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleApprove = async () => {
    setIsApproving(true);
    setApproveError(null);
    
    // Debug logging as requested
    console.log("APPROVE ACTION TRIGGERED:");
    console.log("METHOD: PATCH");
    console.log("URL:", `/contracts/${contract.id}/status`);
    console.log("PAYLOAD:", { status: "ACTIVE" });

    try {
      await updateContractStatus(contract.id, "ACTIVE");
      await retry();
    } catch (err) {
      const status = err.response?.status;
      if (status === 405) {
        setApproveError("Incorrect API method: Method Not Allowed. Check backend routing.");
      } else if (status === 404) {
        setApproveError("Contract not found on server.");
      } else if (status === 400 || status === 422) {
        const detail = err.response?.data?.detail;
        setApproveError(Array.isArray(detail) ? detail[0]?.msg : (detail || "Validation error preventing approval."));
      } else if (status === 409) {
        setApproveError("Conflict updating status.");
      } else {
        setApproveError(`Unexpected error: ${err.message}`);
      }
    } finally {
      setIsApproving(false);
    }
  };

  const renderContent = () => {
    if (error || (!loading && !contract)) {
      return (
        <div className="p-8 text-center bg-error-container text-on-error-container justify-center h-full flex flex-col items-center">
          <h3 className="text-xl font-bold mb-2">Error Loading Information</h3>
          <p className="mb-4">{error || "Contract not found"}</p>
          <Button onClick={retry}>Retry API</Button>
        </div>
      );
    }

    return (
      <div className="flex flex-col lg:flex-row gap-8 p-6">
        {/* Left Column: Main Setup */}
        <div className="flex-1 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1 block">Contract Details</span>
              {loading ? (
                 <>
                   <SkeletonBox className="h-10 w-96 mb-2 rounded-lg" />
                   <SkeletonBox className="h-4 w-64" />
                 </>
              ) : (
                <>
                  <h2 className="text-3xl font-bold tracking-tight text-on-surface">{contract.title}</h2>
                  <p className="text-slate-500 mt-2 font-medium">Counterparty: {contract.counterparty?.name}</p>
                </>
              )}
            </div>
            {loading ? <SkeletonBox className="h-6 w-20 rounded" /> : <StatusBadge status={contract.status} />}
          </div>

          {/* Actions */}
          {!isEditing ? (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Button variant="secondary" disabled={loading} onClick={startEdit}><Edit size={16} /> Edit Details</Button>
                <Button variant="secondary" disabled={loading}><Download size={16} /> Download PDF</Button>
                {contract?.status === 'PENDING_REVIEW' && (
                  <Button 
                    onClick={handleApprove} 
                    disabled={isApproving || loading}
                    className="ml-auto bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {isApproving ? "Approving..." : "Approve & Activate"}
                  </Button>
                )}
              </div>
              {approveError && (
                 <div className="p-3 mt-2 bg-error-container text-on-error-container rounded-lg text-sm border border-error/20">
                   <strong>Error Approving:</strong> {approveError}
                 </div>
              )}
            </div>
          ) : (
             <div className="flex items-center gap-2 p-3 bg-surface-container-high rounded-xl border border-primary/20">
               <span className="font-bold text-primary flex-1">Editing Mode Active</span>
               <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={isSaving}>Cancel</Button>
               <Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
             </div>
          )}

          {saveError && (
             <div className="p-3 bg-error-container text-on-error-container rounded-lg text-sm border border-error/20">
               {saveError}
             </div>
          )}

          {/* Display Metadata or Form */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100/50 p-6">
            {loading ? (
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {Array.from({length: 4}).map((_, i) => (
                    <div key={i}>
                      <SkeletonBox className="h-3 w-16 mb-2" />
                      <SkeletonBox className="h-6 w-24" />
                    </div>
                 ))}
               </div>
                        ) : isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Contract Title</label>
                  <input className="w-full p-2 border rounded text-lg font-bold" value={editData.title} onChange={e=>setEditData(d=>({...d, title: e.target.value}))} disabled={isSaving} placeholder="Contract Title" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-1">Type</label>
                    <select className="w-full p-2 border rounded" value={editData.type} onChange={e=>setEditData(d=>({...d, type: e.target.value}))} disabled={isSaving}>
                      <option value="SUBSCRIPTION">Subscription</option>
                      <option value="MSA">MSA</option>
                      <option value="PARTNERSHIP">Partnership</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-1">Counterparty ID (Locked)</label>
                    <input className="w-full p-2 border rounded bg-slate-50 text-slate-400 cursor-not-allowed" value={editData.counterpartyId} readOnly disabled placeholder="UUID" title="Counterparty ID cannot be edited explicitly" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Counterparty Name</label>
                  <input className="w-full p-2 border rounded" value={editData.counterpartyName} onChange={e=>setEditData(d=>({...d, counterpartyName: e.target.value}))} disabled={isSaving} placeholder="Company Name" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-1">Currency</label>
                    <select className="w-full p-2 border rounded" value={editData.currency} onChange={e=>setEditData(d=>({...d, currency: e.target.value}))} disabled={isSaving}>
                      <option value="USD">USD</option><option value="EUR">EUR</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-1">TCV</label>
                    <input className="w-full p-2 border rounded" value={editData.tcv} onChange={e=>setEditData(d=>({...d, tcv: e.target.value}))} disabled={isSaving} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-1">ACV</label>
                    <input className="w-full p-2 border rounded" value={editData.acv} onChange={e=>setEditData(d=>({...d, acv: e.target.value}))} disabled={isSaving} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-1">Start Date</label>
                    <input type="date" className="w-full p-2 border rounded" value={editData.startDate} onChange={e=>setEditData(d=>({...d, startDate: e.target.value}))} disabled={isSaving} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-1">End Date</label>
                    <input type="date" className="w-full p-2 border rounded" value={editData.endDate} onChange={e=>setEditData(d=>({...d, endDate: e.target.value}))} disabled={isSaving} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Value</p>
                  <p className="text-lg font-semibold">${((contract.financials?.tcvCents||0)/100).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Start Date</p>
                  <p className="text-lg font-semibold">{contract.timeline?.startDate ? new Date(contract.timeline.startDate).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">End Date</p>
                  <p className="text-lg font-semibold">{contract.timeline?.endDate ? new Date(contract.timeline.endDate).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Renewal</p>
                  <p className="text-lg font-semibold">{contract.timeline?.autoRenew ? 'Auto-renew' : 'Manual'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Document Viewer Placeholder */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl h-[400px] flex items-center justify-center p-8 text-center text-slate-400">
            <div>
               <FileText size={48} className="mx-auto mb-4 opacity-50" />
               <p className="font-semibold">Document Viewer Placeholder</p>
               <p className="text-sm">In a real application, a PDF Viewer would mount here once streaming from the API.</p>
            </div>
          </div>
        </div>

        {/* Right Column: AI Intelligence Drawer within Drawer */}
        <div className="w-full lg:w-80 bg-surface-container-low rounded-xl border border-slate-100/50 h-fit p-6 top-6">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-4">
            <Sparkles className="text-indigo-600" size={20} />
            <h3 className="text-lg font-bold text-on-surface">Intelligence Insights</h3>
          </div>
          
          {loading ? (
             <div className="space-y-4">
                <SkeletonBox className="h-24 w-full rounded-lg" />
                <SkeletonBox className="h-24 w-full rounded-lg" />
             </div>
          ) : (
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-surface-container-lowest border-l-4 border-indigo-600 shadow-sm">
                 <div className="flex items-center gap-2 mb-2 text-indigo-800">
                   <Star size={16} />
                   <h4 className="text-sm font-bold">Key Terms Extracted</h4>
                 </div>
                 <ul className="text-xs text-slate-600 space-y-2 list-disc pl-5">
                   <li>Governing Law: Delaware</li>
                   <li>Payment Terms: Net 45</li>
                   <li>Limitation of Liability: 1x Contract Value</li>
                 </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-error-container/50 border-l-4 border-error shadow-sm">
                 <h4 className="text-sm font-bold text-error mb-1">Risk Warning</h4>
                 <p className="text-xs text-slate-700">The indemnification clause lacks standard reciprocal protections.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Drawer isOpen={!!id} onClose={onClose} title="Contract Review" width="max-w-[70vw]">
      {id ? renderContent() : null}
    </Drawer>
  );
};

const FileText = ({ size, className }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>;
