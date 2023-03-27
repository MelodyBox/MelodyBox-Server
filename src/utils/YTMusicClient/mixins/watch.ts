import { _YTMusic } from "../YTMusic";
import { GConstructor, Mixin } from "./mixin.helper";

export type WatchMixin = Mixin<typeof WatchMixin>;

export function WatchMixin<TBase extends GConstructor<_YTMusic>>(Base: TBase) {
  return class Search extends Base {
    async getWatchPlaylist() {}
  };
}
