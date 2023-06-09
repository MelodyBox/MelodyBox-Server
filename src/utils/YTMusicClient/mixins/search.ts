import { z } from "zod";
import { Artists, Thumbs } from "./common";

export const Filter = z.enum([
  "songs",
  "videos",
  "albums",
  "artists",
  "playlists",
  "community_playlists",
  "featured_playlists",
  // needs auth:
  //   "uploads",
]);
export type Filter = z.infer<typeof Filter>;

export const Scope = z.enum(["library", "uploads"]);
export type Scope = z.infer<typeof Scope>;

export const SearchOptions = z.object({
  query: z.string().min(1),
  filter: Filter.optional(),
  scope: Scope.optional(),
  limit: z.number().default(20),
  ignore_spelling: z.boolean().default(false),
});
export type SearchOptions = z.infer<typeof SearchOptions>;
export const SearchParams = SearchOptions.partial().required({ query: true });
export type SearchParams = z.infer<typeof SearchParams>;

const SongResult = z.object({
  category: z.literal("Songs"),
  resultType: z.literal("song"),
  title: z.string(),
  album: z.object({ name: z.string(), id: z.string() }).optional(),
  videoId: z.string(),
  videoType: z.string(),
  duration: z.string(),
  artists: Artists,
  duration_seconds: z.number(),
  isExplicit: z.boolean(),
  thumbnails: Thumbs,
});
export type SongResult = z.infer<typeof SongResult>;

const VideoResult = z.object({
  category: z.literal("Videos"),
  resultType: z.literal("video"),
  title: z.string(),
  videoType: z.string(),
  videoId: z.string(),
  duration: z.string().default(":-1"),
  artists: Artists,
  duration_seconds: z.number().default(-1),
  thumbnails: Thumbs,
});
export type VideoResult = z.infer<typeof VideoResult>;

const AlbumResult = z.object({
  category: z.literal("Albums"),
  resultType: z.literal("album"),
  title: z.string(),
  type: z.string(),
  year: z.string(),
  artists: Artists,
  browseId: z.string(),
  isExplicit: z.boolean(),
  thumbnails: Thumbs,
});
type AlbumResult = z.infer<typeof AlbumResult>;

const ArtistResult = z.object({
  category: z.literal("Artists"),
  resultType: z.literal("artist"),
  artist: z.string(),
  shuffleId: z.string(),
  radioId: z.string(),
  browseId: z.string(),
  thumbnails: Thumbs,
});
export type ArtistResult = z.infer<typeof ArtistResult>;

const PlaylistResult = z.object({
  resultType: z.literal("playlist"),
  title: z.string(),
  itemCount: z.string(),
  author: z.string(),
  browseId: z.string(),
  thumbnails: Thumbs,
});
type PlaylistResult = z.infer<typeof PlaylistResult>;

const CommunityPlaylistResult = PlaylistResult.extend({
  category: z.literal("Community playlists"),
});
type CommunityPlaylistResult = z.infer<typeof CommunityPlaylistResult>;

const FeaturedPlaylistResult = PlaylistResult.extend({
  category: z.literal("Featured playlists"),
});
type FeaturedPlaylistResult = z.infer<typeof FeaturedPlaylistResult>;

// export const SearchResult = z.object({});
export const SearchResult = z.union([
  SongResult,
  VideoResult,
  AlbumResult,
  ArtistResult,
  PlaylistResult,
  CommunityPlaylistResult,
  FeaturedPlaylistResult,
]);
export type SearchResult = z.infer<typeof SearchResult>;

import { _YTMusic } from "../YTMusic";
import { GConstructor, Mixin } from "./mixin.helper";

export type SearchMixin = Mixin<typeof SearchMixin>;

export function SearchMixin<TBase extends GConstructor<_YTMusic>>(Base: TBase) {
  return class Search extends Base {
    async search(options: SearchParams): Promise<SearchResult[]> {
      return new Promise((resolve, reject) => {
        const safeOptions = SearchOptions.safeParse(options);
        if (!safeOptions.success) {
          reject(new Error("Options passed were not valid options"));
          return;
        }
        const pythonResult = this.pythonCall(
          "search",
          safeOptions.data.query,
          safeOptions.data.filter,
          safeOptions.data.scope,
          safeOptions.data.limit,
          safeOptions.data.ignore_spelling
        );
        if (!pythonResult.success) {
          reject(new Error(pythonResult.error));
          return;
        }
        const safeResult = z.array(SearchResult).safeParse(pythonResult.data);
        if (!safeResult.success) {
          reject(new Error("Response data couldn't be verified"));
          return;
        }
        resolve(safeResult.data);
      });
    }
  };
}
