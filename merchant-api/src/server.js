import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { authenticate } from "./middleware/auth.middleware.js";

const app = express();
app.use(cors({ origin: "http://localhost:4200" }));
app.use(express.json());
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api", authenticate);
app.use("/api/applications", applicationRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});
const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`Merchant API listening on http://localhost:${port}`),
);
