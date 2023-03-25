import { Response } from "express";
import { ApiRequest } from "../routers/api";
import { InfoData, SearchData, SongData } from "./validationController";
import { ErrorRes, SuccessRes } from "../utils/responseTypes";

export function searchSong(req: ApiRequest<SearchData>, res: Response) {
  if (req["apiResult"] === undefined) {
    return ErrorRes(res, { message: "Request couldn't be verified" });
  }
  if (!req["apiResult"].success) {
    return ErrorRes(res, { message: req["apiResult"].error });
  }
  const { data } = req["apiResult"];
  return SuccessRes(res, { data });
}

export function getInfo(req: ApiRequest<InfoData>, res: Response) {
  if (req["apiResult"] === undefined) {
    return ErrorRes(res, { message: "Request couldn't be verified" });
  }
  if (!req["apiResult"].success) {
    return ErrorRes(res, { message: req["apiResult"].error });
  }
  const { data } = req["apiResult"];
  return SuccessRes(res, { data });
}

export function getLyrics(req: ApiRequest<SongData>, res: Response) {
  if (req["apiResult"] === undefined) {
    return ErrorRes(res, { message: "Request couldn't be verified" });
  }
  if (!req["apiResult"].success) {
    return ErrorRes(res, { message: req["apiResult"].error });
  }
  const { data } = req["apiResult"];
  return SuccessRes(res, { data });
}

export function downloadSong(req: ApiRequest<SongData>, res: Response) {
  if (req["apiResult"] === undefined) {
    return ErrorRes(res, { message: "Request couldn't be verified" });
  }
  if (!req["apiResult"].success) {
    return ErrorRes(res, { message: req["apiResult"].error });
  }
  const { data } = req["apiResult"];
  return SuccessRes(res, { data });
}
