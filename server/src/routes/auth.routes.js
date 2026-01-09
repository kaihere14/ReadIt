import { Router } from "express";

const router = Router();

import {
  githubAuthRedirect,
  githubCallBack,
} from "../controllers/oauthcontroller.js";

router.get("/github", githubAuthRedirect);
router.get("/github/callback", githubCallBack);

export default router;