export type EvaluationStatus = 'CONTACTED' | 'CANCELLED' | 'REJECTED' | 'IN_PROGRESS' | 'SCHEDULED' | 'VIVIER' | 'ACCEPTED';

export const EvaluationStatusList: EvaluationStatus[] = [
  'CANCELLED',
  'REJECTED',
  'IN_PROGRESS',
  'SCHEDULED',
  'VIVIER',
  'ACCEPTED'
];