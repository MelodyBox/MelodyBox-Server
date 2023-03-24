import { Router } from "express";
import * as v from "../controller/requestController";
const router = Router();

router.get("/search", v.validSearchRequest);

export default router;
