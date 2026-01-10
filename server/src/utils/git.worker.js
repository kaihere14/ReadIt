import IORedis from "ioredis";
import { Queue } from "bullmq";
import { Worker } from "bullmq";

export const connection = new IORedis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  username: "default",
  maxRetriesPerRequest: null,
  retryStrategy: (times) => {
    if (times > 3) {
      console.error(
        "Redis connection failed after 3 retries. Stopping reconnection attempts."
      );
      return null; // Stop retrying
    }
    const delay = Math.min(times * 1000, 3000);
    console.log(`Retrying Redis connection in ${delay}ms (attempt ${times})`);
    return delay;
  },
  connectTimeout: 10000,
  lazyConnect: true, // Don't connect immediately
});

connection.on("error", (err) => {
  console.error("Redis connection error:", err.message);
});

connection.on("connect", () => {
  console.log("Redis connected successfully");
});

// Attempt to connect
connection.connect().catch((err) => {
  console.error("Failed to connect to Redis:", err.message);
  console.log(
    "Redis is optional. Server will continue without queue functionality."
  );
});

export const readmeQueue = new Queue("readme-generation", {
  connection,
});

new Worker(
  "readme-generation",
  async (job) => {
    console.log("Processing job:", job.data);
    // README pipeline here
  },
  { connection }
);
