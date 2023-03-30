import { Router, Request } from "express";
import * as v from "../controller/validationController";
import * as a from "../controller/apiController";

type ApiReqSuccess<T> = {
  success: true;
  data: T;
};

type ApiReqError = {
  success: false;
  error: string;
};

type ApiReqResult<T> = ApiReqSuccess<T> | ApiReqError;

export interface ApiRequest<T> extends Request {
  apiResult?: ApiReqResult<T>;
}

const router = Router();

router.get("/search", v.validSearchRequest, a.searchSong);
router.get("/info/:songID", v.validInfoRequest, a.getInfo);
router.get("/lyrics/:songID", v.validSongRequest, a.getLyrics);
router.get("/download/:songID", v.validSongRequest, a.downloadSong);

export default router;
