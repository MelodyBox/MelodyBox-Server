import "./env";
import express from "express";
import helmet from "helmet";
import cors from "cors";
const app = express();
const PORT = process.env.PORT || 6012;

import apiRouter from "./routers/api";
app.use(helmet());
app.use(cors());
app.use("/", apiRouter);

app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}/`));

export const expressApp = app;
