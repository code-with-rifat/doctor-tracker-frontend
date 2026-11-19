'use client';

import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Activity, CalendarDays, Stethoscope, UserPlus, Users } from 'lucide-react';
import { api, ApiRequestError } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import type { DashboardStats } from '@/types';
import { PageHeader } from '@/components/layout/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RecentPatients } from '@/components/dashboard/recent-patients';
import { ClinicPulse } from '@/components/dashboard/clinic-pulse';

const ChartSkeleton = () => <Skeleton className="h-80 w-full rounded-xl" />;

const PatientsPerDoctorChart = dynamic(
  () =>
    import('@/components/charts/patients-per-doctor-chart').then(
      (m) => m.PatientsPerDoctorChart
    ),
  { ssr: false, loading: ChartSkeleton }
);

const PatientsOverTimeChart = dynamic(
  () =>
    import('@/components/charts/patients-over-time-chart').then(
      (m) => m.PatientsOverTimeChart
    ),
  { ssr: false, loading: ChartSkeleton }
);

const PatientsByConditionChart = dynamic(
  () =>
    import('@/components/charts/patients-by-condition-chart').then(
      (m) => m.PatientsByConditionChart
    ),
  { ssr: false, loading: ChartSkeleton }
);

const TopSpecializationsChart = dynamic(
  () =>
    import('@/components/charts/top-specializations-chart').then(
      (m) => m.TopSpecializationsChart
    ),
  { ssr: false, loading: ChartSkeleton }
);

export default function DashboardPage() {
  const router = useRouter();

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: async () => {
      try {
        const res = await api<{ data: DashboardStats }>('/dashboard/stats');
        return res.data;
      } catch (err) {
        if (err instanceof ApiRequestError && err.status === 401) {
          router.replace('/login');
        }
        throw err;
      }
    },
  });

  return (
    <div className="page-enter">
      <PageHeader
        title="Dashboard"
        description="Clinic overview, trends, and recent patient activity."
      />

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <Skeleton className="h-80 rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-40 rounded-xl" />
              <Skeleton className="h-56 rounded-xl" />
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-80 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
          </div>
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-xl border border-red-200 bg-white p-6 text-center">
          <p className="text-sm text-red-700">Couldn&apos;t load dashboard. Try again.</p>
          <Button className="mt-3" variant="secondary" loading={isFetching} onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : null}

      {data ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="stagger-item" style={{ animationDelay: '40ms' }}>
              <StatCard
                label="Total doctors"
                value={data.cards.totalDoctors}
                icon={Stethoscope}
                href="/doctors"
              />
            </div>
            <div className="stagger-item" style={{ animationDelay: '80ms' }}>
              <StatCard
                label="Total patients"
                value={data.cards.totalPatients}
                icon={Users}
                href="/patients"
              />
            </div>
            <div className="stagger-item" style={{ animationDelay: '120ms' }}>
              <StatCard
                label="Patients this month"
                value={data.cards.patientsThisMonth}
                icon={UserPlus}
                href={`/patients?from=${new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)}`}
              />
            </div>
            <div className="stagger-item" style={{ animationDelay: '160ms' }}>
              <StatCard
                label="Avg patients / doctor"
                value={data.cards.averagePatientsPerDoctor}
                icon={Activity}
                href="/doctors"
              />
            </div>
            <div className="stagger-item" style={{ animationDelay: '200ms' }}>
              <StatCard
                label="Upcoming visits"
                value={data.cards.upcomingAppointments ?? 0}
                icon={CalendarDays}
                href="/appointments"
              />
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="stagger-item" style={{ animationDelay: '200ms' }}>
              <ClinicPulse
                totalPatients={data.cards.totalPatients}
                patientsThisMonth={data.cards.patientsThisMonth}
                topCondition={data.charts.patientsByCondition[0]?.condition}
                busiestDoctor={data.charts.patientsPerDoctor[0]?.name}
              />
            </div>
            <div className="stagger-item" style={{ animationDelay: '240ms' }}>
              <RecentPatients />
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <PatientsPerDoctorChart data={data.charts.patientsPerDoctor} />
            <PatientsOverTimeChart
              last30Days={data.charts.patientsLast30Days}
              last12Months={data.charts.patientsLast12Months}
            />
            <PatientsByConditionChart data={data.charts.patientsByCondition} />
            <TopSpecializationsChart data={data.charts.topSpecializations} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
