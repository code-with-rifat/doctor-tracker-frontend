'use client';

import { Suspense, useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, Plus } from 'lucide-react';
import { api, ApiRequestError } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { downloadCsv } from '@/lib/export-csv';
import type { Doctor, Paginated } from '@/types';
import type { DoctorValues } from '@/lib/validators';
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
import { DoctorForm } from '@/components/doctors/doctor-form';
import { useToast } from '@/components/ui/toast';

function DoctorsPageContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { params, setParams } = useQueryParams();
  const [createOpen, setCreateOpen] = useState(false);
  const [editDoctor, setEditDoctor] = useState<Doctor | null>(null);
  const [deleteDoctor, setDeleteDoctor] = useState<Doctor | null>(null);

  const query = useMemo(
    () => ({
      page: params.page || '1',
      limit: params.limit || '10',
      search: params.search || '',
      specialization: params.specialization || '',
      hospital: params.hospital || '',
      from: params.from || '',
      to: params.to || '',
    }),
    [params]
  );

  const hasFilters = Boolean(
    query.search || query.specialization || query.hospital || query.from || query.to
  );

  const doctorsQuery = useQuery({
    queryKey: queryKeys.doctors(query),
    queryFn: async () => {
      try {
        return await api<Paginated<Doctor>>('/doctors', { params: query });
      } catch (err) {
        if (err instanceof ApiRequestError && err.status === 401) router.replace('/login');
        throw err;
      }
    },
    placeholderData: keepPreviousData,
  });

  const filtersQuery = useQuery({
    queryKey: queryKeys.doctorFilters,
    queryFn: async () => {
      const res = await api<{
        data: { specializations: string[]; hospitals: string[] };
      }>('/doctors/meta/filters');
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (values: DoctorValues) =>
      api('/doctors', { method: 'POST', body: values }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['doctors'] });
      setCreateOpen(false);
      toast('Doctor added', 'success');
    },
    onError: (err: unknown) => {
      toast(err instanceof ApiRequestError ? err.message : "Couldn't add doctor.", 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: DoctorValues) =>
      api(`/doctors/${editDoctor?._id}`, { method: 'PUT', body: values }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['doctors'] });
      setEditDoctor(null);
      toast('Doctor updated', 'success');
    },
    onError: (err: unknown) => {
      toast(err instanceof ApiRequestError ? err.message : "Couldn't update doctor.", 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api(`/doctors/${deleteDoctor?._id}`, { method: 'DELETE' }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['doctors'] });
      setDeleteDoctor(null);
      toast('Doctor deleted', 'success');
    },
    onError: (err: unknown) => {
      toast(err instanceof ApiRequestError ? err.message : "Couldn't delete doctor.", 'error');
    },
  });

  const onSearch = useCallback(
    (value: string) => setParams({ search: value, page: 1 }),
    [setParams]
  );

  const columns: Column<Doctor>[] = [
    {
      key: 'name',
      header: 'Doctor',
      truncate: true,
      cell: (row) => (
        <Link
          href={`/doctors/${row._id}`}
          className="inline-flex max-w-full items-center gap-3 hover:text-brand"
        >
          <Avatar name={row.name} className="h-9 w-9 shrink-0" />
          <span className="truncate font-medium text-slate-900">{row.name}</span>
        </Link>
      ),
    },
    {
      key: 'specialization',
      header: 'Specialization',
      cell: (row) => <Tag>{row.specialization}</Tag>,
    },
    {
      key: 'hospital',
      header: 'Hospital',
      truncate: true,
      hideBelow: 'lg',
      cell: (row) => (
        <span className="block truncate text-slate-700" title={row.hospital}>
          {row.hospital}
        </span>
      ),
    },
  ];

  const exportPage = () => {
    if (!doctorsQuery.data?.data.length) {
      toast('No doctors to export on this page.', 'error');
      return;
    }
    downloadCsv(
      `doctors-page-${query.page}.csv`,
      ['Name', 'Specialization', 'Hospital', 'Email', 'Phone'],
      doctorsQuery.data.data.map((d) => [
        d.name,
        d.specialization,
        d.hospital,
        d.email,
        d.phone,
      ])
    );
    toast('CSV downloaded', 'success');
  };

  return (
    <div className="page-enter">
      <PageHeader
        title="Doctors"
        description="Search, filter, and manage doctors."
        actions={
          <>
            <Button variant="secondary" onClick={exportPage} disabled={!doctorsQuery.data?.data.length}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Add doctor
            </Button>
          </>
        }
      />

      <div className="mb-4">
        <SearchInput
          value={query.search}
          onChange={onSearch}
          placeholder="Search by name, email, or hospital"
          className="max-w-md"
        />
      </div>

      <FilterBar
        hasActiveFilters={hasFilters}
        onClear={() =>
          setParams({
            search: null,
            specialization: null,
            hospital: null,
            from: null,
            to: null,
            page: 1,
          })
        }
        className="mb-4"
      >
        <Select
          label="Specialization"
          placeholder="All"
          value={query.specialization}
          onChange={(e) => setParams({ specialization: e.target.value, page: 1 })}
          options={(filtersQuery.data?.specializations || []).map((s) => ({
            label: s,
            value: s,
          }))}
        />
        <Select
          label="Hospital"
          placeholder="All"
          value={query.hospital}
          onChange={(e) => setParams({ hospital: e.target.value, page: 1 })}
          options={(filtersQuery.data?.hospitals || []).map((h) => ({
            label: h,
            value: h,
          }))}
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

      {doctorsQuery.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : null}

      {doctorsQuery.isError ? (
        <div className="rounded-xl border border-red-200 bg-white p-6 text-center">
          <p className="text-sm text-red-700">Couldn&apos;t load doctors. Try again.</p>
          <Button
            className="mt-3"
            variant="secondary"
            onClick={() => doctorsQuery.refetch()}
          >
            Retry
          </Button>
        </div>
      ) : null}

      {doctorsQuery.data && doctorsQuery.data.data.length === 0 ? (
        <EmptyState
          title="No doctors found"
          description={
            hasFilters
              ? 'Try adjusting your search or filters.'
              : 'Add the first doctor to get started.'
          }
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Add doctor
            </Button>
          }
        />
      ) : null}

      {doctorsQuery.data && doctorsQuery.data.data.length > 0 ? (
        <div className="space-y-4">
          <DataTable
            columns={columns}
            rows={doctorsQuery.data.data}
            rowKey={(row) => row._id}
            actions={(row) => (
              <RowActions
                onView={() => router.push(`/doctors/${row._id}`)}
                onEdit={() => setEditDoctor(row)}
                onDelete={() => setDeleteDoctor(row)}
              />
            )}
          />
          <Pagination
            page={doctorsQuery.data.pagination.page}
            totalPages={doctorsQuery.data.pagination.totalPages}
            total={doctorsQuery.data.pagination.total}
            onPageChange={(page) => setParams({ page })}
          />
        </div>
      ) : null}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add doctor">
        <DoctorForm
          submitLabel="Add doctor"
          loading={createMutation.isPending}
          onSubmit={async (values) => {
            await createMutation.mutateAsync(values);
          }}
        />
      </Modal>

      <Modal
        open={Boolean(editDoctor)}
        onClose={() => setEditDoctor(null)}
        title="Edit doctor"
      >
        {editDoctor ? (
          <DoctorForm
            key={editDoctor._id}
            defaultValues={editDoctor}
            submitLabel="Save changes"
            loading={updateMutation.isPending}
            onSubmit={async (values) => {
              await updateMutation.mutateAsync(values);
            }}
          />
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteDoctor)}
        onClose={() => setDeleteDoctor(null)}
        title="Delete doctor"
        description={`Remove ${deleteDoctor?.name}? This only works if they have no patients.`}
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />
    </div>
  );
}

export default function DoctorsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <DoctorsPageContent />
    </Suspense>
  );
}
