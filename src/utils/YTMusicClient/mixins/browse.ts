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

const SongFormat = z.object({
  itag: z.number(),
  mimeType: z.string(),
  bitrate: z.number(),
  width: z.number(),
  height: z.number(),
  lastModified: z.string(),
  quality: z.string(),
  fps: z.number(),
  qualityLabel: z.string(),
  projectionType: z.string(),
  audioQuality: z.string(),
  approxDurationMs: z.string(),
  audioSampleRate: z.string(),
  audioChannels: z.number(),
  signatureCipher: z.string(),
});

const SongAdaptiveFormat = SongFormat.omit({
  audioQuality: true,
  audioSampleRate: true,
  audioChannels: true,
})
  .partial()
  .extend({
    initRange: z.object({ start: z.string(), end: z.string() }),
    indexRange: z.object({ start: z.string(), end: z.string() }),
    contentLength: z.string(),
    averageBitrate: z.number(),
    colorInfo: z
      .object({
        primaries: z.string(),
        transferCharacteristics: z.string(),
        matrixCoefficients: z.string(),
      })
      .optional(),
  });

const VideoDetails = z.object({
  videoId: z.string(),
  title: z.string(),
  lengthSeconds: z.string(),
  channelId: z.string(),
  isOwnerViewing: z.boolean(),
  isCrawlable: z.boolean(),
  thumbnail: z.object({
    thumbnails: Thumbs,
  }),
  allowRatings: z.boolean(),
  viewCount: z.string(),
  author: z.string(),
  isPrivate: z.boolean(),
  isUnpluggedCorpus: z.boolean(),
  musicVideoType: z.string().optional(),
  isLiveContent: z.boolean(),
});

const MicroFormat = z.object({
  microformatDataRenderer: z.object({
    urlCanonical: z.string().url(),
    title: z.string(),
    description: z.string().optional(),
    thumbnail: z.object({
      thumbnails: Thumbs,
    }),
    familySafe: z.boolean(),
    // skipping bunch of keys
    pageOwnerDetails: z.object({
      name: z.string(),
      externalChannelId: z.string(),
      youtubeProfileUrl: z.string().url(),
    }),
    videoDetails: z.object({
      externalVideoId: z.string(),
      durationSeconds: z.string(),
      // skip durationIso8601
    }),
    // skipping bunch of keys
    category: z.string(),
  }),
});

const SongInfo = z.object({
  playabilityStatus: z.object({
    status: z.string(),
    playableInEmbed: z.boolean(),
    // emmited not-needed objects
  }),
  streamingData: z.object({
    expiresInSeconds: z.string(),
    formats: z.array(SongFormat),
    adaptiveFormats: z.array(SongAdaptiveFormat),
  }),
  // Don't care what is inside
  playbackTracking: z.object({}),
  videoDetails: VideoDetails,
  microformat: MicroFormat,
});
type SongInfo = z.infer<typeof SongInfo>;

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

    async getSong(videoId: string): Promise<SongInfo> {
      return new Promise((resolve, reject) => {
        const pythonResult = this.pythonCall("get_song", videoId);
        if (!pythonResult.success) {
          reject(new Error(pythonResult.error));
          return;
        }
        const safeResult = SongInfo.safeParse(pythonResult.data);
        if (!safeResult.success) {
          reject(new Error("Response data couldn't be verified"));
          return;
        }
        resolve(safeResult.data);
      });
    }
  };
}
