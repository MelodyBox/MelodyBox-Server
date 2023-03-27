import { z } from "zod";

export const Artists = z.array(z.object({ name: z.string().optional(), id: z.string().optional() }));
export const Thumbs = z.array(z.object({ url: z.string(), width: z.number(), height: z.number() }));
export const Album = z.object({ name: z.string().optional(), id: z.string().optional() });
