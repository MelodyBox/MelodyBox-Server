import { LyricsResult, ArtistResult, SongInfo } from "../parsers/browse";

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
