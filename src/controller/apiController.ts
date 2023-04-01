import { Response } from "express";
import { ApiRequest } from "../routers/api";
import { InfoData, SearchData, SongData } from "./validationController";
import { ErrorRes, SuccessRes } from "../utils/responseTypes";

import YTMusicClient from "../utils/YTMusicClient";
const ytm = new YTMusicClient();

import { env } from "../env";
import Genius from "genius-lyrics";
const GeniusClient = new Genius.Client(env.GENIUS_SECRET);

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

export async function getInfo(req: ApiRequest<InfoData>, res: Response) {
  if (req["apiResult"] === undefined) {
    return ErrorRes(res, { message: "Request couldn't be verified" });
  }
  if (!req["apiResult"].success) {
    return ErrorRes(res, { message: req["apiResult"].error });
  }
  const result = await fetchInfo(req["apiResult"].data.songID);
  if (!result.success) {
    return ErrorRes(res, { code: 500, message: "Failed to get info" });
  }
  return SuccessRes(res, { data: result.data });
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

async function fetchInfo(songId: string) {
  const results = await ytm.getSong(songId).catch((err) => {
    console.log(err);
    return { failed: true, msg: err.message };
  });
  if ("failed" in results) {
    return { success: false, error: results.msg };
  }
  return {
    success: true,
    data: {
      videoId: results.videoDetails.videoId,
      title: results.videoDetails.title,
      author: results.videoDetails.author,
      durationInSeconds: results.videoDetails.lengthSeconds,
      thumbnail: results.videoDetails.thumbnail.thumbnails.reduce((acc, val) => (val.width > acc.width ? val : acc))
        .url,
    },
  };
}

type LyricsProvider = SongData["provider"];
type LyricsResult = {
  [Provider in LyricsProvider]: {
    lyrics: string;
    source: Provider;
  };
}[LyricsProvider];

async function fetchLyrics(songId: string, provider: LyricsProvider): Promise<LyricsResult> {
  try {
    if (provider === "youtube") {
      const playlist = await ytm.getWatchPlaylist(songId);
      const lyrics = await ytm.getLyrics(playlist.lyrics);
      return { lyrics: lyrics.lyrics, source: provider };
    } else {
      const { title } = (await ytm.getSong(songId)).videoDetails;
      const [song] = await GeniusClient.songs.search(title);
      const lyrics = await song.lyrics();
      const text = lyrics.replaceAll(/\[.+\]\n/g, "");
      return { lyrics: text, source: provider };
    }
  } catch (err) {
    console.error(err);
    throw new Error(`Failed to fetch lyrics from '${provider}'`);
  }
}
