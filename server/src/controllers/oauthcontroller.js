import axios from "axios";
import jwt from "jsonwebtoken";
import User from "../schema/user.schema.js";
import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const KEY = Buffer.from(process.env.GITHUB_TOKEN_SECRET, "hex");

export function encrypt(text) {
  const iv = crypto.randomBytes(12); // 96-bit IV for GCM
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return {
    iv: iv.toString("hex"),
    content: encrypted.toString("hex"),
    tag: tag.toString("hex"),
  };
}

export function decrypt(encrypted) {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    KEY,
    Buffer.from(encrypted.iv, "hex")
  );

  decipher.setAuthTag(Buffer.from(encrypted.tag, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encrypted.content, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

const generateAccessToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const githubAuthRedirect = (req, res) => {
  const githubClientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_CALLBACK_URL;
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${redirectUri}&scope=profile email`;
  res.redirect(authUrl);
};

export const githubCallBack = async (req, res) => {
  const authCode = req.query.code;
  console.log("Auth Code:", authCode);
  try {
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        code: authCode,
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        redirect_uri: process.env.GITHUB_CALLBACK_URL,
      },
      {
        headers: {
          Accept: "application/json", 
          "Content-Type": "application/json",
        },
      }
    );


    const accessToken = tokenRes.data.access_token;

    const userInfoRes = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const userInfo = userInfoRes.data;
    const { user } = await createOAuthUser(userInfo, accessToken);

    const accessTokenJWT = generateAccessToken(user._id.toString());

    const redirectUrl = `${process.env.FRONTEND_URL}/oauth-success#accessToken=${accessTokenJWT}`;
    res.redirect(302, redirectUrl);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error during github OAuth callback", error });
  }
};

export const createOAuthUser = async (profile, access_token) => {
  try {
    let user = await User.findOne({ email: profile.email });
    if (!user) {
      user = new User({
        githubId: profile.id,
        githubUsername: profile.login,
        avatarUrl: profile.avatar_url,
        githubAccessToken: encrypt(access_token),
      });
      await user.save();
    }

    return { user };
  } catch (error) {
    throw error;
  }
};

export const verifyUser = async (req, res) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId).select("-__v");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
