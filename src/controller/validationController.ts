import { Request, Response } from "express";
import { SuccessRes, ErrorRes } from "../utils/responseTypes";
import { z } from "zod";
import ytdl from "ytdl-core";

const SearchQuery = z.object({
  q: z
    .string({ required_error: "'q' is the required search string" })
    .min(1, "The search query must be at least 1 character long")
    .trim(),
  filter: z
    .enum(["songs", "videos", "artists"], {
      errorMap: (val) => {
        const rec = (val as { received: string }).received;
        return {
          message: `The filter value should be one of these 'songs', 'videos', 'artists' but received '${rec}'`,
        };
      },
    })
    .default("songs"),
});

export function validSearchRequest(req: Request, res: Response) {
  console.log("Input:", req.query);
  const result = SearchQuery.safeParse(req.query);
  if (!result.success) {
    return ErrorRes(res, { message: result.error.errors[0].message });
  }
  console.log("Output:", result.data);
  return SuccessRes(res, { data: "Hi" });
}

const InfoParam = z.object({
  songID: z
    .string()
    .trim()
    .refine((val) => ytdl.validateID(val), "songID is not a valid YouTube ID"),
});

export function validInfoRequest(req: Request, res: Response) {
  const paramResult = InfoParam.safeParse(req.params);
  if (!paramResult.success) {
    return ErrorRes(res, { message: paramResult.error.errors[0].message });
  }
  return SuccessRes(res, { data: "Hi" });
}
