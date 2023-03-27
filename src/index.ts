// import express from "express";
// const app = express();
// const PORT = process.env.PORT || 5173;

// import apiRouter from "./routers/api";
// app.use("/", apiRouter);

// app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}/`));

// export const expressApp = app;

import YTMusicClient from "./utils/YTMusicClient";
const ytm = new YTMusicClient();

async function main() {
  try {
    const res = await ytm.getWatchPlaylist("HoBGWhapaho");
    console.log("res", res.tracks.length);
  } catch {
    console.log("err");
  }
}

main();
