// import express from "express";
// const app = express();
// const PORT = process.env.PORT || 5173;

// import apiRouter from "./routers/api";
// app.use("/", apiRouter);

// app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}/`));

import YTMusicClient from "./utils/YTMusicClient/index";
// import YTMusic from "@codyduong/ytmusicapi";
const ytm = new YTMusicClient();
// const ytm2 = new YTMusic();
void ytm;
// void ytm2;

async function main() {
  //   await ytm.search("act like a they/them");
  //   await ytm2.search("act like a they/them", {
  //     filter: "songs",
  //   });
}

main();

// export const expressApp = app;
