import type { Filter, Scope } from "../mixins/search.types";

type Param2Filters = Exclude<Filter, "featured_playlists" | "community_playlists">;
type Param2 = "I" | "Q" | "Y" | "g" | "o";
function _get_param2(filter: Param2Filters): Param2 {
  const filter_params: Record<Param2Filters, Param2> = {
    songs: "I",
    videos: "Q",
    albums: "Y",
    artists: "g",
    playlists: "o",
  };
  return filter_params[filter];
}

export function getSearchParams(filter: Filter | undefined, scope: Scope | undefined, ignore_spelling: boolean) {
  const FILTERED_PARAM1 = "EgWKAQI";
  let params: string | undefined;
  let param1 = "",
    param2 = "",
    param3 = "";

  if (!filter && !scope && !ignore_spelling) return params;

  if (scope === "uploads") {
    params = "agIYAw%3D%3D";
  }

  // you can't search for featured_playlists or community_playlists in your library
  if (scope === "library") {
    if (filter) {
      param1 = FILTERED_PARAM1;
      param2 = _get_param2(filter as Param2Filters);
      param3 = "AWoKEAUQCRADEAoYBA%3D%3D";
    } else {
      params = "agIYBA%3D%3D";
    }
  }

  if (!scope && filter) {
    if (filter === "playlists") {
      params = "Eg-KAQwIABAAGAAgACgB";
      params += !ignore_spelling ? "MABqChAEEAMQCRAFEAo%3D" : "MABCAggBagoQBBADEAkQBRAK";
      // if featured_playlists or community_playlists
    } else if (filter.includes("playlists")) {
      param1 = "EgeKAQQoA";
      param2 = filter === "featured_playlists" ? "Dg" : "EA"; // community_playlists
      param3 = !ignore_spelling ? "BagwQDhAKEAMQBBAJEAU%3D" : "BQgIIAWoMEA4QChADEAQQCRAF";
    } else {
      param1 = FILTERED_PARAM1;
      param2 = _get_param2(filter as Param2Filters);
      param3 = !ignore_spelling ? "AWoMEA4QChADEAQQCRAF" : "AUICCAFqDBAOEAoQAxAEEAkQBQ%3D%3D";
    }
  }

  if (!scope && !filter && ignore_spelling) {
    params = "EhGKAQ4IARABGAEgASgAOAFAAUICCAE%3D";
  }

  return params ? params : param1 + param2 + param3;
}
