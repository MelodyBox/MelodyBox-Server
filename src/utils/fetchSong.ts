import fs from "fs";
import path from "path";
import fsp from "fs/promises";
import cp from "child_process";

import ytdl from "ytdl-core";
import ffmpeg from "ffmpeg-static";
// @ts-expect-error no type declaration
import shell from "any-shell-escape";
import https from "https";

import { InfoResult } from "../controller/apiController";

async function asyncYTDL(filePath: string, link: string, options?: ytdl.downloadOptions) {
  if (!ffmpeg) {
    throw new Error("Failed to resolve ffmpeg binary");
  }
  const webmPath = filePath.replace(".mp3", ".webm");
  return new Promise((resolve, reject) => {
    const stream = ytdl(link, options);
    stream.pipe(fs.createWriteStream(webmPath));
    stream.on("error", async (err) => {
      await fsp.unlink(webmPath);
      reject(`Error while downloading song:\n${err.message}`);
    });
    stream.on("end", () => resolve(filePath));
  });
}

async function fetchThumbnail(thumbPath: string, url: string) {
  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(thumbPath);
    https
      .get(url, (res) => {
        res.pipe(stream);
        stream.on("finish", () => {
          stream.close();
          resolve(thumbPath);
        });
      })
      .on("error", async (err) => {
        await fsp.unlink(thumbPath);
        reject(`Error while downloading song:\n${err.message}`);
      });
  });
}

async function convertToMp3(filePath: string, cover: string, meta: InfoResult, lyrics: string) {
  const inputFile = filePath.replace(".mp3", ".webm");
  const outputFile = filePath;
  return new Promise((resolve) => {
    // Reference: https://github.com/joshunrau/ytdl-mp3/blob/4970d70b9b030df73bd796765c180b99ca7b032d/src/convertVideoToAudio.ts#L15
    /*
      Input:
      -i inputFile  : set input file to inputFile.
      -i cover      : set conver art as stream 1.

      Convert arguments:
      -y            : set overwrite output file.
      -loglevel 24  : set logging level.
      -sn           : disable subtitle recording.
      -c:a mp3      : sets audio codec to mp3.
      -ab 192k      : sets audio bitrate to 192K.

      ID3v2 Tag arguments:
      -metadata title   : sets the title.
      -metadata artist  : sets the artist.
      -metadata album   : sets the album.
      -metadata lyrics  : sets the lyrics.
      -metadata comment : sets the comment.
      -map 0            : map streams of the 0th (first) input to the output.
      -map 1:0          : map 0th stream (image data) of the 1th (second) input (cover) to the output.
      -write_id3v2 1    : write the tags as ID3v2.

      Output:
      outputFile    : sets output file to outputFile.
    */
    cp.execSync(
      shell([
        ffmpeg,
        "-y",
        "-i",
        inputFile,
        "-i",
        cover,
        "-loglevel",
        "24",
        "-sn",
        "-c:a",
        "mp3",
        "-ab",
        "192k",
        "-map",
        "0",
        "-map",
        "1:0",
        "-metadata",
        `title=${meta.title}`,
        "-metadata",
        `artist=${meta.artist}`,
        "-metadata",
        `album=${meta.album}`,
        "-metadata",
        `lyrics=${lyrics}`,
        "-metadata",
        `comment=Downloaded from: https://music.youtube.com/watch?v=${meta.videoId}`,
        "-write_id3v2",
        "1",
        outputFile,
      ])
    );
    resolve(outputFile);
  });
}

export async function fetchSong(meta: InfoResult, lyrics: string) {
  // regex changed to make Windows Safe Filename.
  console.log({ meta, lyrics });
  const safeTitle = meta.title.replaceAll(/[/<>:"\\|?*\s]/gi, "_");
  const filePath = path.resolve(__dirname, "..", "..", "downloads", `${safeTitle}.mp3`);
  const thumbPath = filePath.replace(".mp3", "_thumb.jpg");
  const url = `https://www.youtube.com/watch?v=${meta.videoId}`;
  await Promise.allSettled([fsp.unlink(filePath), fsp.unlink(thumbPath)]);
  await fetchThumbnail(thumbPath, meta.thumbnail);
  await Promise.allSettled([
    asyncYTDL(filePath, url, { filter: "audioonly", quality: "highestaudio" }),
    fetchThumbnail(thumbPath, meta.thumbnail),
  ]);
  await convertToMp3(filePath, thumbPath, meta, lyrics);
  await fsp.rm(filePath.replace(".mp3", ".webm"));
  await fsp.rm(thumbPath);
  return filePath;
}
