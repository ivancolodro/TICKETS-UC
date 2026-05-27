/**
 * Worker BullMQ — ejecutar en proceso separado:
 *   npm run queue:worker
 *
 * Procesadores completos en módulo Email/Notificaciones.
 */
import { Worker } from "bullmq";
import { getQueueConnection } from "@/lib/queue/connection";
import { QueueNames } from "@/lib/queue/queues";
import type { EmailJobPayload } from "@/lib/queue/queues";

const prefix = process.env.QUEUE_PREFIX ?? "tickets-uc";

const emailWorker = new Worker<EmailJobPayload>(
  QueueNames.EMAIL,
  async (job) => {
    console.log("[email-worker] job received:", job.id, job.data.templateSlug);
    // TODO(módulo-email): cargar plantilla React Email y enviar vía mailer
  },
  {
    connection: getQueueConnection() as never,
    prefix,
    concurrency: Number(process.env.EMAIL_QUEUE_CONCURRENCY ?? 5),
  }
);

emailWorker.on("failed", (job, err) => {
  console.error("[email-worker] failed:", job?.id, err.message);
});

console.log("BullMQ workers started (email)");

process.on("SIGTERM", async () => {
  await emailWorker.close();
  process.exit(0);
});
