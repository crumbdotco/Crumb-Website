export const metadata = {
  title: 'Crumb Admin',
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth gate moved to page.tsx so /admin/signin and /admin/callback
  // can render without redirecting (they need to be reachable for
  // unauthenticated users to sign in).
  return <div className="min-h-screen bg-[#1A1208] text-[#E0D5C9]">{children}</div>;
}
