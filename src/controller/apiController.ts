import { Response } from "express";
import { ApiRequest } from "../routers/api";
import { InfoData, SearchData, SongData } from "./validationController";
import { ErrorRes, SuccessRes } from "../utils/responseTypes";

import YTMusicClient from "../utils/YTMusicClient";
const ytm = new YTMusicClient();

import { env } from "../env";
import * as Genius from "genius-lyrics";
const GeniusClient = new Genius.Client(env.GENIUS_SECRET);

import { fetchSong } from "../utils/fetchSong";
import fsp from "fs/promises";

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

export async function getLyrics(req: ApiRequest<SongData>, res: Response) {
  if (req["apiResult"] === undefined) {
    return ErrorRes(res, { message: "Request couldn't be verified" });
  }
  if (!req["apiResult"].success) {
    return ErrorRes(res, { message: req["apiResult"].error });
  }
  const lyrics = await fetchLyrics(req["apiResult"].data.songID, req["apiResult"].data.provider);
  if (!lyrics.success) {
    return ErrorRes(res, { message: lyrics.error });
  }
  return SuccessRes(res, { data: lyrics.data });
}

export async function downloadSong(req: ApiRequest<SongData>, res: Response) {
  if (req["apiResult"] === undefined) {
    return ErrorRes(res, { message: "Request couldn't be verified" });
  }
  if (!req["apiResult"].success) {
    return ErrorRes(res, { message: req["apiResult"].error });
  }
  const { data } = req["apiResult"];
  try {
    const [info, lyrics] = await Promise.all([fetchInfo(data.songID), fetchLyrics(data.songID, data.provider)]);
    if (!info.success) {
      throw new Error(info.error);
    }
    const meta = info.data;
    const text = lyrics.success && lyrics.data.lyrics !== "This song is an instrumental" ? lyrics.data.lyrics : "";
    const filePath = await fetchSong(meta, text);
    res.download(filePath);
    await fsp.rm(filePath);
    return;
  } catch (err) {
    return ErrorRes(res, { message: (err as Error).message });
  }
}

export type InfoResult = {
  videoId: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  thumbnail: string;
};
type InfoSafeResult = { success: true; data: InfoResult } | { success: false; error: string };

async function fetchInfo(songId: string): Promise<InfoSafeResult> {
  const results = await ytm.getWatchPlaylist(songId).catch((err) => {
    console.log(err);
    return { failed: true, msg: err.message };
  });
  if ("failed" in results) {
    return { success: false, error: results.msg };
  }
  const song = results.tracks[0];
  return {
    success: true,
    data: {
      videoId: song.videoId,
      title: song.title,
      artist: song.artists.map((artist) => artist.name).join(", "),
      album: song.album.name || "",
      duration: song.length,
      thumbnail: song.thumbnail.reduce((acc, val) => (val.width > acc.width ? val : acc)).url,
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
type LyricsSafeResult = { success: true; data: LyricsResult } | { success: false; error: string };

async function fetchLyrics(songId: string, provider: LyricsProvider): Promise<LyricsSafeResult> {
  try {
    const playlist = await ytm.getWatchPlaylist(songId);
    // bad decision?
    if (playlist.lyrics === "") {
      return { success: true, data: { source: provider, lyrics: "This song is an instrumental" } };
    }
    if (provider === "youtube") {
      const lyrics = await ytm.getLyrics(playlist.lyrics);
      return { success: true, data: { lyrics: lyrics.lyrics, source: provider } };
    } else {
      const [song] = await GeniusClient.songs.search(playlist.tracks[0].title);
      const lyrics = await song.lyrics();
      const text = lyrics.replaceAll(/\[.+\]\n/g, ""); // removes stuff like [Chorus]
      return { success: true, data: { lyrics: text, source: provider } };
    }
  } catch (err) {
    console.error(err);
    return { success: false, error: `Failed to fetch lyrics from '${provider}'` };
  }
}
