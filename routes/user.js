import express from "express";
import passport from "passport";
import {
  myProfile,
  logout,
  getAdminUsers,
  getAdminStats,
} from "../controllers/user.js";
import { authorizeAdmin, isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile"],
  })
);
router.get("/login", passport.authenticate("google"), (req, res) => {
  res.send({
    success: true,
    user: "Google callback , You Logged in Successfully",
  });
});

router.get("/me", isAuthenticated, myProfile);
router.get("/logout", logout);

router.get("/admin/users", isAuthenticated, authorizeAdmin, getAdminUsers);
router.get("/admin/stats", isAuthenticated, authorizeAdmin, getAdminStats);

export default router;
