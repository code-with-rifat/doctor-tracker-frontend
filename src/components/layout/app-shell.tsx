import { Sidebar } from '@/components/layout/sidebar';
import { AppFooter } from '@/components/layout/app-footer';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface md:flex">
      <Sidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col md:pl-[4.5rem] lg:pl-60">
        <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          {children}
        </main>
        <AppFooter />
      </div>
    </div>
  );
}
