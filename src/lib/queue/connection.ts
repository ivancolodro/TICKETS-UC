import IORedis from "ioredis";

let connection: IORedis | null = null;

export function getQueueConnection(): IORedis {
  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error("REDIS_URL is required for BullMQ workers");
  }

  if (!connection) {
    connection = new IORedis(url, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
  }

  return connection;
}
