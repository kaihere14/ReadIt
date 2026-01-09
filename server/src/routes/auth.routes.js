import { Router } from "express";

const router = Router();

import {
  githubAuthRedirect,
  githubCallBack,
  verifyUser,
} from "../controllers/oauthcontroller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

router.get("/github", githubAuthRedirect);
router.get("/github/callback", githubCallBack);
router.post("/verify", authenticate, verifyUser);

export default router;
