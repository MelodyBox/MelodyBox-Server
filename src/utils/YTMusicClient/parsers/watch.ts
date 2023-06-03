import { z } from "zod";
import { Artists, Thumbs, Album } from "./common";

export const WatchResult = z.object({
  tracks: z.array(
    z.object({
      videoId: z.string(),
      title: z.string(),
      length: z.string(),
      thumbnail: Thumbs,
      videoType: z.string(),
      artists: Artists,
      album: Album,
      year: z.string(),
    })
  ),
  playlistId: z.string(),
  lyrics: z.string().default(""),
  related: z.string(),
});
export type WatchResult = z.infer<typeof WatchResult>;
