import { z } from "zod";
import { Thumbs, Artists, Album } from "./common";

const LyricsResult = z.object({
  lyrics: z.string(),
  source: z.string(),
});
type LyricsResult = z.infer<typeof LyricsResult>;

// NOTE: All browseID are optional since they might fail to get

const ArtistSong = z.object({
  videoId: z.string(),
  title: z.string(),
  artists: Artists,
  album: Album,
  likeStatus: z.enum(["LIKE", "INDIFFERENT", "DISLIKE"]),
  thumbnails: Thumbs,
  isAvailable: z.boolean(),
  isExplicit: z.boolean(),
  videoType: z.string(),
});

const ArtistAlbum = z.object({
  title: z.string(),
  year: z.string(),
  browseId: z.string().optional(),
  thumbnails: Thumbs,
  isExplicit: z.boolean(),
});

const ArtistSingle = z.object({
  title: z.string(),
  year: z.string(),
  browseId: z.string().optional(),
  thumbnails: Thumbs,
});

const ArtistVideo = z.object({
  title: z.string(),
  videoId: z.string(),
  artists: Artists,
  playlistId: z.string(),
  thumbnails: Thumbs,
  views: z.string(),
});

const ArtistRelated = z.object({
  title: z.string(),
  browseId: z.string().optional(),
  subscribers: z.string(),
  thumbnails: Thumbs,
});

const ArtistResult = z.object({
  description: z.string().optional(),
  views: z.string().optional(),
  name: z.string(),
  channelId: z.string(),
  shuffleId: z.string().optional(),
  radioId: z.string().optional(),
  subscribers: z.string(),
  subscribed: z.boolean(),
  thumbnails: Thumbs,
  songs: z.object({
    browseId: z.string().optional(),
    results: z.array(ArtistSong),
  }),
  albums: z.object({
    browseId: z.string().optional(),
    results: z.array(ArtistAlbum),
    params: z.string().optional(),
  }),
  singles: z.object({
    browseId: z.string().optional(),
    results: z.array(ArtistSingle),
    params: z.string(),
  }),
  videos: z.object({
    browseId: z.string().optional(),
    results: z.array(ArtistVideo),
  }),
  related: z.object({
    browseId: z.string().optional(),
    results: z.array(ArtistRelated),
  }),
});
type ArtistResult = z.infer<typeof ArtistResult>;

import { _YTMusic } from "../YTMusic";
import { GConstructor, Mixin } from "./mixin.helper";

export type BrowseMixin = Mixin<typeof BrowseMixin>;

export function BrowseMixin<TBase extends GConstructor<_YTMusic>>(Base: TBase) {
  return class Browse extends Base {
    async getLyrics(browseId: string): Promise<LyricsResult> {
      return new Promise((resolve, reject) => {
        const pythonResult = this.pythonCall("get_lyrics", browseId);
        if (!pythonResult.success) {
          reject(new Error(pythonResult.error));
          return;
        }
        const safeResult = LyricsResult.safeParse(pythonResult.data);
        if (!safeResult.success) {
          reject(new Error("Response data couldn't be verified"));
          return;
        }
        resolve(safeResult.data);
      });
    }

    async getArtist(channelId: string): Promise<ArtistResult> {
      return new Promise((resolve, reject) => {
        const pythonResult = this.pythonCall("get_artist", channelId);
        if (!pythonResult.success) {
          reject(new Error(pythonResult.error));
          return;
        }
        const safeResult = ArtistResult.safeParse(pythonResult.data);
        if (!safeResult.success) {
          reject(new Error("Response data couldn't be verified"));
          return;
        }
        resolve(safeResult.data);
      });
    }
  };
}
