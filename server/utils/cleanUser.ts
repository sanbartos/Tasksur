import type { User } from "../types/user.js";

export function cleanUser(user: User): User {
  return {
    ...user,
    email: user.email ?? null,
    firstName: user.firstName ?? null,
    lastName: user.lastName ?? null,
    profileImageUrl: user.profileImageUrl ?? null,
    // agrega más campos si es necesario
  };
}