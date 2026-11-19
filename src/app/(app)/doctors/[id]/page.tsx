'use client';

import { Suspense, useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus } from 'lucide-react';
import { api, ApiRequestError } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import type { Doctor, Paginated, Patient } from '@/types';
import type { PatientValues } from '@/lib/validators';
import { useQueryParams } from '@/hooks/use-query-params';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Tag } from '@/components/ui/tag';
import { RelativeDate } from '@/components/ui/relative-date';
import { SearchInput } from '@/components/ui/search-input';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { RowActions } from '@/components/ui/row-actions';
import { PatientForm } from '@/components/patients/patient-form';
import { useToast } from '@/components/ui/toast';
import { formatFullDate } from '@/lib/utils';

function DoctorDetailContent() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { params: queryParams, setParams } = useQueryParams();
  const [addOpen, setAddOpen] = useState(false);
  const [deletePatient, setDeletePatient] = useState<Patient | null>(null);

  const listQuery = useMemo(
    () => ({
      page: queryParams.page || '1',
      limit: queryParams.limit || '10',
      search: queryParams.search || '',
    }),
    [queryParams]
  );

  const doctorQuery = useQuery({
    queryKey: queryKeys.doctor(id),
    queryFn: async () => {
      try {
        const res = await api<{ data: Doctor }>(`/doctors/${id}`);
        return res.data;
      } catch (err) {
        if (err instanceof ApiRequestError && err.status === 401) router.replace('/login');
        throw err;
      }
    },
  });

  const patientsQuery = useQuery({
    queryKey: queryKeys.doctorPatients(id, listQuery),
    queryFn: () =>
      api<Paginated<Patient>>(`/doctors/${id}/patients`, { params: listQuery }),
    placeholderData: keepPreviousData,
  });

  const addPatient = useMutation({
    mutationFn: (values: PatientValues) =>
      api(`/doctors/${id}/patients`, { method: 'POST', body: values }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['doctors', id, 'patients'] }),
        queryClient.invalidateQueries({ queryKey: ['patients'] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard }),
      ]);
      setAddOpen(false);
      toast('Patient added', 'success');
    },
    onError: (err: unknown) => {
      toast(err instanceof ApiRequestError ? err.message : "Couldn't add patient.", 'error');
    },
  });

  const removePatient = useMutation({
    mutationFn: () => api(`/patients/${deletePatient?._id}`, { method: 'DELETE' }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['doctors', id, 'patients'] }),
        queryClient.invalidateQueries({ queryKey: ['patients'] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard }),
      ]);
      setDeletePatient(null);
      toast('Patient removed', 'success');
    },
    onError: (err: unknown) => {
      toast(err instanceof ApiRequestError ? err.message : "Couldn't remove patient.", 'error');
    },
  });

  const onSearch = useCallback(
    (value: string) => setParams({ search: value, page: 1 }),
    [setParams]
  );

  const columns: Column<Patient>[] = [
    {
      key: 'name',
      header: 'Patient',
      truncate: true,
      cell: (row) => (
        <Link
          href={`/patients/${row._id}`}
          className="inline-flex max-w-full items-center gap-3 hover:text-brand"
        >
          <Avatar name={row.name} className="h-9 w-9 shrink-0" />
          <span className="truncate font-medium text-slate-900">{row.name}</span>
        </Link>
      ),
    },
    {
      key: 'condition',
      header: 'Condition',
      cell: (row) => <Tag>{row.condition}</Tag>,
    },
    {
      key: 'age',
      header: 'Age',
      align: 'right',
      hideBelow: 'lg',
      cell: (row) => row.age,
    },
  ];

  if (doctorQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (doctorQuery.isError || !doctorQuery.data) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-6 text-center">
        <p className="text-sm text-red-700">Couldn&apos;t load doctor. Try again.</p>
        <Button className="mt-3" variant="secondary" onClick={() => doctorQuery.refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const doctor = doctorQuery.data;

  return (
    <div>
      <Link
        href="/doctors"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to doctors
      </Link>

      <PageHeader
        title={doctor.name}
        description={`${doctor.specialization} · ${doctor.hospital}`}
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Add patient
          </Button>
        }
      />

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <Avatar name={doctor.name} className="h-14 w-14 text-base" />
          <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xs text-slate-500">Specialization</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{doctor.specialization}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Hospital</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{doctor.hospital}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Email</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{doctor.email}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Phone</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{doctor.phone}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Added</p>
              <p className="mt-1 text-sm font-medium text-slate-900" title={formatFullDate(doctor.createdAt)}>
                <RelativeDate value={doctor.createdAt} />
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Patients</h2>
        <SearchInput
          value={listQuery.search}
          onChange={onSearch}
          placeholder="Search patients"
          className="max-w-sm"
        />
      </div>

      {patientsQuery.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : null}

      {patientsQuery.isError ? (
        <div className="rounded-xl border border-red-200 bg-white p-6 text-center">
          <p className="text-sm text-red-700">Couldn&apos;t load patients. Try again.</p>
          <Button className="mt-3" variant="secondary" onClick={() => patientsQuery.refetch()}>
            Retry
          </Button>
        </div>
      ) : null}

      {patientsQuery.data && patientsQuery.data.data.length === 0 ? (
        <EmptyState
          title="No patients yet"
          description={`Add the first patient for ${doctor.name}.`}
          action={
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" />
              Add patient
            </Button>
          }
        />
      ) : null}

      {patientsQuery.data && patientsQuery.data.data.length > 0 ? (
        <div className="space-y-4">
          <DataTable
            columns={columns}
            rows={patientsQuery.data.data}
            rowKey={(row) => row._id}
            actions={(row) => (
              <RowActions
                viewLabel="History"
                onView={() => router.push(`/patients/${row._id}`)}
                onDelete={() => setDeletePatient(row)}
              />
            )}
          />
          <Pagination
            page={patientsQuery.data.pagination.page}
            totalPages={patientsQuery.data.pagination.totalPages}
            total={patientsQuery.data.pagination.total}
            onPageChange={(page) => setParams({ page })}
          />
        </div>
      ) : null}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add patient">
        <PatientForm
          submitLabel="Add patient"
          loading={addPatient.isPending}
          onSubmit={async (values) => {
            await addPatient.mutateAsync(values);
          }}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(deletePatient)}
        onClose={() => setDeletePatient(null)}
        title="Remove patient"
        description={`Remove ${deletePatient?.name} from ${doctor.name}?`}
        confirmLabel="Remove"
        loading={removePatient.isPending}
        onConfirm={() => removePatient.mutate()}
      />
    </div>
  );
}

export default function DoctorDetailPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <DoctorDetailContent />
    </Suspense>
  );
}
