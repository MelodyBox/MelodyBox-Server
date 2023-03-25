import { getSearchParams } from "../parsers/search";
import { GConstructor, Mixin } from "./mixin.helper";
import { _YTMusicClient } from "../YTMusicClient";
import { filters, scopes, Filter, Scope } from "./search.types";

export type SearchMixin = Mixin<typeof SearchMixin>;

export function SearchMixin<TBase extends GConstructor<_YTMusicClient>>(Base: TBase) {
  return class Search extends Base {
    async search(query: string, filter?: Filter, scope?: Scope, limit: number = 20, ignore_spelling: boolean = false) {
      const body: Record<string, unknown> = { query };
      const endpoint = "search";
      // let searchResults = [];

      if (filter && !filters.safeParse(filter).success)
        throw new Error(
          "Invalid filter provided. Please use one of the following filters or leave out the parameter: " +
            filters.options.join(", ")
        );

      if (scope && !scopes.safeParse(scope).success)
        throw new Error(
          "Invalid scope provided. Please use one of the following scopes or leave out the parameter: " +
            scopes.options.join(", ")
        );

      if (scope === "uploads" && filter)
        throw new Error(
          "No filter can be set when searching uploads. Please unset the filter parameter when scope is set to uploads."
        );

      const params = getSearchParams(filter, scope, ignore_spelling);
      if (params) body["params"] = params;

      const response = await this._sendRequest(endpoint, body);
      void response;
      // if (!response.success) {
      //   return searchResults;
      // }
      void limit;
    }
  };
}
