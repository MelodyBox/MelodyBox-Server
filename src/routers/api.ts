import { Router } from "express";
import * as v from "../controller/validationController";
import * as a from "../controller/apiController";
const router = Router();

router.get("/search", v.validSearchRequest, a.searchSong);
router.get("/info/:songID", v.validInfoRequest, a.getInfo);
router.get("/lyrics/:songID", v.validSongRequest, a.getLyrics);
router.get("/download/:songID", v.validSongRequest, a.downloadSong);

export default router;
