import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin/auth';

export const metadata = {
  title: 'Crumb Admin',
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await requireAdmin();
  if (!userId) redirect('/');
  return <div className="min-h-screen bg-[#1A1208] text-[#E0D5C9]">{children}</div>;
}
