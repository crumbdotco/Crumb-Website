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
  });
});
