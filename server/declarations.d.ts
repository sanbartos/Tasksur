// server/declarations.d.ts
import type { User } from "./types/user.js";

// Ampliación global: asegura que req.user esté tipado en todo el proyecto
declare global {
  namespace Express {
    interface Request {
      user?: (User & { userId?: string }) | undefined;
    }
  }
}

// Tus módulos existentes
declare module "openid-client/passport";
declare module "jsonwebtoken";
declare module "bcrypt";
declare module "nodemailer";

export {};

// Permite importar módulos relativos con extensión .js desde archivos .ts
declare module "*.js" {
  const value: any;
  export default value;
}