import { getCallerIp } from '@/lib/admin/auth';
import SignInClient from './SignInClient';

export const dynamic = 'force-dynamic';

export default async function AdminSignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [callerIp, params] = await Promise.all([getCallerIp(), searchParams]);
  return <SignInClient callerIp={callerIp} unauthorised={params.error === 'unauthorized'} />;
}
