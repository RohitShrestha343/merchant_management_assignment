import { Router } from "express";
import jwt from "jsonwebtoken";
import { users } from "../data/database.js";
import { ACCESS_SECRET } from "../middleware/auth.middleware.js";

const router = Router();
const REFRESH_SECRET =
  process.env.REFRESH_SECRET || "development-refresh-secret-change-me";
const refreshTokens = new Set();

function issue(user) {
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
  const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: "20s" });
  const refreshToken = jwt.sign(
    { id: user.id, type: "refresh" },
    REFRESH_SECRET,
    { expiresIn: "7d" },
  );
  refreshTokens.add(refreshToken);
  return { accessToken, refreshToken, user: payload };
}
router.post("/login", (req, res) => {
  console.log(req);
  const user = users.find(
    (u) => u.email === req.body.email && u.password === req.body.password,
  );
  if (!user)
    return res.status(401).json({ message: "Invalid email or password" });
  res.json(issue(user));
});
router.post("/refresh", (req, res) => {
  const token = req.body.refreshToken;
  if (!token || !refreshTokens.has(token))
    return res.status(401).json({ message: "Invalid refresh token" });
  try {
    const decoded = jwt.verify(token, REFRESH_SECRET);
    const user = users.find((u) => u.id === decoded.id);
    if (!user) return res.status(401).json({ message: "User not found" });
    refreshTokens.delete(token);
    const result = issue(user);
    res.json({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch {
    res.status(401).json({ message: "Refresh token expired" });
  }
});
export default router;
