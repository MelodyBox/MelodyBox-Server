import { Response } from "express";
import { ApiRequest } from "../routers/api";
import { SearchData, SongData } from "./validationController";
import { ErrorRes, SuccessRes } from "../utils/responseTypes";

import YTMusicClient from "../utils/YTMusicClient";
const ytm = new YTMusicClient();

import type { SongResult, VideoResult, ArtistResult } from "../utils/YTMusicClient/mixins/search";
type SearchResult = SongResult | VideoResult | ArtistResult;

export async function searchSong(req: ApiRequest<SearchData>, res: Response) {
  if (req["apiResult"] === undefined) {
    return ErrorRes(res, { message: "Request couldn't be verified" });
  }
  if (!req["apiResult"].success) {
    return ErrorRes(res, { message: req["apiResult"].error });
  }
  // Search for songs
  const { q, filter } = req["apiResult"].data;
  const results = (await ytm.search({ query: q, filter }).catch((err) => {
    console.error(err);
    return { failed: true };
  })) as SearchResult[] | { failed: true };
  // Handle error from YTM
  if ("failed" in results) {
    return ErrorRes(res, { code: 500, message: "Failed to get results" });
  }
  // Filter the results before sending to client
  const filteredResults = results.map((resultInfo) => {
    if (resultInfo.resultType === "song" || resultInfo.resultType === "video") {
      return {
        videoId: resultInfo.videoId,
        title: resultInfo.title,
        duration: resultInfo.duration,
        artists: resultInfo.artists.map((artist) => artist.name),
        thumbnail: resultInfo.thumbnails.reduce((acc, val) => (val.width > acc.width ? val : acc)).url,
      };
    } else {
      return {
        browseId: resultInfo.browseId,
        artist: resultInfo.artist,
        thumbnail: resultInfo.thumbnails.reduce((acc, val) => (val.width > acc.width ? val : acc)).url,
      };
    }
  });
  return SuccessRes(res, { data: filteredResults });
}

export function getLyrics(req: ApiRequest<SongData>, res: Response) {
  if (req["apiResult"] === undefined) {
    return ErrorRes(res, { message: "Request couldn't be verified" });
  }
  if (!req["apiResult"].success) {
    return ErrorRes(res, { message: req["apiResult"].error });
  }
  const { data } = req["apiResult"];
  return SuccessRes(res, { data });
}

export function downloadSong(req: ApiRequest<SongData>, res: Response) {
  if (req["apiResult"] === undefined) {
    return ErrorRes(res, { message: "Request couldn't be verified" });
  }
  if (!req["apiResult"].success) {
    return ErrorRes(res, { message: req["apiResult"].error });
  }
  const { data } = req["apiResult"];
  return SuccessRes(res, { data });
}
