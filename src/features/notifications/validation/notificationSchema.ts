import { z } from 'zod';

export const NotificationSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  message: z.string(),
  notificationType: z.enum(['EMAIL', 'SMS', 'IN_APP']),
  status: z.enum(['UNREAD', 'READ', 'ARCHIVED']),
  metadata: z.record(z.any()).nullable().optional(),
  createdAt: z.string(), // ISO date string
});

// Infer the TypeScript type from the Zod schema
export type Notification = z.infer<typeof NotificationSchema>;

