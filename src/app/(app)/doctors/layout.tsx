import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Doctors',
};

export default function DoctorsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
