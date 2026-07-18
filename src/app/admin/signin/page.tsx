import SignInClient from './SignInClient';

export const dynamic = 'force-dynamic';

export default async function AdminSignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return <SignInClient unauthorised={params.error === 'unauthorized'} />;
}
