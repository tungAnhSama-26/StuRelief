import prisma from '@/lib/prisma';

export type NotificationType = 'SYSTEM' | 'TRANSACTION' | 'CHAT' | 'ALARM';

type CreateUserNotificationInput = {
  userId: string;
  title: string;
  content: string;
  type?: NotificationType;
  link?: string | null;
};

export async function createUserNotification(input: CreateUserNotificationInput) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      title: input.title,
      content: input.content,
      type: input.type ?? 'SYSTEM',
      link: input.link ?? null,
    },
  });
}
