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
