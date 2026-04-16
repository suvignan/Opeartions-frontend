import React, { useState } from 'react';
import { Button } from '../../../shared/components/Button';
import { FileUpload } from '../../../shared/components/FileUpload';
import { createContract } from '../services/contractApi';
import { Drawer } from '../../../shared/components/Drawer';
import { CreateContractSchema } from '../utils/validation';
import { useProjectTypes } from '../hooks/useProjectTypes';

const INITIAL_STATE = {
  title: '',
  type: 'SUBSCRIPTION',
  projectType: '',
  counterparty: { id: null, name: '' },
  financials: { currency: 'USD', paymentSchedule: 'MONTHLY' },
  timeline: { startDate: '', endDate: '', autoRenew: true },
  metadata: { noticePeriodDays: 30 }
};

export const CreateContractDrawer = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setForm] = useState(INITIAL_STATE);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [createdContract, setCreatedContract] = useState(null);
  const { options: projectTypeOptions } = useProjectTypes();

  React.useEffect(() => {
    if (!isOpen) return;

    setForm(INITIAL_STATE);
    setError(null);
    setIsSubmitting(false);
    setShowAdvanced(false);
    setFieldErrors({});
    setCreatedContract(null);
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});
    
    try {
      // 1. Transform raw UI inputs to structured Schema format
      const rawPayload = {
        title: formData.title,
        type: formData.type,
        projectType: formData.projectType,
        counterparty: formData.counterparty,
        financials: {
          currency: formData.financials.currency,
          paymentSchedule: formData.financials.paymentSchedule
        },
        timeline: {
          startDate: formData.timeline.startDate,
          endDate: formData.timeline.endDate || null,
          autoRenew: formData.timeline.autoRenew
        },
        metadata: {
          noticePeriodDays: parseInt(formData.metadata.noticePeriodDays, 10)
        }
      };

      // 2. Validate via Zod Schema
      const validatedData = CreateContractSchema.parse(rawPayload);

      // 3. Construct the API branching payload mapped to FastAPI DB model
      const apiPayload = {
        title: validatedData.title,
        type: validatedData.type,
        project_type: validatedData.projectType,
        financials: {
          tcv_cents: 0,
          acv_cents: 0,
          currency: validatedData.financials.currency,
          payment_schedule: validatedData.financials.paymentSchedule
        },
        timeline: {
          start_date: validatedData.timeline.startDate,
          end_date: validatedData.timeline.endDate,
          auto_renew: validatedData.timeline.autoRenew
        }
      };

      // Branch Counterparty Logic
      if (validatedData.counterparty.id) {
        apiPayload.counterparty_id = validatedData.counterparty.id;
      } else {
        apiPayload.counterparty = { name: validatedData.counterparty.name };
      }

      // Dispatch
      const created = await createContract(apiPayload);
      setCreatedContract(created);
      if (onSuccess) onSuccess(created);
    } catch (err) {
      if (err.errors) {
         const nextFieldErrors = err.errors.reduce((acc, issue) => {
           const key = issue.path.join('.');
           if (!acc[key]) acc[key] = issue.message;
           return acc;
         }, {});
         setFieldErrors(nextFieldErrors);
         setError(err.errors[0].message);
      } else if (err.response) {
         if (err.response.status === 409) {
           setError("A contract with this counterparty and start date already exists (Conflict).");
         } else if (err.response.status === 400 || err.response.status === 422) {
           // Display specific backend validation message if available
           const detail = err.response.data?.detail;
           setError(Array.isArray(detail) ? detail[0]?.msg : (detail || "Validation Error"));
         } else {
           setError("An unexpected server error occurred.");
         }
      } else {
         setError(err.message || "Failed to create contract.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="New Contract" width="max-w-2xl">
      <div className="p-6 h-full flex flex-col bg-surface text-on-surface">
        {createdContract ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-12">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <span className="material-symbols-outlined">check</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-on-surface">Contract created</h3>
              <p className="mt-2 text-sm text-on-surface-variant">Your new contract ID is</p>
              <p className="mt-3 font-mono text-xl font-bold text-on-surface bg-surface-container-low px-4 py-2 rounded-lg inline-block">
                {createdContract.contract_code || createdContract.id}
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-8 overflow-y-auto pr-2">
          {error && (
            <div className="p-4 bg-error-container text-on-error-container rounded-lg text-sm font-semibold">
              <span className="material-symbols-outlined align-middle mr-2 mt-[-2px] text-[18px]">error</span>
              {error}
            </div>
          )}

          {/* SECTION A: Core Setup */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-primary uppercase tracking-widest border-b border-outline-variant/30 pb-2">1. Core Setup</h3>
            <div className="space-y-4">
              <div>
                <input 
                  value={formData.title} 
                  onChange={e => setForm({...formData, title: e.target.value})}
                  placeholder="Contract Title *" 
                  className="w-full text-3xl font-bold bg-transparent border-none outline-none focus:ring-0 text-on-surface placeholder-on-surface-variant/50"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Type</label>
                  <select 
                    value={formData.type} 
                    onChange={e => setForm({...formData, type: e.target.value})} 
                    className="w-full p-2 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface text-sm outline-none focus:border-primary"
                  >
                    <option value="SUBSCRIPTION">Subscription</option>
                    <option value="MSA">MSA</option>
                    <option value="PARTNERSHIP">Partnership</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Project Type *</label>
                  <select
                    value={formData.projectType}
                    onChange={e => {
                      const value = e.target.value;
                      setForm({ ...formData, projectType: value });
                      if (fieldErrors.projectType && value) {
                        setFieldErrors((prev) => ({ ...prev, projectType: null }));
                      }
                    }}
                    className="w-full p-2 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface text-sm outline-none focus:border-primary"
                  >
                    <option value="" disabled>Select project type</option>
                    {projectTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.projectType && (
                    <p className="mt-1 text-xs font-medium text-error">{fieldErrors.projectType}</p>
                  )}
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Counterparty *</label>
                  <input 
                    value={formData.counterparty.name} 
                    onChange={e => setForm({...formData, counterparty: { id: null, name: e.target.value }})}
                    placeholder="e.g. Acme Corp" 
                    className="w-full p-2 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface text-sm outline-none focus:border-primary" 
                   />
                </div>
              </div>
            </div>
          </section>

          {/* SECTION B: Financials */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2">
              <span className="material-symbols-outlined text-tertiary">payments</span>
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Currency</label>
                <select 
                  value={formData.financials.currency} 
                  onChange={e => setForm({...formData, financials: {...formData.financials, currency: e.target.value}})} 
                  className="w-full p-2 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface text-sm outline-none"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-2">Payment Schedule</label>
              <div className="flex gap-2">
                {[
                  { id: 'MONTHLY', label: 'Monthly' }, 
                  { id: 'QUARTERLY', label: 'Quarterly' }, 
                  { id: 'ANNUALLY', label: 'Annually' }, 
                  { id: 'CUSTOM', label: 'Custom' }
                ].map(sched => (
                  <button 
                    key={sched.id} 
                    type="button"
                    onClick={() => setForm({...formData, financials: {...formData.financials, paymentSchedule: sched.id}})}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${formData.financials.paymentSchedule === sched.id ? 'bg-tertiary text-on-tertiary shadow-sm' : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'}`}
                  >
                    {sched.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION C: Timeline */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2">
              <span className="material-symbols-outlined text-secondary">calendar_today</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Start Date *</label>
                <input 
                  type="date" 
                  value={formData.timeline.startDate} 
                  onChange={e => setForm({...formData, timeline: {...formData.timeline, startDate: e.target.value}})} 
                  className="w-full p-2 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface text-sm outline-none focus:border-primary [color-scheme:light] dark:[color-scheme:dark]" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">End Date</label>
                <input 
                  type="date" 
                  value={formData.timeline.endDate} 
                  onChange={e => setForm({...formData, timeline: {...formData.timeline, endDate: e.target.value}})} 
                  className="w-full p-2 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface text-sm outline-none focus:border-primary [color-scheme:light] dark:[color-scheme:dark]" 
                />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer mt-2">
              <input 
                type="checkbox" 
                checked={formData.timeline.autoRenew} 
                onChange={e => setForm({...formData, timeline: {...formData.timeline, autoRenew: e.target.checked}})} 
                className="w-4 h-4 text-primary rounded focus:ring-primary accent-primary" 
              />
              <span className="text-sm font-semibold text-on-surface">Auto-renew active (Software standard)</span>
            </label>
          </section>

          {/* SECTION D: Documents & Legal */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/30 pb-2">4. Documents & Legal</h3>
            <FileUpload onFileSelect={() => {}} accept=".pdf,.docx" />

            <div className="pt-2">
              <button 
                type="button" 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs font-bold text-on-surface-variant flex items-center hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-sm mr-1">{showAdvanced ? 'expand_less' : 'expand_more'}</span>
                {showAdvanced ? 'Hide Advanced Legal Settings' : 'Show Advanced Legal Settings'}
              </button>
              
              {showAdvanced && (
                <div className="mt-4 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 p-4 bg-surface-container-lowest border border-outline-variant/20 rounded-xl">
                   <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-1">Notice Period (Days)</label>
                    <select 
                      value={formData.metadata.noticePeriodDays} 
                      onChange={e => setForm({...formData, metadata: {...formData.metadata, noticePeriodDays: e.target.value}})} 
                      className="w-full p-2 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface text-sm outline-none focus:border-primary"
                    >
                      <option value="30">30 Days</option>
                      <option value="60">60 Days</option>
                      <option value="90">90 Days</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </section>

          <div className="pt-8 flex justify-end gap-3 pb-8 mt-auto sticky top-[100%]">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Validating...' : 'Create Contract'}
            </Button>
          </div>
        </form>
        )}
      </div>
    </Drawer>
  );
};
