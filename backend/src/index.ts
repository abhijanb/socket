import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import { createSocketServer } from "./lib/socket";

const app = express();
const port = 3000;

app.all('/api/auth/{*any}', toNodeHandler(auth));
// Mount body-parsing middleware after the Better Auth handler.
app.use(express.json());

const { httpServer } = createSocketServer(app);

httpServer.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});