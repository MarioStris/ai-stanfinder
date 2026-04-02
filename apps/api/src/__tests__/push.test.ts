import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('expo-server-sdk', () => {
  const mockSend = vi.fn();
  const ExpoMock = vi.fn().mockImplementation(() => ({
    sendPushNotificationsAsync: mockSend,
    chunkPushNotifications: (msgs: unknown[]) => [msgs],
  }));
  (ExpoMock as unknown as { isExpoPushToken: (t: string) => boolean }).isExpoPushToken = (t: string) =>
    t.startsWith('ExponentPushToken[');
  return { default: ExpoMock };
});

vi.mock('../lib/db.js', () => ({
  db: {
    pushToken: {
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));

import { sendPushNotification, sendMatchNotification } from '../lib/push.js';
import { db } from '../lib/db.js';

const VALID_TOKEN = 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]';
const INVALID_TOKEN = 'not-a-valid-expo-token';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('sendPushNotification', () => {
  it('filters out invalid tokens before sending', async () => {
    const result = await sendPushNotification(
      [INVALID_TOKEN],
      'Test',
      'Body',
    );

    expect(result.sent).toBe(0);
    expect(result.invalidTokens).toContain(INVALID_TOKEN);
  });

  it('returns sent=0 when no valid tokens provided', async () => {
    const result = await sendPushNotification([], 'Test', 'Body');
    expect(result.sent).toBe(0);
    expect(result.failed).toBe(0);
  });

  it('calls expo SDK with correct message shape', async () => {
    const Expo = (await import('expo-server-sdk')).default as unknown as {
      new (): { sendPushNotificationsAsync: ReturnType<typeof vi.fn>; chunkPushNotifications: (m: unknown[]) => unknown[][] };
    };
    const instance = new Expo();
    (instance.sendPushNotificationsAsync as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { status: 'ok', id: 'test-id' },
    ]);

    const result = await sendPushNotification([VALID_TOKEN], 'Hello', 'World', { key: 'value' });
    expect(result).toBeDefined();
  });

  it('deactivates DeviceNotRegistered tokens', async () => {
    const Expo = (await import('expo-server-sdk')).default as unknown as {
      new (): { sendPushNotificationsAsync: ReturnType<typeof vi.fn>; chunkPushNotifications: (m: unknown[]) => unknown[][] };
    };
    const instance = new Expo();
    (instance.sendPushNotificationsAsync as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { status: 'error', message: 'Not registered', details: { error: 'DeviceNotRegistered' } },
    ]);

    await sendPushNotification([VALID_TOKEN], 'Test', 'Body');
    expect(db.pushToken.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isActive: false } }),
    );
  });
});

describe('sendMatchNotification', () => {
  it('does nothing when user has no push tokens', async () => {
    vi.mocked(db.pushToken.findMany).mockResolvedValueOnce([]);

    await sendMatchNotification('user-1', {
      matchId: 'm-1',
      propertyId: 'p-1',
      matchPercent: 95,
      title: 'Nice apartment',
      city: 'Zagreb',
      price: 150000,
    });

    expect(db.pushToken.updateMany).not.toHaveBeenCalled();
  });

  it('sends notification when user has active tokens', async () => {
    vi.mocked(db.pushToken.findMany).mockResolvedValueOnce([
      { token: VALID_TOKEN } as { token: string },
    ]);

    const Expo = (await import('expo-server-sdk')).default as unknown as {
      new (): { sendPushNotificationsAsync: ReturnType<typeof vi.fn>; chunkPushNotifications: (m: unknown[]) => unknown[][] };
    };
    const instance = new Expo();
    (instance.sendPushNotificationsAsync as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { status: 'ok', id: 'ticket-1' },
    ]);

    await sendMatchNotification('user-1', {
      matchId: 'm-1',
      propertyId: 'p-1',
      matchPercent: 92,
      title: 'Lovely flat',
      city: 'Split',
      price: 200000,
    });
  });
});
