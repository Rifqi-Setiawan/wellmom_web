import type { Metadata } from 'next';
import SuperAdminLayout from '@/components/layouts/super-admin-layout';

export const metadata: Metadata = {
  title: 'Super Admin Dashboard - WellMom',
  description: 'Dashboard Super Admin WellMom - Kementerian Kesehatan RI',
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SuperAdminLayout>{children}</SuperAdminLayout>;
}
