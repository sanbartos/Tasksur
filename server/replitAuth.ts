import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage.js";
import type { User } from './types/user.js';
import * as OpenIDClient from "openid-client"; // Importar todo como namespace
import { Strategy as OpenIDConnectStrategy } from "passport-openidconnect";

type VerifyFunction = (
  issuer: string,
  sub: string,
  profile: any,
  accessToken: string,
  refreshToken: string,
  done: (err: any, user?: any) => void
) => void;

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}
console.log('REPLIT_CLIENT_ID:', process.env.REPLIT_CLIENT_ID);
console.log('REPLIT_CLIENT_SECRET:', process.env.REPLIT_CLIENT_SECRET);
console.log('REPLIT_AUTH_URL:', process.env.REPLIT_AUTH_URL);
console.log('REPL_ID:', process.env.REPL_ID);

const getOidcIssuer = memoize(
  async () => {
    // Importación dinámica para evitar problemas de tipos
    const OpenIDClient = await import("openid-client");
    // Accede a Issuer desde default o directamente
    const Issuer = (OpenIDClient as any).Issuer || (OpenIDClient as any).default?.Issuer;
    if (!Issuer) {
      throw new Error("No se pudo encontrar Issuer en openid-client");
    }
    return await Issuer.discover(
      process.env.ISSUER_URL ?? "https://replit.com/oidc"
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

async function upsertUser(profile: any) {
  await storage.upsertUser({
    id: profile.sub,
    email: profile.email,
    firstName: profile.first_name,
    lastName: profile.last_name,
    profileImageUrl: profile.profile_image_url,
    password: "oauth_generated_password",
    role: "user",
    totalEarnings: null,
    totalTasks: null,
    rating: null,
    reviewCount: null,
    phone: null,
    isTasker: null,
    skills: [],
    hourlyRate: null,
    updatedAt: null,
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const issuer = await getOidcIssuer();

  for (const domain of process.env.REPLIT_DOMAINS!.split(",")) {
    const client = new issuer.Client({
      client_id: process.env.REPLIT_CLIENT_ID!,
      client_secret: process.env.REPLIT_CLIENT_SECRET!,
      redirect_uris: [`https://${domain}/api/callback`],
      response_types: ["code"],
    });

    const verify: VerifyFunction = async (
      issuer,
      sub,
      profile,
      accessToken,
      refreshToken,
      done
    ) => {
      try {
        await upsertUser(profile);
        done(null, profile);
      } catch (err) {
        done(err);
      }
    };

    const strategy = new OpenIDConnectStrategy(
      {
        issuer: issuer.issuer,
        authorizationURL: issuer.authorization_endpoint,
        tokenURL: issuer.token_endpoint,
        userInfoURL: issuer.userinfo_endpoint,
        clientID: process.env.REPLIT_CLIENT_ID!,
        clientSecret: process.env.REPLIT_CLIENT_SECRET!,
        callbackURL: `https://${domain}/api/callback`,
        scope: "openid email profile offline_access",
      },
      verify
    );

    passport.use(`replitauth:${domain}`, strategy);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      const logoutUrl = `${issuer.end_session_endpoint}?post_logout_redirect_uri=${encodeURIComponent(`${req.protocol}://${req.hostname}`)}`;
      res.redirect(logoutUrl);
    });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  return next();
};