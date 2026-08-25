import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import { createSocketServer } from "./lib/socket";
import { logger } from "./lib/logger";
import friendsRouter from "./routes/friends";

const app = express();
const port = 3000;

app.use(pinoHttp({ logger }));

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

app.all('/api/auth/{*any}', toNodeHandler(auth));
app.use(express.json());

app.use('/api/friends', friendsRouter);

const { httpServer } = createSocketServer(app);

httpServer.listen(port, () => {
    logger.info(`Server listening on port ${port}`);
});