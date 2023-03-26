// Test taken from https://github.com/sigma67/ytmusicapi/blob/master/tests/test.py
import { describe, expect, test } from "@jest/globals";
import { YTMusicClient } from "../src/utils/YTMusicClient";

const ytm = new YTMusicClient();
const SAMPLE_ALBUM = "MPREb_4pL8gzRtw1p"; // Eminem - Revival
const SAMPLE_VIDEO = "hpSrLjc5SMs"; // Oasis - Wonderwall
const SAMPLE_PLAYLIST = "PL6bPxvf5dW5clc3y9wAoslzqUrmkZ5c-u"; // very large playlist

describe("Youtube Music Client Tests", () => {
  /*************
   * * BROWSING
   * ***********
   */

  test("Search", async () => {
    expect.assertions(14);
    let results;

    const query = "edm playlist";
    await expect(ytm.search({ query, filter: "song" })).rejects.toMatch("error");
    await expect(ytm.search({ query, scope: "upload" })).rejects.toMatch("error");

    results = await ytm.search("l1qwkfkah2l1qwkfkah2");
    expect(results.length).toBeLessThanOrEqual(2);

    const queries = ["taylor swift", "taylor swift blank space", "taylor swift fearless"];
    queries.forEach(async (q) => {
      const results = await ytm.search({ query: q });
      expect(results.length).toBeGreaterThan(10);
    });

    results = await ytm.search({
      query: "Martin Stig Andersen - Deteriation",
      ignore_spelling: true,
    });
    expect(results.length).toBeGreaterThan(0);

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

  test("Search Uploads", async () => {
    expect.assertions(2);
    await expect(
      ytm.search({
        query: "audiomachine",
        filter: "songs",
        scope: "uploads",
        limit: 40,
      })
    ).rejects.toMatch("error");

    const results = await ytm.search({ query: "audiomachine", scope: "uploads", limit: 40 });
    expect(results.length).toBeGreaterThan(20);
  });

  test("Search Library", async () => {
    expect.assertions(5);
    let results;
    results = await ytm.search({ query: "garrix", scope: "library" });
    expect(results.length).toBeGreaterThan(5);

    results = await ytm.search({
      query: "bergersen",
      filter: "songs",
      scope: "library",
      limit: 40,
    });
    expect(results.length).toBeGreaterThan(10);

    results = await ytm.search({
      query: "garrix",
      filter: "albums",
      scope: "library",
      limit: 40,
    });
    expect(results.length).toBeGreaterThanOrEqual(4);

    results = await ytm.search({
      query: "garrix",
      filter: "artists",
      scope: "library",
      limit: 40,
    });
    expect(results.length).toBeGreaterThanOrEqual(1);

    results = await ytm.search({
      query: "garrix",
      filter: "playlists",
      scope: "library",
    });
    expect(results.length).toBeGreaterThanOrEqual(1);
  });

  test("Get Artist", async () => {
    expect.assertions(2);
    let results;
    results = await ytm.getArtist("MPLAUCmMUZbaYdNH0bEd1PAlAqsA");
    expect(results.length).toBe(14);

    // test correctness of related artists
    const arrayEq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const related = results["related"]["results"];
    const t = related.filter((x) => arrayEq(Object.keys(x), ["browseId", "subscribers", "title", "thumbnails"]));
    expect(t.length).toBe(related.length);

    // no album year
    results = await ytm.getArtist("UCLZ7tlKC06ResyDmEStSrOw");
    expect(results.length).toBeGreaterThanOrEqual(11);
  });

  test("Get Artist Albums", async () => {
    expect.assertions(1);
    const artist = await ytm.getArtist("UCAeLFBCQS7FvI8PvBrWvSBg");
    const results = await ytm.getArtistAlbums(artist["albums"]["browseId"], artist["albums"]["params"]);
    expect(results.length).toBeGreaterThan(0);
  });

  test("Get Artist Singles", async () => {
    expect.assertions(1);
    const artist = await ytm.getArtist("UCAeLFBCQS7FvI8PvBrWvSBg");
    const results = await ytm.getArtistAlbums(artist["singles"]["browseId"], artist["singles"]["params"]);
    expect(results.length).toBeGreaterThan(0);
  });

  test("Get User", async () => {
    expect.assertions(1);
    const results = await ytm.getUser("UC44hbeRoCZVVMVg5z0FfIww");
    expect(results.length).toBe(3);
  });

  test("Get User Playlists", async () => {
    expect.assertions(1);
    let results;
    results = await ytm.getUser("UCPVhZsC2od1xjGhgEc2NEPQ");
    results = await ytm.getUserPlaylists("UCPVhZsC2od1xjGhgEc2NEPQ", results["playlists"]["params"]);
    expect(results.length).toBeGreaterThan(100);
  });

  test("Get Album BrowseId", async () => {
    expect.assertions(1);
    const browse_id = await ytm.getAlbumBrowseId("OLAK5uy_nMr9h2VlS-2PULNz3M3XVXQj_P3C2bqaY");
    expect(browse_id).toBe(SAMPLE_ALBUM);
  });

  test("Get Album", async () => {
    expect.assertions(5);
    let results;
    results = await ytm.getAlbum(SAMPLE_ALBUM);
    expect(results.length).toBeGreaterThanOrEqual(9);
    expect(results["tracks"][0]["isExplicit"]).toBeTruthy();
    expect(results["tracks"][0]).toHaveProperty("feedbackTokens");
    expect(results["other_versions"]).toHaveLength(2);
    results = await ytm.getAlbum("MPREb_BQZvl3BFGay");
    expect(results["tracks"]).toHaveLength(7);
  });

  test("Get Song", async () => {
    expect.assertions(1);
    // Private Song Check not implemented
    const song = await ytm.getSong(SAMPLE_VIDEO);
    expect(song["streamingData"]["adaptiveFormats"].length).toBeGreaterThanOrEqual(10);
  });

  test("Get Lyrics", async () => {
    expect.assertions(2);
    const playlist = await ytm.getWatchPlaylist(SAMPLE_VIDEO);
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
    const playlist = await ytm.getWatchPlaylist("OLAK5uy_lKgoGvlrWhX0EIPavQUXxyPed8Cj38AWc", true);
    expect(playlist["tracks"]).toHaveLength(12);
  });
});
