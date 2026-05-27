import { Queue } from "bullmq";
import { getQueueConnection } from "./connection";

const prefix = process.env.QUEUE_PREFIX ?? "tickets-uc";

function createQueue(name: string) {
  return new Queue(name, {
    connection: getQueueConnection() as never,
    prefix,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: 1000,
      removeOnFail: 5000,
    },
  });
}

export type EmailJobPayload = {
  to: string;
  templateSlug: string;
  variables: Record<string, string>;
  ticketId?: string;
};

export type NotificationJobPayload = {
  userId: string;
  title: string;
  body: string;
  ticketId?: string;
};

let emailQueue: Queue<EmailJobPayload> | null = null;
let notificationQueue: Queue<NotificationJobPayload> | null = null;

export function getEmailQueue(): Queue<EmailJobPayload> {
  if (!emailQueue) {
    emailQueue = createQueue("email");
  }
  return emailQueue;
}

export function getNotificationQueue(): Queue<NotificationJobPayload> {
  if (!notificationQueue) {
    notificationQueue = createQueue("notifications");
  }
  return notificationQueue;
}

export const QueueNames = {
  EMAIL: "email",
  NOTIFICATIONS: "notifications",
} as const;
