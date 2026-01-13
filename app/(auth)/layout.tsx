import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WellMom - Admin Portal',
  description: 'Integrated management portal for Puskesmas administrators',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
