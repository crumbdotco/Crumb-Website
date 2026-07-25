'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/auth';
import { createReferralCode, setReferralCodeActive } from '@/lib/admin/referrals';

const BASE_PATH = '/admin/referrals';

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

export async function createReferralCodeAction(formData: FormData): Promise<void> {
  const userId = await requireAdmin();
  if (!userId) redirect('/admin/signin?error=unauthorized');

  const code = readString(formData, 'code');
  const creatorName = readString(formData, 'creatorName');
  const note = readString(formData, 'note');

  const result = await createReferralCode({ code, creatorName, note });

  if (!result.ok) {
    redirect(`${BASE_PATH}?error=${result.error}`);
  }

  revalidatePath(BASE_PATH);
  revalidatePath('/admin');
  redirect(`${BASE_PATH}?created=${encodeURIComponent(result.record.code)}`);
}

export async function setReferralCodeActiveAction(formData: FormData): Promise<void> {
  const userId = await requireAdmin();
  if (!userId) redirect('/admin/signin?error=unauthorized');

  const code = readString(formData, 'code');
  const isActive = readString(formData, 'isActive') === 'true';

  const result = await setReferralCodeActive(code, isActive);

  if (!result.ok) {
    redirect(`${BASE_PATH}?error=${result.error}`);
  }

  revalidatePath(BASE_PATH);
  revalidatePath('/admin');
  redirect(`${BASE_PATH}?updated=${encodeURIComponent(code)}`);
}
