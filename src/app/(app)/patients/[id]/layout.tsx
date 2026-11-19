import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Patient history',
};

export default function PatientHistoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
