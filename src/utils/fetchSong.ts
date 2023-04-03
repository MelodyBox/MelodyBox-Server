import fs from "fs";
import path from "path";
import fsp from "fs/promises";
import cp from "child_process";

import ytdl from "ytdl-core";
import ffmpeg from "ffmpeg-static";
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

type MP3Options = {
  filePath: string;
};
async function convertToMp3(options: MP3Options) {
  const inputFile = options.filePath.replace(".mp3", ".webm");
  const outputFile = options.filePath;
  return new Promise((resolve) => {
    // original: https://github.com/joshunrau/ytdl-mp3/blob/4970d70b9b030df73bd796765c180b99ca7b032d/src/convertVideoToAudio.ts#L15
    cp.execSync(`${ffmpeg} -y -loglevel 24 -i ${inputFile} -vn -sn -c:a mp3 -ab 192k ${outputFile}`);
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
  await asyncYTDL(filePath, url, { filter: "audioonly", quality: "highestaudio" });
  await convertToMp3({ filePath });
  // await Promise.all([
  //   asyncYTDL(filePath, url, { filter: "audioonly", quality: "highestaudio" }),
  //   fetchThumbnail(thumbPath, meta.thumbnail),
  // ]);
  // const success = NodeID3Tag.write(
  //   {
  //     title: meta.title,
  //     artist: meta.artist,
  //     album: meta.album,
  //     APIC: thumbPath,
  //     comment: {
  //       language: "eng",
  //       text: `Downloaded from: https://music.youtube.com/watch?v=${meta.videoId}`,
  //     },
  //   },
  //   filePath
  // );
  // if (!success) {
  //   await fsp.unlink(filePath);
  //   await fsp.unlink(thumbPath);
  //   throw new Error("Couldn't write tags to song");
  // }
  // await fsp.unlink(thumbPath);
  return filePath;
}
