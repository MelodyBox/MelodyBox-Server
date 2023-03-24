import { Router } from "express";
import * as v from "../controller/validationController";
const router = Router();

router.get("/search", v.validSearchRequest);
router.get("/info/:songID", v.validInfoRequest);
router.get("/lyrics/:songID", v.validLyricsRequest);

export default router;
