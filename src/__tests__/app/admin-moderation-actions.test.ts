const mockRequireAdmin = jest.fn();
const mockGetAdminAccessToken = jest.fn();
const mockSetModerationReportStatus = jest.fn();
const mockUnbanModerationUser = jest.fn();
const mockRevalidatePath = jest.fn();
const mockRedirect = jest.fn();

jest.mock('next/navigation', () => ({ redirect: mockRedirect }));
jest.mock('next/cache', () => ({ revalidatePath: mockRevalidatePath }));
jest.mock('@/lib/admin/auth', () => ({
  requireAdmin: mockRequireAdmin,
  getAdminAccessToken: mockGetAdminAccessToken,
}));
jest.mock('@/lib/admin/moderation', () => ({
  ...jest.requireActual('@/lib/admin/moderation'),
  setModerationReportStatus: mockSetModerationReportStatus,
  unbanModerationUser: mockUnbanModerationUser,
}));

const { ModerationUnbanPartialError } = jest.requireActual('@/lib/admin/moderation');

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
    mockGetAdminAccessToken.mockResolvedValue('verified-admin-token');
    mockSetModerationReportStatus.mockResolvedValue(undefined);
    mockUnbanModerationUser.mockResolvedValue(undefined);
  });

  it('rejects an invalid report update without reading a token or calling the service', async () => {
    const { setReportStatusAction } = await import('@/app/admin/moderation/actions');

    await setReportStatusAction(formData({ source: 'other', reportId, status: 'queued' }));

    expect(mockGetAdminAccessToken).not.toHaveBeenCalled();
    expect(mockSetModerationReportStatus).not.toHaveBeenCalled();
    expect(mockRevalidatePath).not.toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalledWith('/admin/moderation?error=invalid_input');
  });

  it('rejects a report update with a missing form field', async () => {
    const { setReportStatusAction } = await import('@/app/admin/moderation/actions');

    await setReportStatusAction(formData({ reportId, status: 'queued' }));

    expect(mockGetAdminAccessToken).not.toHaveBeenCalled();
    expect(mockSetModerationReportStatus).not.toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalledWith('/admin/moderation?error=invalid_input');
  });

  it('rejects a report update with an unsupported status', async () => {
    const { setReportStatusAction } = await import('@/app/admin/moderation/actions');

    await setReportStatusAction(formData({ source: 'post_reports', reportId, status: 'pending' }));

    expect(mockGetAdminAccessToken).not.toHaveBeenCalled();
    expect(mockSetModerationReportStatus).not.toHaveBeenCalled();
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

  it('redirects a report update when the access token is unavailable', async () => {
    mockGetAdminAccessToken.mockResolvedValue(null);
    const { setReportStatusAction } = await import('@/app/admin/moderation/actions');

    await setReportStatusAction(formData({ source: 'post_reports', reportId, status: 'actioned' }));

    expect(mockSetModerationReportStatus).not.toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalledWith('/admin/signin?error=unauthorized');
  });

  it('does not expose an unban service failure in the redirect', async () => {
    mockUnbanModerationUser.mockRejectedValue(new Error('raw Supabase error detail'));
    const { unbanUserAction } = await import('@/app/admin/moderation/actions');

    await unbanUserAction(formData({ userId }));

    expect(mockRedirect).toHaveBeenCalledWith('/admin/moderation?error=unban_failed');
    expect(mockRedirect).not.toHaveBeenCalledWith(expect.stringContaining('raw Supabase error detail'));
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  it('redirects with a distinct code when the unban was rolled back after the audit RPC failed', async () => {
    mockUnbanModerationUser.mockRejectedValue(new ModerationUnbanPartialError());
    const { unbanUserAction } = await import('@/app/admin/moderation/actions');

    await unbanUserAction(formData({ userId }));

    expect(mockRedirect).toHaveBeenCalledWith('/admin/moderation?error=unban_partial');
    expect(mockRedirect).not.toHaveBeenCalledWith('/admin/moderation?error=unban_failed');
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  it('does not treat a plain unban failure as the partial-unban case', async () => {
    mockUnbanModerationUser.mockRejectedValue(new Error('Unable to unban moderation user'));
    const { unbanUserAction } = await import('@/app/admin/moderation/actions');

    await unbanUserAction(formData({ userId }));

    expect(mockRedirect).toHaveBeenCalledWith('/admin/moderation?error=unban_failed');
    expect(mockRedirect).not.toHaveBeenCalledWith('/admin/moderation?error=unban_partial');
  });

  it('redirects an unban when the access token is unavailable', async () => {
    mockGetAdminAccessToken.mockResolvedValue(null);
    const { unbanUserAction } = await import('@/app/admin/moderation/actions');

    await unbanUserAction(formData({ userId }));

    expect(mockUnbanModerationUser).not.toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalledWith('/admin/signin?error=unauthorized');
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

});
