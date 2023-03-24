import { Router } from "express";
import * as v from "../controller/validationController";
const router = Router();

router.get("/search", v.validSearchRequest);
router.get("/info/:songID", v.validInfoRequest);
router.get("/lyrics/:songID", v.validSongRequest);
router.get("/download/:songID", v.validSongRequest);

export default router;
