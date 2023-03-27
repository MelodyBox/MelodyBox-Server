import { z } from "zod";
import { Artists, Thumbs, Album } from "./common";

const WatchResult = z.object({
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
  lyrics: z.string(),
  related: z.string(),
});
type WatchResult = z.infer<typeof WatchResult>;

import { _YTMusic } from "../YTMusic";
import { GConstructor, Mixin } from "./mixin.helper";

export type WatchMixin = Mixin<typeof WatchMixin>;

export function WatchMixin<TBase extends GConstructor<_YTMusic>>(Base: TBase) {
  return class Search extends Base {
    async getWatchPlaylist(videoId: string): Promise<WatchResult> {
      return new Promise((resolve, reject) => {
        const pythonResult = this.pythonCall("get_watch_playlist", videoId);
        if (!pythonResult.success) {
          reject(new Error(pythonResult.error));
          return;
        }
        const safeResult = WatchResult.safeParse(pythonResult.data);
        if (!safeResult.success) {
          reject(new Error("Response data couldn't be verified"));
          return;
        }
        resolve(safeResult.data);
      });
    }
  };
}
