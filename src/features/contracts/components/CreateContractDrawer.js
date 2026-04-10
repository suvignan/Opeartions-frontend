import React, { useState } from 'react';
import { Button } from '../../../shared/components/Button';
import { FileUpload } from '../../../shared/components/FileUpload';
import { createContract } from '../services/contractApi';
import { Drawer } from '../../../shared/components/Drawer';
import { CreateContractSchema } from '../utils/validation';

const INITIAL_STATE = {
  title: '',
  type: 'SUBSCRIPTION',
  counterparty: { id: null, name: '' },
  financials: { tcv: '', acv: '', currency: 'USD', paymentSchedule: 'MONTHLY' },
  timeline: { startDate: '', endDate: '', autoRenew: true },
  metadata: { noticePeriodDays: 30 }
};

export const CreateContractDrawer = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setForm] = useState(INITIAL_STATE);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    setForm(INITIAL_STATE);
    setError(null);
    setIsSubmitting(false);
    setShowAdvanced(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // 1. Transform raw UI inputs to structured Schema format
      const rawPayload = {
        title: formData.title,
        type: formData.type,
        counterparty: formData.counterparty,
        financials: {
          tcvCents: parseInt((formData.financials.tcv || '0').replace(/[^0-9]/g, ''), 10) * 100, // naive string to cents
          acvCents: parseInt((formData.financials.acv || '0').replace(/[^0-9]/g, ''), 10) * 100,
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
        financials: {
          tcv_cents: validatedData.financials.tcvCents,
          acv_cents: validatedData.financials.acvCents,
          currency: validatedData.financials.currency
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
      await createContract(apiPayload);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      if (err.errors) {
         // Zod validation errors (naive display)
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

  // Intelligence
  const numericTcv = parseInt((formData.financials.tcv || '0').replace(/[^0-9]/g, ''));
  const showWarning = numericTcv > 100000 && formData.financials.paymentSchedule === 'CUSTOM';

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="New Contract" width="max-w-2xl">
      <div className="p-6 h-full flex flex-col bg-surface text-on-surface">
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
                    <option value="NDA">NDA</option>
                    <option value="PARTNERSHIP">Partnership</option>
                  </select>
                </div>
                <div>
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
              <h3 className="text-sm font-bold text-tertiary uppercase tracking-widest">2. Financials</h3>
            </div>
            
            {showWarning && (
              <div className="flex items-center gap-2 p-3 bg-error-container/20 border border-error/20 rounded-lg text-error text-sm">
                <span className="material-symbols-outlined">warning</span>
                <span>High-value contract (&gt;$100k) missing standard payment schedule.</span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
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
              <div className="col-span-1">
                <label className="block text-xs font-bold text-on-surface-variant mb-1">TCV</label>
                <input 
                  value={formData.financials.tcv} 
                  onChange={e => setForm({...formData, financials: {...formData.financials, tcv: e.target.value}})}
                  placeholder="Total Value" 
                  className="w-full p-2 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface text-sm outline-none focus:border-primary" 
                />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-bold text-on-surface-variant mb-1">ACV</label>
                <input 
                  value={formData.financials.acv} 
                  onChange={e => setForm({...formData, financials: {...formData.financials, acv: e.target.value}})}
                  placeholder="Annual Value" 
                  className="w-full p-2 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface text-sm outline-none focus:border-primary" 
                />
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
              <h3 className="text-sm font-bold text-secondary uppercase tracking-widest">3. Timeline</h3>
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
      </div>
    </Drawer>
  );
};
