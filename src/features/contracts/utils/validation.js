import { z } from 'zod';

export const CreateContractSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200, "Title is too long"),
  type: z.enum(['SUBSCRIPTION', 'MSA', 'NDA', 'PARTNERSHIP']),
  
  counterparty: z.object({
    id: z.string().nullable().optional(),
    name: z.string().min(1, "Counterparty name is required")
  }),
  
  financials: z.object({
    tcvCents: z.number().int().min(0, "Total Contract Value cannot be negative"),
    acvCents: z.number().int().min(0, "Annual Contract Value cannot be negative"),
    currency: z.string().min(3).max(3), // ISO-4217 roughly
    paymentSchedule: z.enum(['MONTHLY', 'QUARTERLY', 'ANNUALLY', 'CUSTOM'])
  }),
  
  timeline: z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start Date must be YYYY-MM-DD"),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End Date must be YYYY-MM-DD").nullable().or(z.literal('')),
    autoRenew: z.boolean()
  }),
  
  metadata: z.object({
    noticePeriodDays: z.number().int().min(0, "Notice period must be positive")
  })
}).refine(data => {
  if (data.timeline.endDate) {
    return new Date(data.timeline.startDate) <= new Date(data.timeline.endDate);
  }
  return true;
}, {
  message: "End Date must be conceptually after Start Date",
  path: ["timeline", "endDate"]
});
