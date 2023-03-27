// Test taken from https://github.com/sigma67/ytmusicapi/blob/master/tests/test.py
import { describe, expect, test } from "@jest/globals";
import YTMusicClient from "../src/utils/YTMusicClient";

const ytm = new YTMusicClient();
const SAMPLE_SONG = "u5uSlUKBEDc"; // TiK ToK - Ke$ha
// const SAMPLE_ALBUM = "MPREb_4pL8gzRtw1p"; // Eminem - Revival
// const SAMPLE_PLAYLIST = "PL6bPxvf5dW5clc3y9wAoslzqUrmkZ5c-u"; // very large playlist

describe("Youtube Music Client Tests", () => {
  /*************
   * * BROWSING
   * ***********
   */

  test("Search", async () => {
    expect.assertions(15);
    let results;

    const query = "edm playlist";
    await expect(ytm.search({ query, filter: "songs" })).resolves;
    await expect(ytm.search({ query, scope: "uploads" })).rejects.toThrowError(/unauthorized/i);

    results = await ytm.search({ query: "l1qwkfkah2l1qwkfkah2" });
    expect(results.length).toBeLessThanOrEqual(2);

    const queries = ["taylor swift", "taylor swift blank space", "taylor swift fearless"];
    queries.forEach(async (q) => {
      const results = await ytm.search({ query: q });
      expect(results.length).toBeGreaterThan(10);
    });

    await expect(
      ytm.search({
        query: "Martin Stig Andersen - Deteriation",
        ignore_spelling: true,
      })
    ).rejects.toThrowError(/verified/i);

    await expect(
      ytm.search({
        query: "Never Gonna Give You Up",
        scope: "uploads",
        filter: "songs",
      })
    ).rejects.toThrowError(/no filter/i);

    results = await ytm.search({ query, filter: "songs" });
    expect(results.length).toBeGreaterThan(10);

    results = await ytm.search({ query, filter: "videos" });
    expect(results.length).toBeGreaterThan(10);

    results = await ytm.search({ query, filter: "albums", limit: 40 });
    expect(results.length).toBeGreaterThan(20);

    results = await ytm.search({ query: "project-2", filter: "artists", ignore_spelling: true });
    expect(results.length).toBeGreaterThan(0);

    results = await ytm.search({ query: "classical music", filter: "playlists" });
    expect(results.length).toBeGreaterThan(5);

    results = await ytm.search({ query: "clasical music", filter: "playlists", ignore_spelling: true });
    expect(results.length).toBeGreaterThan(5);

    results = await ytm.search({ query: "clasic rock", filter: "community_playlists", ignore_spelling: true });
    expect(results.length).toBeGreaterThan(5);

    results = await ytm.search({ query: "hip hop", filter: "featured_playlists" });
    expect(results.length).toBeGreaterThan(5);
  });

  test("Get Artist", async () => {
    expect.assertions(3);
    let results;
    results = await ytm.getArtist("MPLAUCmMUZbaYdNH0bEd1PAlAqsA");
    expect(Object.keys(results)).toHaveLength(14);

    // test correctness of related artists
    const arrayEq = (a: unknown[], b: unknown[]) => JSON.stringify(a) === JSON.stringify(b);
    const related = results["related"]["results"];
    const t = related.filter((x) => !arrayEq(Object.keys(x), ["browseId", "subscribers", "title", "thumbnails"]));
    expect(t.length).toBe(related.length);

    // 2 albums
    results = await ytm.getArtist("UCCNjeM2kdvErAtTQ-va5q4g");
    expect(results["albums"]["results"].length).toBeGreaterThanOrEqual(2);
  });

  // test("Get Artist Albums", async () => {
  //   expect.assertions(1);
  //   const artist = await ytm.getArtist("UCAeLFBCQS7FvI8PvBrWvSBg");
  //   const results = await ytm.getArtistAlbums(artist["albums"]["browseId"], artist["albums"]["params"]);
  //   expect(results.length).toBeGreaterThan(0);
  // });

  // test("Get Artist Singles", async () => {
  //   expect.assertions(1);
  //   const artist = await ytm.getArtist("UCAeLFBCQS7FvI8PvBrWvSBg");
  //   const results = await ytm.getArtistAlbums(artist["singles"]["browseId"], artist["singles"]["params"]);
  //   expect(results.length).toBeGreaterThan(0);
  // });

  // test("Get User", async () => {
  //   expect.assertions(1);
  //   const results = await ytm.getUser("UC44hbeRoCZVVMVg5z0FfIww");
  //   expect(results.length).toBe(3);
  // });

  // test("Get User Playlists", async () => {
  //   expect.assertions(1);
  //   let results;
  //   results = await ytm.getUser("UCPVhZsC2od1xjGhgEc2NEPQ");
  //   results = await ytm.getUserPlaylists("UCPVhZsC2od1xjGhgEc2NEPQ", results["playlists"]["params"]);
  //   expect(results.length).toBeGreaterThan(100);
  // });

  // test("Get Album BrowseId", async () => {
  //   expect.assertions(1);
  //   const browse_id = await ytm.getAlbumBrowseId("OLAK5uy_nMr9h2VlS-2PULNz3M3XVXQj_P3C2bqaY");
  //   expect(browse_id).toBe(SAMPLE_ALBUM);
  // });

  // test("Get Album", async () => {
  //   expect.assertions(5);
  //   let results;
  //   results = await ytm.getAlbum(SAMPLE_ALBUM);
  //   expect(results.length).toBeGreaterThanOrEqual(9);
  //   expect(results["tracks"][0]["isExplicit"]).toBeTruthy();
  //   expect(results["tracks"][0]).toHaveProperty("feedbackTokens");
  //   expect(results["other_versions"]).toHaveLength(2);
  //   results = await ytm.getAlbum("MPREb_BQZvl3BFGay");
  //   expect(results["tracks"]).toHaveLength(7);
  // });

  // test("Get Song", async () => {
  //   expect.assertions(1);
  //   // Private Song Check not implemented
  //   const song = await ytm.getSong(SAMPLE_VIDEO);
  //   expect(song["streamingData"]["adaptiveFormats"].length).toBeGreaterThanOrEqual(10);
  // });

  test("Get Lyrics", async () => {
    expect.assertions(2);
    const playlist = await ytm.getWatchPlaylist(SAMPLE_SONG);
    const lyricsSong = await ytm.getLyrics(playlist["lyrics"]);
    expect(lyricsSong["lyrics"]).toBeDefined();
    expect(lyricsSong["source"]).toBeDefined();
    // Private Song Check not implemented
  });

  /*************
   * * WATCH
   * ***********
   */

  test("Get Watch Playlist", async () => {
    expect.assertions(1);
    const playlist = await ytm.getWatchPlaylist(SAMPLE_SONG);
    expect(playlist["tracks"]).toHaveLength(25);
  });
});
