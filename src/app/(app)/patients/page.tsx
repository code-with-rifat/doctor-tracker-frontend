'use client';

import { Suspense, useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, Plus } from 'lucide-react';
import { api, ApiRequestError } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { doctorName } from '@/lib/utils';
import { downloadCsv } from '@/lib/export-csv';
import type { Doctor, Paginated, Patient } from '@/types';
import type { PatientValues } from '@/lib/validators';
import { useQueryParams } from '@/hooks/use-query-params';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { FilterBar } from '@/components/ui/filter-bar';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar } from '@/components/ui/avatar';
import { Tag } from '@/components/ui/tag';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { RowActions } from '@/components/ui/row-actions';
import { PatientForm } from '@/components/patients/patient-form';
import { useToast } from '@/components/ui/toast';

function PatientsPageContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { params, setParams } = useQueryParams();
  const [createOpen, setCreateOpen] = useState(false);
  const [editPatient, setEditPatient] = useState<Patient | null>(null);
  const [deletePatient, setDeletePatient] = useState<Patient | null>(null);

  const query = useMemo(
    () => ({
      page: params.page || '1',
      limit: params.limit || '10',
      search: params.search || '',
      condition: params.condition || '',
      doctor: params.doctor || '',
      from: params.from || '',
      to: params.to || '',
    }),
    [params]
  );

  const hasFilters = Boolean(
    query.search || query.condition || query.doctor || query.from || query.to
  );

  const patientsQuery = useQuery({
    queryKey: queryKeys.patients(query),
    queryFn: async () => {
      try {
        return await api<Paginated<Patient>>('/patients', { params: query });
      } catch (err) {
        if (err instanceof ApiRequestError && err.status === 401) router.replace('/login');
        throw err;
      }
    },
    placeholderData: keepPreviousData,
  });

  const filtersQuery = useQuery({
    queryKey: queryKeys.patientFilters,
    queryFn: async () => {
      const res = await api<{
        data: { conditions: string[]; doctors: Doctor[] };
      }>('/patients/meta/filters');
      return res.data;
    },
  });

  const doctorOptions = useMemo(
    () =>
      (filtersQuery.data?.doctors || []).map((d) => ({
        label: d.name,
        value: d._id,
      })),
    [filtersQuery.data]
  );

  const createMutation = useMutation({
    mutationFn: (values: PatientValues) =>
      api('/patients', { method: 'POST', body: values }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['patients'] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard }),
      ]);
      setCreateOpen(false);
      toast('Patient added', 'success');
    },
    onError: (err: unknown) => {
      toast(err instanceof ApiRequestError ? err.message : "Couldn't add patient.", 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: PatientValues) =>
      api(`/patients/${editPatient?._id}`, { method: 'PUT', body: values }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['patients'] });
      setEditPatient(null);
      toast('Patient updated', 'success');
    },
    onError: (err: unknown) => {
      toast(err instanceof ApiRequestError ? err.message : "Couldn't update patient.", 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api(`/patients/${deletePatient?._id}`, { method: 'DELETE' }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['patients'] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard }),
      ]);
      setDeletePatient(null);
      toast('Patient deleted', 'success');
    },
    onError: (err: unknown) => {
      toast(err instanceof ApiRequestError ? err.message : "Couldn't delete patient.", 'error');
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
      key: 'doctor',
      header: 'Doctor',
      truncate: true,
      hideBelow: 'lg',
      cell: (row) => (
        <span
          className="block truncate text-slate-700"
          title={doctorName(row.doctor as Doctor | string)}
        >
          {doctorName(row.doctor as Doctor | string)}
        </span>
      ),
    },
  ];

  const exportPage = () => {
    if (!patientsQuery.data?.data.length) {
      toast('No patients to export on this page.', 'error');
      return;
    }
    downloadCsv(
      `patients-page-${query.page}.csv`,
      ['Name', 'Age', 'Gender', 'Condition', 'Doctor', 'Phone'],
      patientsQuery.data.data.map((p) => [
        p.name,
        String(p.age),
        p.gender,
        p.condition,
        doctorName(p.doctor as Doctor | string),
        p.phone,
      ])
    );
    toast('CSV downloaded', 'success');
  };

  return (
    <div className="page-enter">
      <PageHeader
        title="Patients"
        description="Browse and manage patient records."
        actions={
          <>
            <Button variant="secondary" onClick={exportPage} disabled={!patientsQuery.data?.data.length}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Add patient
            </Button>
          </>
        }
      />

      <div className="mb-4">
        <SearchInput
          value={query.search}
          onChange={onSearch}
          placeholder="Search by name, phone, or condition"
          className="max-w-md"
        />
      </div>

      <FilterBar
        hasActiveFilters={hasFilters}
        onClear={() =>
          setParams({
            search: null,
            condition: null,
            doctor: null,
            from: null,
            to: null,
            page: 1,
          })
        }
        className="mb-4"
      >
        <Select
          label="Condition"
          placeholder="All"
          value={query.condition}
          onChange={(e) => setParams({ condition: e.target.value, page: 1 })}
          options={(filtersQuery.data?.conditions || []).map((c) => ({
            label: c,
            value: c,
          }))}
        />
        <Select
          label="Doctor"
          placeholder="All"
          value={query.doctor}
          onChange={(e) => setParams({ doctor: e.target.value, page: 1 })}
          options={doctorOptions}
        />
        <Input
          label="From"
          type="date"
          value={query.from}
          onChange={(e) => setParams({ from: e.target.value, page: 1 })}
        />
        <Input
          label="To"
          type="date"
          value={query.to}
          onChange={(e) => setParams({ to: e.target.value, page: 1 })}
        />
      </FilterBar>

      {patientsQuery.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
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
          title="No patients found"
          description={
            hasFilters
              ? 'Try adjusting your search or filters.'
              : 'Add the first patient to get started.'
          }
          action={
            <Button onClick={() => setCreateOpen(true)}>
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
                onEdit={() => setEditPatient(row)}
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

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add patient">
        <PatientForm
          showDoctorField
          doctorOptions={doctorOptions}
          submitLabel="Add patient"
          loading={createMutation.isPending}
          onSubmit={async (values) => {
            await createMutation.mutateAsync(values);
          }}
        />
      </Modal>

      <Modal
        open={Boolean(editPatient)}
        onClose={() => setEditPatient(null)}
        title="Edit patient"
      >
        {editPatient ? (
          <PatientForm
            key={editPatient._id}
            showDoctorField
            doctorOptions={doctorOptions}
            defaultValues={{
              name: editPatient.name,
              age: editPatient.age,
              gender: editPatient.gender,
              phone: editPatient.phone,
              condition: editPatient.condition,
              doctor:
                typeof editPatient.doctor === 'string'
                  ? editPatient.doctor
                  : editPatient.doctor?._id,
            }}
            submitLabel="Save changes"
            loading={updateMutation.isPending}
            onSubmit={async (values) => {
              await updateMutation.mutateAsync(values);
            }}
          />
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(deletePatient)}
        onClose={() => setDeletePatient(null)}
        title="Delete patient"
        description={`Delete ${deletePatient?.name}? This cannot be undone.`}
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />
    </div>
  );
}

export default function PatientsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <PatientsPageContent />
    </Suspense>
  );
}
