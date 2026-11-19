import type { Metadata } from 'next';
import { Source_Sans_3 } from 'next/font/google';
import { AppProviders } from '@/components/providers/app-providers';
import './globals.css';

const sans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'Doctor Tracker',
    template: '%s · Doctor Tracker',
  },
  description: 'Admin dashboard for managing doctors and patients.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${sans.variable} font-sans antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
