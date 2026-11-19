'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Activity,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Menu,
  Stethoscope,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/doctors', label: 'Doctors', icon: Stethoscope },
  { href: '/patients', label: 'Patients', icon: Users },
  { href: '/appointments', label: 'Appointments', icon: CalendarDays },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const logout = useMutation({
    mutationFn: () => api('/auth/logout', { method: 'POST' }),
    onSuccess: () => {
      queryClient.clear();
      router.replace('/login');
    },
    onError: () => toast("Couldn't log out. Try again.", 'error'),
  });

  const Nav = ({ collapsed = false }: { collapsed?: boolean }) => (
    <nav className="flex flex-1 flex-col gap-1.5 p-3">
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={cn(
              'flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors',
              active
                ? 'bg-brand-soft text-brand'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              collapsed && 'justify-center px-0'
            )}
            title={collapsed ? label : undefined}
          >
            <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
            {!collapsed ? <span>{label}</span> : null}
          </Link>
        );
      })}
    </nav>
  );

  const LogoutButton = ({
    collapsed = false,
    className,
  }: {
    collapsed?: boolean;
    className?: string;
  }) => (
    <button
      type="button"
      onClick={() => logout.mutate()}
      disabled={logout.isPending}
      title="Log out"
      className={cn(
        'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:opacity-60',
        collapsed && 'h-11 w-11 min-w-11 px-0',
        !collapsed && 'justify-start',
        className
      )}
    >
      <LogOut className="h-5 w-5 shrink-0" strokeWidth={1.75} />
      {!collapsed ? <span>{logout.isPending ? 'Signing out…' : 'Log out'}</span> : null}
    </button>
  );

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden">
        <div className="flex items-center gap-2 text-brand">
          <Activity className="h-5 w-5" />
          <span className="font-semibold text-slate-900">Doctor Tracker</span>
        </div>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[min(20rem,88vw)] flex-col bg-white shadow-lg">
            <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4">
              <div className="flex items-center gap-2 text-brand">
                <Activity className="h-5 w-5" />
                <span className="font-semibold text-slate-900">Doctor Tracker</span>
              </div>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <Nav />
            <div className="mt-auto border-t border-slate-200 p-4">
              <LogoutButton />
            </div>
          </aside>
        </div>
      ) : null}

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[4.5rem] flex-col border-r border-slate-200 bg-white md:flex lg:w-60">
        <div className="flex h-16 shrink-0 items-center justify-center gap-2 border-b border-slate-200 px-3 lg:justify-start lg:px-4">
          <Activity className="h-5 w-5 text-brand" />
          <span className="hidden font-semibold text-slate-900 lg:inline">Doctor Tracker</span>
        </div>
        <div className="hidden min-h-0 flex-1 flex-col overflow-y-auto lg:flex">
          <Nav />
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:hidden">
          <Nav collapsed />
        </div>
        <div className="mt-auto shrink-0 border-t border-slate-200 p-3 lg:p-4">
          <div className="hidden lg:block">
            <LogoutButton />
          </div>
          <div className="flex justify-center lg:hidden">
            <LogoutButton collapsed />
          </div>
        </div>
      </aside>
    </>
  );
}
