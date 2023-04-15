import "./env";
import express from "express";
import helmet from "helmet";
const app = express();
const PORT = process.env.PORT || 6012;

import apiRouter from "./routers/api";
app.use("/", apiRouter);
app.use(helmet());

app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}/`));

export const expressApp = app;
