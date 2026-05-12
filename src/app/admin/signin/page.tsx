import { getCallerIp } from '@/lib/admin/auth';
import SignInClient from './SignInClient';

export const dynamic = 'force-dynamic';

export default async function AdminSignInPage() {
  const callerIp = await getCallerIp();
  return <SignInClient callerIp={callerIp} />;
}
