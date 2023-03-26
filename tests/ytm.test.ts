// Test taken from https://github.com/sigma67/ytmusicapi/blob/master/tests/test.py
import { describe, expect, test } from "@jest/globals";
import { YTMusicClient } from "../src/utils/YTMusicClient";

const ytm = new YTMusicClient();

describe("Youtube Music Client Tests", () => {
  /*************
   * * BROWSING
   * ***********
   */

  test("Get Home", async () => {
    expect.assertions(2);
    let results;
    results = await ytm.getHome({ limit: 6 });
    expect(results.length).toBeGreaterThanOrEqual(6);

    results = await ytm.getHome({ limit: 15 });
    expect(results.length).toBeGreaterThanOrEqual(15);
  });

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
});
