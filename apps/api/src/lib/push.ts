import Expo, { type ExpoPushMessage, type ExpoPushTicket } from 'expo-server-sdk';
import { db } from './db.js';

let expo: Expo | null = null;

function getExpo(): Expo {
  if (!expo) {
    expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });
  }
  return expo;
}

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export interface MatchData {
  matchId: string;
  propertyId: string;
  matchPercent: number;
  title: string;
  city: string;
  price: number;
}

export async function sendPushNotification(
  pushTokens: string[],
  title: string,
  body: string,
  data?: Record<string, unknown>,
): Promise<{ sent: number; failed: number; invalidTokens: string[] }> {
  const client = getExpo();
  const invalidTokens: string[] = [];

  const validTokens = pushTokens.filter((token) => {
    if (!Expo.isExpoPushToken(token)) {
      invalidTokens.push(token);
      return false;
    }
    return true;
  });

  if (validTokens.length === 0) {
    return { sent: 0, failed: 0, invalidTokens };
  }

  const messages: ExpoPushMessage[] = validTokens.map((to) => ({
    to,
    title,
    body,
    data: data ?? {},
    sound: 'default',
  }));

  const chunks = client.chunkPushNotifications(messages);
  let sent = 0;
  let failed = 0;
  const tokensToDeactivate: string[] = [];

  for (const chunk of chunks) {
    let tickets: ExpoPushTicket[];
    try {
      tickets = await client.sendPushNotificationsAsync(chunk);
    } catch (err) {
      console.error('[Push] Failed to send chunk:', err);
      failed += chunk.length;
      continue;
    }

    for (let i = 0; i < tickets.length; i++) {
      const ticket = tickets[i];
      if (ticket.status === 'ok') {
        sent++;
      } else {
        failed++;
        const token = (chunk[i] as ExpoPushMessage).to as string;
        if (
          ticket.status === 'error' &&
          ticket.details?.error === 'DeviceNotRegistered'
        ) {
          tokensToDeactivate.push(token);
        }
      }
    }
  }

  if (tokensToDeactivate.length > 0) {
    await cleanupInvalidTokens(tokensToDeactivate);
    invalidTokens.push(...tokensToDeactivate);
  }

  return { sent, failed, invalidTokens };
}

async function cleanupInvalidTokens(tokens: string[]): Promise<void> {
  await db.pushToken.updateMany({
    where: { token: { in: tokens } },
    data: { isActive: false },
  });
  console.log(`[Push] Deactivated ${tokens.length} invalid push tokens`);
}

export async function sendMatchNotification(
  userId: string,
  match: MatchData,
): Promise<void> {
  const tokens = await db.pushToken.findMany({
    where: { userId, isActive: true },
    select: { token: true },
  });

  if (tokens.length === 0) return;

  const pushTokens = tokens.map((t) => t.token);
  const title = `${match.matchPercent}% match found`;
  const body = `${match.title} — ${match.city} | ${match.price.toLocaleString()} EUR`;
  const data = {
    type: 'NEW_MATCH',
    matchId: match.matchId,
    propertyId: match.propertyId,
  };

  const result = await sendPushNotification(pushTokens, title, body, data);
  console.log(
    `[Push] Match notification for user ${userId}: sent=${result.sent}, failed=${result.failed}`,
  );
}
