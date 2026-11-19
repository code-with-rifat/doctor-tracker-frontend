'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CalendarDays, Phone, Stethoscope, UserRound } from 'lucide-react';
import { api, ApiRequestError } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { doctorName, formatFullDate } from '@/lib/utils';
import type { Appointment, Doctor, Paginated, Patient } from '@/types';
import { Avatar } from '@/components/ui/avatar';
import { Tag } from '@/components/ui/tag';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RelativeDate } from '@/components/ui/relative-date';
import { useToast } from '@/components/ui/toast';

export default function PatientHistoryPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [note, setNote] = useState('');
  const id = params.id;

  const patientQuery = useQuery({
    queryKey: ['patients', id],
    queryFn: async () => {
      try {
        const res = await api<{ data: Patient }>(`/patients/${id}`);
        return res.data;
      } catch (err) {
        if (err instanceof ApiRequestError && err.status === 401) router.replace('/login');
        throw err;
      }
    },
  });

  const visitsQuery = useQuery({
    queryKey: queryKeys.appointments({ patient: id, limit: '5' }),
    enabled: Boolean(id),
    queryFn: () =>
      api<Paginated<Appointment>>('/appointments', {
        params: { patient: id, limit: '5', page: '1' },
      }),
  });

  const addNote = useMutation({
    mutationFn: () => api(`/patients/${id}/notes`, { method: 'POST', body: { body: note } }),
    onSuccess: async () => {
      setNote('');
      await queryClient.invalidateQueries({ queryKey: ['patients', id] });
      toast('Note added', 'success');
    },
    onError: (err: unknown) => {
      toast(err instanceof ApiRequestError ? err.message : "Couldn't add the note.", 'error');
    },
  });

  if (patientQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (patientQuery.isError || !patientQuery.data) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-6 text-center">
        <p className="text-sm text-red-700">Couldn&apos;t load patient history. Try again.</p>
        <Button className="mt-3" variant="secondary" onClick={() => patientQuery.refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const patient = patientQuery.data;
  const doctor = patient.doctor as Doctor | string;
  const doctorId = typeof doctor === 'string' ? doctor : doctor?._id;

  const notes = patient.notes || [];
  const timeline = [
    ...notes.map((item) => ({
      title: 'Visit note',
      detail: item.body,
      at: item.createdAt,
    })),
    {
      title: 'Record created',
      detail: `Patient added under ${doctorName(doctor)}. Status: ${patient.status || 'Active'}.`,
      at: patient.createdAt,
    },
  ];

  return (
    <div className="page-enter">
      <Link
        href="/patients"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to patients
      </Link>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Avatar name={patient.name} className="h-14 w-14 text-base" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {patient.name}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {patient.gender} · {patient.age} years · Patient history
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Tag>{patient.condition}</Tag>
              <Badge
                className={
                  (patient.status || 'Active') === 'Discharged'
                    ? 'bg-slate-100 text-slate-600'
                    : 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                }
              >
                {patient.status || 'Active'}
              </Badge>
            </div>
          </div>
        </div>
        {doctorId ? (
          <Button variant="secondary" onClick={() => router.push(`/doctors/${doctorId}`)}>
            View doctor
          </Button>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <InfoTile icon={Phone} label="Phone" value={patient.phone} />
        <InfoTile icon={Stethoscope} label="Assigned doctor" value={doctorName(doctor)} />
        <InfoTile icon={UserRound} label="Condition" value={patient.condition} />
        <InfoTile
          icon={CalendarDays}
          label="Added"
          value={<RelativeDate value={patient.createdAt} />}
          title={formatFullDate(patient.createdAt)}
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-900">Clinical timeline</h2>
          <p className="mt-1 text-sm text-slate-500">Key events for this patient record.</p>
          <ol className="mt-5 space-y-4">
            {timeline.map((item, index) => (
              <li key={`${item.title}-${item.at}-${index}`} className="relative flex gap-3 pl-2">
                <div className="flex flex-col items-center">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-brand" />
                  {index < timeline.length - 1 ? (
                    <span className="mt-1 w-px flex-1 bg-slate-200" />
                  ) : null}
                </div>
                <div className="pb-2">
                  <p className="text-sm font-medium text-slate-900">{item.title}</p>
                  <p className="mt-0.5 text-sm text-slate-600">{item.detail}</p>
                  <p className="mt-1 text-xs text-slate-400" title={formatFullDate(item.at)}>
                    <RelativeDate value={item.at} />
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="space-y-5">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-base font-semibold text-slate-900">Add a visit note</h2>
            <p className="mt-1 text-sm text-slate-500">
              What happened in the latest visit. This stays on the record.
            </p>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="Symptoms, advice, or follow-up..."
              className="mt-4 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
            <div className="mt-3 flex justify-end">
              <Button
                type="button"
                loading={addNote.isPending}
                disabled={note.trim().length < 2}
                onClick={() => addNote.mutate()}
              >
                Save note
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-base font-semibold text-slate-900">Appointments</h2>
            {visitsQuery.data?.data.length ? (
              <ul className="mt-3 space-y-3">
                {visitsQuery.data.data.map((visit) => (
                  <li key={visit._id} className="text-sm text-slate-700">
                    <span className="font-medium text-slate-900">{visit.reason}</span>
                    <span className="mt-0.5 block text-slate-500">
                      {formatFullDate(visit.scheduledAt)} · {visit.status}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-500">No appointments for this patient yet.</p>
            )}
            <Link href="/appointments" className="mt-3 inline-block text-sm font-medium text-brand">
              Schedule one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  title?: string;
}) {
  return (
    <div
      className="rounded-xl border border-slate-200 bg-white p-4 transition-transform duration-200 hover:-translate-y-0.5"
      title={title}
    >
      <div className="flex items-center gap-2 text-slate-500">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <div className="mt-2 truncate text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}
