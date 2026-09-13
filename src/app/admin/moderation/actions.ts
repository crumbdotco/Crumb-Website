'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getAdminAccessToken, getAdminSessionUser, requireAdmin } from '@/lib/admin/auth';
import {
  sendUnauthorizedModerationAlert,
  setModerationReportStatus,
  unbanModerationUser,
  type ReportSource,
  type ReportStatus,
} from '@/lib/admin/moderation';

const MODERATION_PATH = '/admin/moderation';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

function isReportSource(value: string): value is ReportSource {
  return value === 'post_reports' || value === 'group_content_reports';
}

function isReportStatus(value: string): value is ReportStatus {
  return value === 'queued' || value === 'actioned' || value === 'dismissed';
}

async function redirectUnauthorizedModerationAccess(): Promise<void> {
  const sessionUser = await getAdminSessionUser();
  if (sessionUser) {
    await sendUnauthorizedModerationAlert(sessionUser.id, sessionUser.email).catch(() => undefined);
  }
  return redirect('/admin/signin?error=unauthorized');
}

export async function setReportStatusAction(formData: FormData): Promise<void> {
  const userId = await requireAdmin();
  if (!userId) return redirectUnauthorizedModerationAccess();

  const source = readString(formData, 'source');
  const reportId = readString(formData, 'reportId');
  const status = readString(formData, 'status');
  if (!isReportSource(source) || !UUID_RE.test(reportId) || !isReportStatus(status)) {
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
  if (!UUID_RE.test(targetUserId)) return redirect(`${MODERATION_PATH}?error=invalid_input`);

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
