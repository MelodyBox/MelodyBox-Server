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

});
