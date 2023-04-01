import fs from "fs";
import path from "path";
import fsp from "fs/promises";
import cp from "child_process";

import ytdl from "ytdl-core";
import ffmpeg from "ffmpeg-static";
import NodeID3Tag from "@mrpancakes39/node-id3tag";
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
      reject(`Error while downloading song: ${err.message}`);
    });
    stream.on("end", async () => {
      // original: https://github.com/joshunrau/ytdl-mp3/blob/4970d70b9b030df73bd796765c180b99ca7b032d/src/convertVideoToAudio.ts#L15
      cp.execSync(`${ffmpeg} -y -loglevel 24 -i ${webmPath} -vn -sn -c:a mp3 -ab 192k ${filePath}`);
      await fsp.rm(webmPath);
      resolve(filePath);
    });
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
      .on("error", (err) => {
        fs.unlink(thumbPath, () => {
          reject(`Error while downloading song: ${err.message}`);
        });
      });
  });
}

export async function fetchSong(meta: InfoResult, lyrics: string) {
  const safeTitle = meta.title.replaceAll(/[^a-z0-9]/gi, "_");
  const filePath = path.resolve(__dirname, "..", "..", "downloads", `${safeTitle}.mp3`);
  const thumbPath = filePath.replace(".mp3", "_thumb.jpg");
  const url = `https://www.youtube.com/watch?v=${meta.videoId}`;
  await Promise.allSettled([fsp.unlink(filePath), fsp.unlink(thumbPath)]);
  await Promise.all([
    asyncYTDL(filePath, url, { filter: "audioonly", quality: "highestaudio" }),
    fetchThumbnail(thumbPath, meta.thumbnail),
  ]);
  const success = NodeID3Tag.write(
    {
      title: meta.title,
      artist: meta.artist,
      album: meta.album,
      USLT: lyrics,
      APIC: thumbPath,
      comment: {
        language: "eng",
        text: `Downloaded from: https://music.youtube.com/watch?v=${meta.videoId}`,
      },
    },
    filePath
  );
  if (!success) {
    await fsp.unlink(filePath);
    await fsp.unlink(thumbPath);
    throw new Error("Couldn't write tags to song");
  }
  await fsp.unlink(thumbPath);
  return filePath;
}
