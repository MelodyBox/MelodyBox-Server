import { Request, Response } from "express";
import { SuccessRes, ErrorRes } from "../utils/responseTypes";
import { z } from "zod";
import ytdl from "ytdl-core";

// Helper Type
export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

export interface ApiRequest<T> extends Request {
  apiData?: T;
}

/**
 * Returns the first error message in the array of ZodError
 */
function ZodFirstError<T>(errResult: z.SafeParseError<T>) {
  return errResult.error.errors[0].message;
}

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

export type SearchData = z.infer<typeof SearchQuery>;
export function validSearchRequest(req: ApiRequest<SearchData>, res: Response) {
  const paramResult = SearchQuery.safeParse(req.query);
  if (!paramResult.success) {
    return ErrorRes(res, { message: ZodFirstError(paramResult) });
  }
  req["apiData"] = paramResult.data;
  return SuccessRes(res, { data: "Hi" });
}

const songIDSchema = z.object({
  songID: z
    .string()
    .trim()
    .refine((val) => ytdl.validateID(val), "songID is not a valid YouTube ID"),
});

export type InfoData = z.infer<typeof songIDSchema>;
export function validInfoRequest(req: ApiRequest<InfoData>, res: Response) {
  const paramResult = songIDSchema.safeParse(req.params);
  if (!paramResult.success) {
    return ErrorRes(res, { message: ZodFirstError(paramResult) });
  }
  req["apiData"] = paramResult.data;
  return SuccessRes(res, { data: "Hi" });
}

const LyricsProvider = z.object({
  provider: z
    .enum(["youtube", "genius"], {
      errorMap: (val) => {
        const rec = (val as { received: string }).received;
        return {
          message: `The lyrics provider value should be one of these 'youtube', 'genius' but received '${rec}'`,
        };
      },
    })
    .default("youtube"),
});

type LyricsData = Expand<z.infer<typeof songIDSchema> & z.infer<typeof LyricsProvider>>;
export function validLyricsRequest(req: ApiRequest<LyricsData>, res: Response) {
  const paramResult = songIDSchema.safeParse(req.params);
  if (!paramResult.success) {
    return ErrorRes(res, { message: ZodFirstError(paramResult) });
  }
  const queryResult = LyricsProvider.safeParse(req.query);
  if (!queryResult.success) {
    return ErrorRes(res, { message: ZodFirstError(queryResult) });
  }
  req["apiData"] = {
    songID: paramResult.data.songID,
    provider: queryResult.data.provider,
  };
  return SuccessRes(res, { data: "Hi" });
}
