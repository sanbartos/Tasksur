// types/express.d.ts
import type { User as MyUser } from '../types/user.js'; // Ajusta la ruta

declare global {
  namespace Express {
    interface User extends MyUser {} // Extiende Express.User con tu User
    interface Request {
      user?: MyUser;
    }
  }
}