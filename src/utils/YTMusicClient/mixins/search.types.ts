import { z } from "zod";

export const filters = z.enum([
  "albums",
  "artists",
  "playlists",
  "community_playlists",
  "featured_playlists",
  "songs",
  "videos",
]);
export type Filter = z.infer<typeof filters>;

export const scopes = z.enum(["library", "uploads"]);
export type Scope = z.infer<typeof scopes>;
