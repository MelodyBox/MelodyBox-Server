import { SearchOptions, SearchResultArray } from "../parsers/search";
import type { SearchParams, SearchResult } from "../parsers/search";

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
        const safeResult = SearchResultArray.safeParse(pythonResult.data);
        if (!safeResult.success) {
          reject(new Error("Response data couldn't be verified"));
          return;
        }
        resolve(safeResult.data);
      });
    }
  };
}
