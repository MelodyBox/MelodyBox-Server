import { WatchResult } from "../parsers/watch";

import { _YTMusic } from "../YTMusic";
import { GConstructor, Mixin } from "./mixin.helper";

export type WatchMixin = Mixin<typeof WatchMixin>;

export function WatchMixin<TBase extends GConstructor<_YTMusic>>(Base: TBase) {
  return class Watch extends Base {
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
