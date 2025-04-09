export const StatusEnum = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export type StatusTypes = (typeof StatusEnum)[keyof typeof StatusEnum];
