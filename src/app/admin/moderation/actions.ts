/**
 * Purpose: Handle authenticated Crumbify moderation mutations from server actions.
 * Security and brand rules: Re-check platform-admin access, validate untrusted form data with shared guards, and redirect with safe codes only.
 * Interface: setReportStatusAction(formData) and unbanUserAction(formData), both returning Promise<void>.
 * Test IDs: none (server-only file).
 */

'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getAdminAccessToken, requireAdmin } from '@/lib/admin/auth';
import {
  isModerationUuid,
  isReportSource,
  isReportStatus,
  setModerationReportStatus,
  unbanModerationUser,
} from '@/lib/admin/moderation';

const MODERATION_PATH = '/admin/moderation';

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

async function redirectUnauthorizedModerationAccess(): Promise<void> {
  return redirect('/admin/signin?error=unauthorized');
}

export async function setReportStatusAction(formData: FormData): Promise<void> {
  const userId = await requireAdmin();
  if (!userId) return redirectUnauthorizedModerationAccess();

  const source = readString(formData, 'source');
  const reportId = readString(formData, 'reportId');
  const status = readString(formData, 'status');
  if (!isReportSource(source) || !isModerationUuid(reportId) || !isReportStatus(status)) {
    return redirect(`${MODERATION_PATH}?error=invalid_input`);
  }

  const accessToken = await getAdminAccessToken();
  if (!accessToken) return redirect('/admin/signin?error=unauthorized');

  try {
    await setModerationReportStatus(accessToken, { source, reportId, status });
  } catch {
    return redirect(`${MODERATION_PATH}?error=update_failed`);
  }

  revalidatePath(MODERATION_PATH);
  return redirect(`${MODERATION_PATH}?result=report_updated`);
}

export async function unbanUserAction(formData: FormData): Promise<void> {
  const userId = await requireAdmin();
  if (!userId) return redirectUnauthorizedModerationAccess();

  const targetUserId = readString(formData, 'userId');
  if (!isModerationUuid(targetUserId)) return redirect(`${MODERATION_PATH}?error=invalid_input`);

  const accessToken = await getAdminAccessToken();
  if (!accessToken) return redirect('/admin/signin?error=unauthorized');

  try {
    await unbanModerationUser(accessToken, targetUserId);
  } catch {
    return redirect(`${MODERATION_PATH}?error=unban_failed`);
  }

  revalidatePath(MODERATION_PATH);
  return redirect(`${MODERATION_PATH}?result=user_unbanned`);
}
