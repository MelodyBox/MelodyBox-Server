import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

// load env
dotenv.config({ path: path.resolve(process.cwd(), "src", ".env") });

const server = z.object({
  GENIUS_SECRET: z.string(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

// parse env
const parsed = server.safeParse(process.env);
if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
