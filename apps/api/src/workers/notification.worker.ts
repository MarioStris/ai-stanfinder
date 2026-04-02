import type { Job } from 'bullmq';
import { db } from '../lib/db.js';
import { sendPushNotification } from '../lib/push.js';
import { NotificationType, NotificationChannel, NotificationStatus } from '@prisma/client';

export interface NotificationJobData {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  channel?: NotificationChannel;
}

export async function processNotificationJob(
  job: Job<NotificationJobData>,
): Promise<void> {
  const { userId, type, title, body, data, channel = NotificationChannel.PUSH } = job.data;

  console.log(`[NotificationWorker] Processing job ${job.id} for user ${userId}`);

  const notification = await db.notification.create({
    data: {
      userId,
      type,
      title,
      body,
      data: data ?? {},
      channel,
      status: NotificationStatus.PENDING,
    },
  });

  if (channel !== NotificationChannel.PUSH) {
    console.log(`[NotificationWorker] Channel ${channel} not implemented yet`);
    return;
  }

  const preferences = await db.userPreference.findUnique({ where: { userId } });

  if (preferences && !preferences.pushEnabled) {
    console.log(`[NotificationWorker] Push disabled for user ${userId}`);
    await db.notification.update({
      where: { id: notification.id },
      data: { status: NotificationStatus.FAILED },
    });
    return;
  }

  const tokens = await db.pushToken.findMany({
    where: { userId, isActive: true },
    select: { token: true },
  });

  if (tokens.length === 0) {
    console.log(`[NotificationWorker] No active push tokens for user ${userId}`);
    await db.notification.update({
      where: { id: notification.id },
      data: { status: NotificationStatus.FAILED },
    });
    return;
  }

  const pushTokens = tokens.map((t) => t.token);
  const result = await sendPushNotification(pushTokens, title, body, data);

  const status =
    result.sent > 0 ? NotificationStatus.SENT : NotificationStatus.FAILED;

  await db.notification.update({
    where: { id: notification.id },
    data: { status, sentAt: status === NotificationStatus.SENT ? new Date() : null },
  });

  console.log(
    `[NotificationWorker] Job ${job.id} done — sent=${result.sent}, failed=${result.failed}`,
  );
}
