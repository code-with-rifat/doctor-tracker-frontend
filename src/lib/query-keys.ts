export const queryKeys = {
  me: ['me'] as const,
  doctors: (params: Record<string, string>) => ['doctors', params] as const,
  doctor: (id: string) => ['doctors', id] as const,
  doctorPatients: (id: string, params: Record<string, string>) =>
    ['doctors', id, 'patients', params] as const,
  doctorFilters: ['doctors', 'filters'] as const,
  patients: (params: Record<string, string>) => ['patients', params] as const,
  patientFilters: ['patients', 'filters'] as const,
  dashboard: ['dashboard'] as const,
};
