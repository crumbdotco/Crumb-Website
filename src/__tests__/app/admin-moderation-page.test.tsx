import { render, screen } from '@testing-library/react';

const mockRequireAdmin = jest.fn();
const mockGetAdminAccessToken = jest.fn();
const mockFetchModerationData = jest.fn();
const mockRedirect = jest.fn();

jest.mock('next/navigation', () => ({ redirect: mockRedirect }));

jest.mock('@/lib/admin/auth', () => ({
  requireAdmin: mockRequireAdmin,
  getAdminAccessToken: mockGetAdminAccessToken,
}));

jest.mock('@/lib/admin/moderation', () => ({
  ...jest.requireActual('@/lib/admin/moderation'),
  fetchModerationData: mockFetchModerationData,
}));

jest.mock('@/app/admin/moderation/actions', () => ({
  setReportStatusAction: jest.fn(),
  unbanUserAction: jest.fn(),
}));

const report = {
  source: 'post_reports' as const,
  id: '11111111-1111-4111-8111-111111111111',
  target_type: 'post',
  target_id: '22222222-2222-4222-8222-222222222222',
  reporter_id: '33333333-3333-4333-8333-333333333333',
  reason: 'spam',
  category: 'safety',
  note: 'Please review',
  status: 'queued' as const,
  emailed: true,
  created_at: '2026-09-13T12:00:00.000Z',
  handled_by: null,
  handled_at: null,
  report_number: 42,
};

const groupReport = {
  ...report,
  source: 'group_content_reports' as const,
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  target_type: 'group_post',
  target_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  category: 'harassment',
  reason: 'abuse',
  note: 'Group review required',
  report_number: null,
  emailed: null,
};

const ban = {
  user_id: '44444444-4444-4444-8444-444444444444',
  username: null,
  shadow_banned_at: '2026-09-12T10:00:00.000Z',
  hard_banned_at: '2026-09-12T12:00:00.000Z',
  reason: 'Repeated abuse',
  actor_id: '55555555-5555-4555-8555-555555555555',
  updated_at: '2026-09-12T12:00:00.000Z',
  identity_count: 2,
};

const audit = {
  id: '66666666-6666-4666-8666-666666666666',
  actor_id: '55555555-5555-4555-8555-555555555555',
  action: 'unban',
  target_type: 'user',
  target_id: ban.user_id,
  reason: 'Appeal accepted',
  created_at: '2026-09-13T12:00:00.000Z',
};

describe('admin moderation page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects an unauthorised visitor before it loads moderation data', async () => {
    mockRequireAdmin.mockResolvedValue(null);

    const { default: ModerationPage } = await import('@/app/admin/moderation/page');
    await expect(ModerationPage()).resolves.toBeNull();

    expect(mockRedirect).toHaveBeenCalledWith('/admin/signin?error=unauthorized');
    expect(mockFetchModerationData).not.toHaveBeenCalled();
  });

  it('redirects an admin whose access token is unavailable before it loads moderation data', async () => {
    mockRequireAdmin.mockResolvedValue('admin-user');
    mockGetAdminAccessToken.mockResolvedValue(null);

    const { default: ModerationPage } = await import('@/app/admin/moderation/page');
    await expect(ModerationPage()).resolves.toBeNull();

    expect(mockRedirect).toHaveBeenCalledWith('/admin/signin?error=unauthorized');
    expect(mockFetchModerationData).not.toHaveBeenCalled();
  });

  it('renders unavailable states when the moderation read rejects', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockRequireAdmin.mockResolvedValue('admin-user');
    mockGetAdminAccessToken.mockResolvedValue('verified-admin-token');
    mockFetchModerationData.mockRejectedValue(new Error('secret moderation failure'));

    try {
      const { default: ModerationPage } = await import('@/app/admin/moderation/page');
      render(await ModerationPage());
    } finally {
      consoleErrorSpy.mockRestore();
    }

    expect(screen.getByText('Reports are unavailable right now.')).toBeInTheDocument();
    expect(screen.getByText('Active bans are unavailable right now.')).toBeInTheDocument();
    expect(screen.getByText('Audit history is unavailable right now.')).toBeInTheDocument();
  });

  it('renders combined reports, active bans, audit records, and operator forms for an admin', async () => {
    mockRequireAdmin.mockResolvedValue('admin-user');
    mockGetAdminAccessToken.mockResolvedValue('verified-admin-token');
    mockFetchModerationData.mockResolvedValue({
      reports: { available: true, rows: [report, groupReport] },
      bans: { available: true, rows: [ban] },
      audit: { available: true, rows: [audit] },
    });

    const { default: ModerationPage } = await import('@/app/admin/moderation/page');
    render(await ModerationPage());

    expect(mockFetchModerationData).toHaveBeenCalledWith('verified-admin-token');
    expect(screen.getByRole('heading', { name: 'Moderation' })).toBeInTheDocument();
    const reportSource = screen.getByText('post_reports');
    expect(reportSource).toBeInTheDocument();
    expect(reportSource).toHaveClass('opacity-60');
    expect(reportSource).not.toHaveClass('text-[#E6C39B]');
    expect(screen.getByText('group_content_reports')).toBeInTheDocument();
    expect(screen.getByText('Report #42')).toBeInTheDocument();
    expect(screen.getByText('safety')).toBeInTheDocument();
    expect(screen.getByText('spam')).toBeInTheDocument();
    expect(screen.getByText('Please review')).toBeInTheDocument();
    expect(screen.getByText('Delivered')).toBeInTheDocument();
    expect(screen.getByText('Delivery unknown')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Set queued' })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: 'Set actioned' })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: 'Set dismissed' })).toHaveLength(2);
    expect(screen.getAllByText(ban.user_id)).toHaveLength(2);
    expect(screen.getByText('Username unavailable')).toBeInTheDocument();
    expect(screen.getByText('Shadow banned')).toBeInTheDocument();
    expect(screen.getByText('Hard banned')).toBeInTheDocument();
    expect(screen.getByText('Repeated abuse')).toBeInTheDocument();
    expect(screen.getByText('2 linked identities')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Unban user' })).toBeInTheDocument();
    expect(screen.getByText('unban')).toBeInTheDocument();
    expect(screen.getByText('Appeal accepted')).toBeInTheDocument();
  });

  it('shows a clear unavailable state for each failed moderation read', async () => {
    mockRequireAdmin.mockResolvedValue('admin-user');
    mockGetAdminAccessToken.mockResolvedValue('verified-admin-token');
    mockFetchModerationData.mockResolvedValue({
      reports: { available: false },
      bans: { available: false },
      audit: { available: false },
    });

    const { default: ModerationPage } = await import('@/app/admin/moderation/page');
    render(await ModerationPage());

    expect(screen.getByText('Reports are unavailable right now.')).toBeInTheDocument();
    expect(screen.getByText('Active bans are unavailable right now.')).toBeInTheDocument();
    expect(screen.getByText('Audit history is unavailable right now.')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Newest reports' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Older reports' })).not.toBeInTheDocument();
  });

  it('does not show report pagination for an initial empty page', async () => {
    mockRequireAdmin.mockResolvedValue('admin-user');
    mockGetAdminAccessToken.mockResolvedValue('verified-admin-token');
    mockFetchModerationData.mockResolvedValue({
      reports: { available: true, rows: [] },
      bans: { available: true, rows: [] },
      audit: { available: true, rows: [] },
    });

    const { default: ModerationPage } = await import('@/app/admin/moderation/page');
    render(await ModerationPage());

    expect(screen.queryByRole('link', { name: 'Newest reports' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Older reports' })).not.toBeInTheDocument();
  });

  it('passes a valid before cursor and shows a Newest reports link', async () => {
    const before = '2026-09-13T12:00:00.123456+00:00';
    const beforeId = '77777777-7777-4777-8777-777777777777';
    mockRequireAdmin.mockResolvedValue('admin-user');
    mockGetAdminAccessToken.mockResolvedValue('verified-admin-token');
    mockFetchModerationData.mockResolvedValue({
      reports: { available: true, rows: [report] },
      bans: { available: true, rows: [] },
      audit: { available: true, rows: [] },
    });

    const { default: ModerationPage } = await import('@/app/admin/moderation/page');
    render(await ModerationPage({ searchParams: Promise.resolve({ before, beforeId }) }));

    expect(mockFetchModerationData).toHaveBeenCalledWith('verified-admin-token', { before, beforeId });
    expect(screen.getByRole('link', { name: 'Newest reports' })).toHaveAttribute(
      'href',
      '/admin/moderation',
    );
  });

  it('drops an invalid beforeId with its valid before cursor and loads page 1', async () => {
    const before = '2026-09-13T12:00:00.000Z';
    mockRequireAdmin.mockResolvedValue('admin-user');
    mockGetAdminAccessToken.mockResolvedValue('verified-admin-token');
    mockFetchModerationData.mockResolvedValue({
      reports: { available: true, rows: [] },
      bans: { available: true, rows: [] },
      audit: { available: true, rows: [] },
    });

    const { default: ModerationPage } = await import('@/app/admin/moderation/page');
    render(await ModerationPage({ searchParams: Promise.resolve({ before, beforeId: 'not-a-uuid' }) }));

    expect(mockFetchModerationData).toHaveBeenCalledWith('verified-admin-token');
  });

  it('drops a beforeId without a valid before cursor and loads page 1', async () => {
    mockRequireAdmin.mockResolvedValue('admin-user');
    mockGetAdminAccessToken.mockResolvedValue('verified-admin-token');
    mockFetchModerationData.mockResolvedValue({
      reports: { available: true, rows: [] },
      bans: { available: true, rows: [] },
      audit: { available: true, rows: [] },
    });

    const { default: ModerationPage } = await import('@/app/admin/moderation/page');
    render(await ModerationPage({ searchParams: Promise.resolve({ beforeId: report.id }) }));

    expect(mockFetchModerationData).toHaveBeenCalledWith('verified-admin-token');
  });

  it('shows an Older reports link when the queued report page is full', async () => {
    mockRequireAdmin.mockResolvedValue('admin-user');
    mockGetAdminAccessToken.mockResolvedValue('verified-admin-token');
    mockFetchModerationData.mockResolvedValue({
      reports: {
        available: true,
        rows: Array.from({ length: 50 }, (_, index) => ({
          ...report,
          id: `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`,
          created_at: `2026-09-13T12:${String(index % 60).padStart(2, '0')}:00.000Z`,
        })),
      },
      bans: { available: true, rows: [] },
      audit: { available: true, rows: [] },
    });

    const { default: ModerationPage } = await import('@/app/admin/moderation/page');
    render(await ModerationPage());

    expect(screen.getByRole('link', { name: 'Older reports' })).toHaveAttribute(
      'href',
      '/admin/moderation?before=2026-09-13T12%3A49%3A00.000Z&beforeId=00000000-0000-4000-8000-000000000049',
    );
    expect(screen.queryByRole('link', { name: 'Newest reports' })).not.toBeInTheDocument();
  });

  // PostgREST trims trailing zeros from a timestamptz fraction and omits it
  // entirely for a zero fraction. These are real production shapes for a
  // report's created_at, not hypothetical ones; before this round none of
  // them survived isModerationCursor, so a full page whose last row landed
  // on one of these shapes silently never rendered "Older reports" at all,
  // making every older report unreachable with no signal.
  it.each([
    ['no fraction, numeric offset', '2026-09-13T11:00:00+00:00'],
    ['one fraction digit', '2026-09-13T11:00:00.5+00:00'],
    ['two fraction digits', '2026-09-13T11:00:00.12+00:00'],
  ])(
    'renders Older reports and forwards the exact cursor for a short-fraction created_at (%s)',
    async (_label, lastCreatedAt) => {
      mockRequireAdmin.mockResolvedValue('admin-user');
      mockGetAdminAccessToken.mockResolvedValue('verified-admin-token');
      const rows = Array.from({ length: 50 }, (_, index) => ({
        ...report,
        id: `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`,
        created_at:
          index === 49 ? lastCreatedAt : `2026-09-13T12:${String(index % 60).padStart(2, '0')}:00.000Z`,
      }));
      mockFetchModerationData.mockResolvedValueOnce({
        reports: { available: true, rows },
        bans: { available: true, rows: [] },
        audit: { available: true, rows: [] },
      });

      const { default: ModerationPage } = await import('@/app/admin/moderation/page');
      render(await ModerationPage());

      const link = screen.getByRole('link', { name: 'Older reports' });
      const href = link.getAttribute('href') ?? '';
      const query = new URLSearchParams(href.slice(href.indexOf('?') + 1));
      const forwardedBefore = query.get('before');
      const forwardedBeforeId = query.get('beforeId');
      expect(forwardedBefore).toBe(lastCreatedAt);
      expect(forwardedBeforeId).toBe(rows[49].id);

      mockFetchModerationData.mockClear();
      mockFetchModerationData.mockResolvedValueOnce({
        reports: { available: true, rows: [] },
        bans: { available: true, rows: [] },
        audit: { available: true, rows: [] },
      });

      render(
        await ModerationPage({
          searchParams: Promise.resolve({
            before: forwardedBefore ?? undefined,
            beforeId: forwardedBeforeId ?? undefined,
          }),
        }),
      );

      expect(mockFetchModerationData).toHaveBeenCalledWith('verified-admin-token', {
        before: lastCreatedAt,
        beforeId: rows[49].id,
      });
    },
  );

  it.each([
    ['result', 'report_updated', 'Report status updated.'],
    ['result', 'user_unbanned', 'User unbanned.'],
    ['error', 'invalid_input', 'The submitted moderation input was invalid.'],
    ['error', 'update_failed', 'Unable to update the report.'],
    ['error', 'unban_failed', 'Unable to unban the user.'],
    [
      'error',
      'unban_partial',
      'The user was re-banned because the unban could not be recorded. No audit entry was created. Retry the unban.',
    ],
    [
      'error',
      'unban_unprotected',
      'The unban could not be recorded, and the compensating re-ban also failed. The account is NOT currently banned, and no audit entry exists. Retry the unban immediately.',
    ],
  ])('shows the safe message for %s=%s', async (key, value, message) => {
    mockRequireAdmin.mockResolvedValue('admin-user');
    mockGetAdminAccessToken.mockResolvedValue('verified-admin-token');
    mockFetchModerationData.mockResolvedValue({
      reports: { available: true, rows: [] },
      bans: { available: true, rows: [] },
      audit: { available: true, rows: [] },
    });

    const { default: ModerationPage } = await import('@/app/admin/moderation/page');
    render(await ModerationPage({ searchParams: Promise.resolve({ [key]: value }) }));

    expect(screen.getByRole('status')).toHaveTextContent(message);
  });

  it('gives the operator a materially different story for unban_partial vs. unban_unprotected', async () => {
    // The re-ban-succeeded and re-ban-also-failed outcomes were once
    // collapsed onto the same copy, which told the operator "the account is
    // banned again" even in the case where it was not. Assert the two
    // messages are distinct strings AND that only the unprotected one says
    // the account is currently unbanned.
    mockRequireAdmin.mockResolvedValue('admin-user');
    mockGetAdminAccessToken.mockResolvedValue('verified-admin-token');
    mockFetchModerationData.mockResolvedValue({
      reports: { available: true, rows: [] },
      bans: { available: true, rows: [] },
      audit: { available: true, rows: [] },
    });

    const { default: ModerationPage } = await import('@/app/admin/moderation/page');

    const { unmount: unmountPartial } = render(
      await ModerationPage({ searchParams: Promise.resolve({ error: 'unban_partial' }) }),
    );
    const partialMessage = screen.getByRole('status').textContent;
    unmountPartial();

    const { unmount: unmountUnprotected } = render(
      await ModerationPage({ searchParams: Promise.resolve({ error: 'unban_unprotected' }) }),
    );
    const unprotectedMessage = screen.getByRole('status').textContent;
    unmountUnprotected();

    expect(partialMessage).not.toEqual(unprotectedMessage);
    expect(partialMessage).not.toMatch(/NOT currently banned/);
    expect(unprotectedMessage).toMatch(/NOT currently banned/);
  });

  it('ignores unknown result and error values', async () => {
    mockRequireAdmin.mockResolvedValue('admin-user');
    mockGetAdminAccessToken.mockResolvedValue('verified-admin-token');
    mockFetchModerationData.mockResolvedValue({
      reports: { available: true, rows: [] },
      bans: { available: true, rows: [] },
      audit: { available: true, rows: [] },
    });

    const { default: ModerationPage } = await import('@/app/admin/moderation/page');
    render(await ModerationPage({ searchParams: Promise.resolve({ result: 'nope', error: 'nope' }) }));

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it.each(['__proto__', 'constructor', 'toString'])('ignores inherited message key %s without crashing', async (code) => {
    mockRequireAdmin.mockResolvedValue('admin-user');
    mockGetAdminAccessToken.mockResolvedValue('verified-admin-token');
    mockFetchModerationData.mockResolvedValue({
      reports: { available: true, rows: [] },
      bans: { available: true, rows: [] },
      audit: { available: true, rows: [] },
    });

    const { default: ModerationPage } = await import('@/app/admin/moderation/page');
    render(await ModerationPage({ searchParams: Promise.resolve({ result: code }) }));

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows the Newest reports escape link for an empty older cursor page', async () => {
    const before = '2026-09-13T12:00:00.000Z';
    mockRequireAdmin.mockResolvedValue('admin-user');
    mockGetAdminAccessToken.mockResolvedValue('verified-admin-token');
    mockFetchModerationData.mockResolvedValue({
      reports: { available: true, rows: [] },
      bans: { available: true, rows: [] },
      audit: { available: true, rows: [] },
    });

    const { default: ModerationPage } = await import('@/app/admin/moderation/page');
    render(await ModerationPage({ searchParams: Promise.resolve({ before, beforeId: report.id }) }));

    expect(screen.getByRole('link', { name: 'Newest reports' })).toHaveAttribute('href', '/admin/moderation');
    expect(screen.queryByRole('link', { name: 'Older reports' })).not.toBeInTheDocument();
  });

  it('shows the Newest reports escape link for an unavailable older cursor page', async () => {
    const before = '2026-09-13T12:00:00.000Z';
    mockRequireAdmin.mockResolvedValue('admin-user');
    mockGetAdminAccessToken.mockResolvedValue('verified-admin-token');
    mockFetchModerationData.mockResolvedValue({
      reports: { available: false },
      bans: { available: true, rows: [] },
      audit: { available: true, rows: [] },
    });

    const { default: ModerationPage } = await import('@/app/admin/moderation/page');
    render(await ModerationPage({ searchParams: Promise.resolve({ before, beforeId: report.id }) }));

    expect(screen.getByRole('link', { name: 'Newest reports' })).toHaveAttribute('href', '/admin/moderation');
  });

  it('shows the audit history cap driven by the shared limit constant', async () => {
    mockRequireAdmin.mockResolvedValue('admin-user');
    mockGetAdminAccessToken.mockResolvedValue('verified-admin-token');
    mockFetchModerationData.mockResolvedValue({
      reports: { available: true, rows: [] },
      bans: { available: true, rows: [] },
      audit: { available: true, rows: [audit] },
    });

    const { default: ModerationPage } = await import('@/app/admin/moderation/page');
    render(await ModerationPage());

    expect(screen.getByText('Showing the latest 100 entries.')).toBeInTheDocument();
  });

  it('does not show the audit history cap note when audit history is unavailable', async () => {
    mockRequireAdmin.mockResolvedValue('admin-user');
    mockGetAdminAccessToken.mockResolvedValue('verified-admin-token');
    mockFetchModerationData.mockResolvedValue({
      reports: { available: true, rows: [] },
      bans: { available: true, rows: [] },
      audit: { available: false },
    });

    const { default: ModerationPage } = await import('@/app/admin/moderation/page');
    render(await ModerationPage());

    expect(screen.queryByText(/Showing the latest/)).not.toBeInTheDocument();
  });

  describe('report status filter', () => {
    beforeEach(() => {
      mockRequireAdmin.mockResolvedValue('admin-user');
      mockGetAdminAccessToken.mockResolvedValue('verified-admin-token');
      mockFetchModerationData.mockResolvedValue({
        reports: { available: true, rows: [] },
        bans: { available: true, rows: [] },
        audit: { available: true, rows: [] },
      });
    });

    it('defaults to the queued status filter and requests no status option', async () => {
      const { default: ModerationPage } = await import('@/app/admin/moderation/page');
      render(await ModerationPage());

      expect(mockFetchModerationData).toHaveBeenCalledWith('verified-admin-token');
      expect(screen.getByText('Showing: Queued')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Actioned' })).toHaveAttribute(
        'href',
        '/admin/moderation?status=actioned',
      );
      expect(screen.getByRole('link', { name: 'Dismissed' })).toHaveAttribute(
        'href',
        '/admin/moderation?status=dismissed',
      );
      expect(screen.getByRole('link', { name: 'All statuses' })).toHaveAttribute(
        'href',
        '/admin/moderation?status=all',
      );
      expect(screen.queryByRole('link', { name: 'Queued' })).not.toBeInTheDocument();
    });

    it('passes a valid non-default status filter through to fetchModerationData', async () => {
      const { default: ModerationPage } = await import('@/app/admin/moderation/page');
      render(await ModerationPage({ searchParams: Promise.resolve({ status: 'actioned' }) }));

      expect(mockFetchModerationData).toHaveBeenCalledWith('verified-admin-token', { status: 'actioned' });
      expect(screen.getByText('Showing: Actioned')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Queued' })).toHaveAttribute('href', '/admin/moderation');
    });

    it('maps the all status filter to the all option', async () => {
      const { default: ModerationPage } = await import('@/app/admin/moderation/page');
      render(await ModerationPage({ searchParams: Promise.resolve({ status: 'all' }) }));

      expect(mockFetchModerationData).toHaveBeenCalledWith('verified-admin-token', { status: 'all' });
      expect(screen.getByText('Showing: All statuses')).toBeInTheDocument();
    });

    it('falls back to the default queued filter for an invalid status value', async () => {
      const { default: ModerationPage } = await import('@/app/admin/moderation/page');
      render(await ModerationPage({ searchParams: Promise.resolve({ status: 'bogus' }) }));

      expect(mockFetchModerationData).toHaveBeenCalledWith('verified-admin-token');
      expect(screen.getByText('Showing: Queued')).toBeInTheDocument();
    });

    it('combines a status filter and a before cursor in the fetch options and in pagination hrefs', async () => {
      const before = '2026-09-13T12:00:00.000Z';
      mockFetchModerationData.mockResolvedValue({
        reports: {
          available: true,
          rows: Array.from({ length: 50 }, (_, index) => ({
            ...report,
            source: 'post_reports' as const,
            status: 'actioned' as const,
            id: `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`,
            created_at: `2026-09-13T12:${String(index % 60).padStart(2, '0')}:00.000Z`,
          })),
        },
        bans: { available: true, rows: [] },
        audit: { available: true, rows: [] },
      });

      const { default: ModerationPage } = await import('@/app/admin/moderation/page');
      render(
        await ModerationPage({
          searchParams: Promise.resolve({ status: 'actioned', before, beforeId: report.id }),
        }),
      );

      expect(mockFetchModerationData).toHaveBeenCalledWith('verified-admin-token', {
        before,
        beforeId: report.id,
        status: 'actioned',
      });
      expect(screen.getByRole('link', { name: 'Newest reports' })).toHaveAttribute(
        'href',
        '/admin/moderation?status=actioned',
      );
      expect(screen.getByRole('link', { name: 'Older reports' })).toHaveAttribute(
        'href',
        '/admin/moderation?status=actioned&before=2026-09-13T12%3A49%3A00.000Z&beforeId=00000000-0000-4000-8000-000000000049',
      );
    });
  });
});
