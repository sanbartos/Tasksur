// src/types/express/index.d.ts
import type { User } from '../types/user.js';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};