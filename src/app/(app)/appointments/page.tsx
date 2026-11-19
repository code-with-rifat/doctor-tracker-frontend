'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { api, ApiRequestError } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { doctorName, formatFullDate } from '@/lib/utils';
import type { Appointment, Doctor, Paginated, Patient } from '@/types';
import type { AppointmentValues } from '@/lib/validators';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { RowActions } from '@/components/ui/row-actions';
import { useToast } from '@/components/ui/toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { appointmentSchema } from '@/lib/validators';

const statusStyle: Record<Appointment['status'], string> = {
  Scheduled: 'bg-sky-50 text-sky-700 ring-sky-200',
  Completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Cancelled: 'bg-slate-100 text-slate-600',
};

function toLocalInput(iso: string) {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function AppointmentForm({
  defaultValues,
  patients,
  doctors,
  onSubmit,
  loading,
  submitLabel,
}: {
  defaultValues?: Partial<AppointmentValues>;
  patients: { label: string; value: string }[];
  doctors: { label: string; value: string }[];
  onSubmit: (values: AppointmentValues) => void;
  loading?: boolean;
  submitLabel: string;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AppointmentValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patient: '',
      doctor: '',
      scheduledAt: '',
      reason: '',
      status: 'Scheduled',
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Select
        label="Patient"
        placeholder="Select patient"
        error={errors.patient?.message}
        options={patients}
        {...register('patient')}
      />
      <Select
        label="Doctor"
        placeholder="Select doctor"
        error={errors.doctor?.message}
        options={doctors}
        {...register('doctor')}
      />
      <Input
        label="When"
        type="datetime-local"
        error={errors.scheduledAt?.message}
        {...register('scheduledAt')}
      />
      <Input label="Reason" error={errors.reason?.message} {...register('reason')} />
      <Select
        label="Status"
        error={errors.status?.message}
        options={[
          { label: 'Scheduled', value: 'Scheduled' },
          { label: 'Completed', value: 'Completed' },
          { label: 'Cancelled', value: 'Cancelled' },
        ]}
        {...register('status')}
      />
      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

export default function AppointmentsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [removing, setRemoving] = useState<Appointment | null>(null);

  const query = useMemo(
    () => ({
      page: String(page),
      limit: '10',
      status,
    }),
    [page, status]
  );

  const appointmentsQuery = useQuery({
    queryKey: queryKeys.appointments(query),
    queryFn: async () => {
      try {
        return await api<Paginated<Appointment>>('/appointments', { params: query });
      } catch (err) {
        if (err instanceof ApiRequestError && err.status === 401) router.replace('/login');
        throw err;
      }
    },
  });

  const optionsQuery = useQuery({
    queryKey: queryKeys.patientFilters,
    queryFn: async () => {
      const res = await api<{
        data: { doctors: Doctor[]; patients: Pick<Patient, '_id' | 'name'>[] };
      }>('/patients/meta/filters');
      return res.data;
    },
  });

  const patientOptions = (optionsQuery.data?.patients || []).map((patient) => ({
    label: patient.name,
    value: patient._id,
  }));
  const doctorOptions = (optionsQuery.data?.doctors || []).map((doctor) => ({
    label: doctor.name,
    value: doctor._id,
  }));

  const save = useMutation({
    mutationFn: (values: AppointmentValues) =>
      editing
        ? api(`/appointments/${editing._id}`, { method: 'PUT', body: values })
        : api('/appointments', { method: 'POST', body: values }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['appointments'] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard }),
      ]);
      setCreateOpen(false);
      setEditing(null);
      toast(editing ? 'Appointment updated' : 'Appointment added', 'success');
    },
    onError: (err: unknown) => {
      toast(err instanceof ApiRequestError ? err.message : "Couldn't save the appointment.", 'error');
    },
  });

  const remove = useMutation({
    mutationFn: () => api(`/appointments/${removing?._id}`, { method: 'DELETE' }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['appointments'] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard }),
      ]);
      setRemoving(null);
      toast('Appointment deleted', 'success');
    },
    onError: () => toast("Couldn't delete the appointment.", 'error'),
  });

  const columns: Column<Appointment>[] = [
    {
      key: 'when',
      header: 'When',
      cell: (row) => (
        <span className="whitespace-nowrap text-slate-800">{formatFullDate(row.scheduledAt)}</span>
      ),
    },
    {
      key: 'patient',
      header: 'Patient',
      truncate: true,
      cell: (row) => (
        <span className="font-medium text-slate-900">
          {typeof row.patient === 'string' ? 'Patient' : row.patient?.name}
        </span>
      ),
    },
    {
      key: 'doctor',
      header: 'Doctor',
      truncate: true,
      hideBelow: 'md',
      cell: (row) => doctorName(row.doctor),
    },
    {
      key: 'reason',
      header: 'Reason',
      truncate: true,
      hideBelow: 'lg',
      cell: (row) => row.reason,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => <Badge className={statusStyle[row.status]}>{row.status}</Badge>,
    },
  ];

  return (
    <div className="page-enter">
      <PageHeader
        title="Appointments"
        description="Schedule visits, then mark them completed or cancelled."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Add appointment
          </Button>
        }
      />

      <div className="mb-4 max-w-xs">
        <Select
          label="Status"
          placeholder="All"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          options={[
            { label: 'Scheduled', value: 'Scheduled' },
            { label: 'Completed', value: 'Completed' },
            { label: 'Cancelled', value: 'Cancelled' },
          ]}
        />
      </div>

      {appointmentsQuery.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-14" />
          ))}
        </div>
      ) : null}

      {appointmentsQuery.data && appointmentsQuery.data.data.length === 0 ? (
        <EmptyState
          title="No appointments yet"
          description="Schedule the first visit for a patient."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Add appointment
            </Button>
          }
        />
      ) : null}

      {appointmentsQuery.data && appointmentsQuery.data.data.length > 0 ? (
        <div className="space-y-4">
          <DataTable
            columns={columns}
            rows={appointmentsQuery.data.data}
            rowKey={(row) => row._id}
            actions={(row) => (
              <RowActions
                onEdit={() => setEditing(row)}
                onDelete={() => setRemoving(row)}
              />
            )}
          />
          <Pagination
            page={appointmentsQuery.data.pagination.page}
            totalPages={appointmentsQuery.data.pagination.totalPages}
            total={appointmentsQuery.data.pagination.total}
            onPageChange={setPage}
          />
        </div>
      ) : null}

      <Modal open={createOpen || Boolean(editing)} onClose={() => { setCreateOpen(false); setEditing(null); }} title={editing ? 'Edit appointment' : 'Add appointment'}>
        <AppointmentForm
          key={editing?._id || 'new'}
          patients={patientOptions}
          doctors={doctorOptions}
          loading={save.isPending}
          submitLabel={editing ? 'Save changes' : 'Add appointment'}
          defaultValues={
            editing
              ? {
                  patient: typeof editing.patient === 'string' ? editing.patient : editing.patient?._id,
                  doctor: typeof editing.doctor === 'string' ? editing.doctor : editing.doctor?._id,
                  scheduledAt: toLocalInput(editing.scheduledAt),
                  reason: editing.reason,
                  status: editing.status,
                }
              : undefined
          }
          onSubmit={(values) => save.mutate(values)}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        title="Delete appointment"
        description="This visit will be removed from the schedule."
        loading={remove.isPending}
        onConfirm={() => remove.mutate()}
      />
    </div>
  );
}
