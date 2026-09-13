const mockRequireAdmin = jest.fn();
const mockGetAdminSessionUser = jest.fn();
const mockGetAdminAccessToken = jest.fn();
const mockSetModerationReportStatus = jest.fn();
const mockUnbanModerationUser = jest.fn();
const mockSendUnauthorizedModerationAlert = jest.fn();
const mockRevalidatePath = jest.fn();
const mockRedirect = jest.fn();

jest.mock('next/navigation', () => ({ redirect: mockRedirect }));
jest.mock('next/cache', () => ({ revalidatePath: mockRevalidatePath }));
jest.mock('@/lib/admin/auth', () => ({
  requireAdmin: mockRequireAdmin,
  getAdminSessionUser: mockGetAdminSessionUser,
  getAdminAccessToken: mockGetAdminAccessToken,
}));
jest.mock('@/lib/admin/moderation', () => ({
  setModerationReportStatus: mockSetModerationReportStatus,
  unbanModerationUser: mockUnbanModerationUser,
  sendUnauthorizedModerationAlert: mockSendUnauthorizedModerationAlert,
}));

const reportId = '11111111-1111-4111-8111-111111111111';
const userId = '44444444-4444-4444-8444-444444444444';

function formData(values: Record<string, string>): FormData {
  const data = new FormData();
  Object.entries(values).forEach(([key, value]) => data.set(key, value));
  return data;
}

describe('admin moderation actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAdmin.mockResolvedValue('admin-user');
    mockGetAdminSessionUser.mockResolvedValue(null);
    mockGetAdminAccessToken.mockResolvedValue('verified-admin-token');
    mockSetModerationReportStatus.mockResolvedValue(undefined);
    mockUnbanModerationUser.mockResolvedValue(undefined);
    mockSendUnauthorizedModerationAlert.mockResolvedValue(undefined);
  });

  it('rejects an invalid report update without reading a token or calling the service', async () => {
    const { setReportStatusAction } = await import('@/app/admin/moderation/actions');

    await setReportStatusAction(formData({ source: 'other', reportId, status: 'queued' }));

    expect(mockGetAdminAccessToken).not.toHaveBeenCalled();
    expect(mockSetModerationReportStatus).not.toHaveBeenCalled();
    expect(mockRevalidatePath).not.toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalledWith('/admin/moderation?error=invalid_input');
  });

  it('updates a report through the verified token and redirects with a safe result code', async () => {
    const { setReportStatusAction } = await import('@/app/admin/moderation/actions');

    await setReportStatusAction(formData({ source: 'post_reports', reportId, status: 'actioned' }));

    expect(mockSetModerationReportStatus).toHaveBeenCalledWith('verified-admin-token', {
      source: 'post_reports',
      reportId,
      status: 'actioned',
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/moderation');
    expect(mockRedirect).toHaveBeenCalledWith('/admin/moderation?result=report_updated');
  });

  it('does not expose a report service failure in the redirect', async () => {
    mockSetModerationReportStatus.mockRejectedValue(new Error('raw Supabase error detail'));
    const { setReportStatusAction } = await import('@/app/admin/moderation/actions');

    await setReportStatusAction(formData({ source: 'post_reports', reportId, status: 'actioned' }));

    expect(mockRedirect).toHaveBeenCalledWith('/admin/moderation?error=update_failed');
    expect(mockRedirect).not.toHaveBeenCalledWith(expect.stringContaining('raw Supabase error detail'));
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  it('rejects an invalid unban request before reading a token or calling the service', async () => {
    const { unbanUserAction } = await import('@/app/admin/moderation/actions');

    await unbanUserAction(formData({ userId: 'not-a-uuid' }));

    expect(mockGetAdminAccessToken).not.toHaveBeenCalled();
    expect(mockUnbanModerationUser).not.toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalledWith('/admin/moderation?error=invalid_input');
  });

  it('unbans a UUID-shaped user through the verified token and redirects with a safe result code', async () => {
    const { unbanUserAction } = await import('@/app/admin/moderation/actions');

    await unbanUserAction(formData({ userId }));

    expect(mockUnbanModerationUser).toHaveBeenCalledWith('verified-admin-token', userId);
    expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/moderation');
    expect(mockRedirect).toHaveBeenCalledWith('/admin/moderation?result=user_unbanned');
  });

  it('redirects an unauthorised action before it reads form data or calls a service', async () => {
    mockRequireAdmin.mockResolvedValue(null);
    const { unbanUserAction } = await import('@/app/admin/moderation/actions');

    await unbanUserAction(formData({ userId }));

    expect(mockGetAdminAccessToken).not.toHaveBeenCalled();
    expect(mockUnbanModerationUser).not.toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalledWith('/admin/signin?error=unauthorized');
  });

  it('alerts a verified non-admin before redirecting a report-status action', async () => {
    const events: string[] = [];
    mockRequireAdmin.mockResolvedValue(null);
    mockGetAdminSessionUser.mockResolvedValue({ id: 'user-1', email: 'not-admin@example.com' });
    mockSendUnauthorizedModerationAlert.mockImplementation(async () => {
      events.push('alert');
    });
    mockRedirect.mockImplementation(() => {
      events.push('redirect');
    });
    const { setReportStatusAction } = await import('@/app/admin/moderation/actions');

    await setReportStatusAction(formData({ source: 'post_reports', reportId, status: 'actioned' }));

    expect(events).toEqual(['alert', 'redirect']);
    expect(mockSendUnauthorizedModerationAlert).toHaveBeenCalledWith(
      'user-1',
      'not-admin@example.com',
    );
  });

  it('alerts a verified non-admin before redirecting an unban action', async () => {
    const events: string[] = [];
    mockRequireAdmin.mockResolvedValue(null);
    mockGetAdminSessionUser.mockResolvedValue({ id: 'user-1', email: 'not-admin@example.com' });
    mockSendUnauthorizedModerationAlert.mockImplementation(async () => {
      events.push('alert');
    });
    mockRedirect.mockImplementation(() => {
      events.push('redirect');
    });
    const { unbanUserAction } = await import('@/app/admin/moderation/actions');

    await unbanUserAction(formData({ userId }));

    expect(events).toEqual(['alert', 'redirect']);
    expect(mockSendUnauthorizedModerationAlert).toHaveBeenCalledWith(
      'user-1',
      'not-admin@example.com',
    );
  });

  it('still redirects when the verified non-admin alert fails', async () => {
    mockRequireAdmin.mockResolvedValue(null);
    mockGetAdminSessionUser.mockResolvedValue({ id: 'user-1', email: 'not-admin@example.com' });
    mockSendUnauthorizedModerationAlert.mockRejectedValue(new Error('alert unavailable'));
    const { setReportStatusAction } = await import('@/app/admin/moderation/actions');

    await setReportStatusAction(formData({ source: 'post_reports', reportId, status: 'actioned' }));

    expect(mockRedirect).toHaveBeenCalledWith('/admin/signin?error=unauthorized');
  });

  it('does not alert an unverifiable caller before redirecting either moderation action', async () => {
    mockRequireAdmin.mockResolvedValue(null);
    mockGetAdminSessionUser.mockResolvedValue(null);
    const { setReportStatusAction, unbanUserAction } = await import('@/app/admin/moderation/actions');

    await setReportStatusAction(formData({ source: 'post_reports', reportId, status: 'actioned' }));
    await unbanUserAction(formData({ userId }));

    expect(mockSendUnauthorizedModerationAlert).not.toHaveBeenCalled();
  });
});
