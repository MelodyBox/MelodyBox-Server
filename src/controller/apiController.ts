import { Response } from "express";
import { ApiRequest, InfoData, SearchData, SongData } from "./validationController";
import { ErrorRes, SuccessRes } from "../utils/responseTypes";

export function searchSong(req: ApiRequest<SearchData>, res: Response) {
  if (typeof req["apiError"] === "string") {
    return ErrorRes(res, { message: req["apiError"] });
  }
  const data = req["apiData"] as SearchData;
  return SuccessRes(res, { data });
}

export function getInfo(req: ApiRequest<InfoData>, res: Response) {
  if (typeof req["apiError"] === "string") {
    return ErrorRes(res, { message: req["apiError"] });
  }
  const data = req["apiData"] as InfoData;
  return SuccessRes(res, { data });
}

export function getLyrics(req: ApiRequest<SongData>, res: Response) {
  if (typeof req["apiError"] === "string") {
    return ErrorRes(res, { message: req["apiError"] });
  }
  const data = req["apiData"] as SongData;
  return SuccessRes(res, { data });
}

export function downloadSong(req: ApiRequest<SongData>, res: Response) {
  if (typeof req["apiError"] === "string") {
    return ErrorRes(res, { message: req["apiError"] });
  }
  const data = req["apiData"] as SongData;
  return SuccessRes(res, { data });
}
