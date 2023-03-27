// import express from "express";
// const app = express();
// const PORT = process.env.PORT || 5173;

// import apiRouter from "./routers/api";
// app.use("/", apiRouter);

// app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}/`));

// export const expressApp = app;

import { YTMusicClient } from "./utils/YTMusicClient";
const ytm = new YTMusicClient();

async function main() {
  try {
    const results = await ytm.search({
      query: "Never Gonna Give You Up",
      scope: "uploads",
      filter: "songs",
    });
    console.log("Result:", results);
  } catch (e) {
    console.log((e as Error).message);
  }
}

main();
