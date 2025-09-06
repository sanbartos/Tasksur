export function cleanUser(user) {
    return {
        ...user,
        email: user.email ?? null,
        firstName: user.firstName ?? null,
        lastName: user.lastName ?? null,
        profileImageUrl: user.profileImageUrl ?? null,
        // agrega más campos si es necesario
    };
}
