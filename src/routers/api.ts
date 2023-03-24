import { Router } from "express";
import * as v from "../controller/validationController";
const router = Router();

router.get("/search", v.validSearchRequest);

export default router;
