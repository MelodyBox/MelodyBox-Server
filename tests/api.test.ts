import request, { Response } from "supertest";
import { describe, expect, test } from "@jest/globals";

// PORT is fixed in index.ts
const BASE_URL = "http://localhost:5173";

describe("GET /search", () => {
  test("no q param", async () => {
    expect.assertions(3);
    let res: Response;
    // no params
    res = await request(BASE_URL).get("/search");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "'q' is the required search string");

    // just filter
    res = await request(BASE_URL).get("/search?filter=artists");
    expect(res.body).toHaveProperty("error", "'q' is the required search string");
  });

  test("wrong filter", async () => {
    expect.assertions(2);
    const res = await request(BASE_URL).get("/search?q=TikTok&filter=artist");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty(
      "error",
      "The filter value should be one of these 'songs', 'videos', 'artists' but received 'artist'"
    );
  });

  test("proper query", async () => {
    expect.assertions(2);
    const res = await request(BASE_URL).get("/search?q=Tik Tok&filter=songs");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
  });
});

describe("GET /info", () => {
  test("no songId provided", async () => {
    expect.assertions(1);
    const res = await request(BASE_URL).get("/info");
    expect(res.status).toBe(404);
  });

  test("bad songId", async () => {
    expect.assertions(2);
    const res = await request(BASE_URL).get("/info/_");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "songID is not a valid YouTube ID");
  });

  test("proper songId", async () => {
    expect.assertions(2);
    const res = await request(BASE_URL).get("/info/HoBGWhapaho");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
  });
});

describe("GET /lyrics", () => {
  test("no songId provided", async () => {
    expect.assertions(1);
    const res = await request(BASE_URL).get("/lyrics");
    expect(res.status).toBe(404);
  });

  test("bad songId", async () => {
    expect.assertions(2);
    const res = await request(BASE_URL).get("/lyrics/_");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "songID is not a valid YouTube ID");
  });

  test("bad lyrics provider", async () => {
    expect.assertions(2);
    const res = await request(BASE_URL).get("/lyrics/HoBGWhapaho?provider=twitch");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty(
      "error",
      "The lyrics provider value should be one of these 'youtube', 'genius' but received 'twitch'"
    );
  });

  test("proper request", async () => {
    expect.assertions(2);
    const res = await request(BASE_URL).get("/lyrics/HoBGWhapaho?provider=genius");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
  });
});
