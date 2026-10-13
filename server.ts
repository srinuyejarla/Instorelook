import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import customerRouter from "./src/api/routes/customer";
import { mongoRouter } from "./src/api/mongoRoutes";
import { getCatalogSource } from "./src/db/mongo";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import "dotenv/config";

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*" }
  });
  app.set("io", io);
  
  io.on("connection", (socket) => {
    console.log("Client connected to socket:", socket.id);
  });

  app.use(cors({ origin: "*" }));
  app.use(express.json({ limit: "50mb" }));

  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }
  app.use('/uploads', express.static(uploadsDir));

  // Mongo routes are mounted first so Mongo mode never falls through to the
  // SQLite demo routes. Routes that are not part of Mongo mode call next().
  app.use("/api", mongoRouter);
  app.use("/api/customer", customerRouter);

  const catalogSource = getCatalogSource();
  const aiRouter = (await import("./src/api/routes/ai")).default;
  app.use("/api/ai", aiRouter);

  // The original SQLite routers remain the explicit demo implementation. Do
  // not import them in Mongo mode: importing the legacy db module opens and
  // seeds sqlite.db at module load, which is unnecessary in production.
  if (catalogSource === "demo") {
    const [authRouter, profileRouter, productsRouter, analyticsRouter, notificationsRouter] = await Promise.all([
      import("./src/api/routes/auth"),
      import("./src/api/routes/profile"),
      import("./src/api/routes/products"),
      import("./src/api/routes/analytics"),
      import("./src/api/routes/notifications"),
    ]);
    app.use("/api/auth", authRouter.default);
    app.use("/api/profile", profileRouter.default);
    app.use("/api/products", productsRouter.default);
    app.use("/api/analytics", analyticsRouter.default);
    app.use("/api/notifications", notificationsRouter.default);
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
