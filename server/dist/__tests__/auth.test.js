// server/__tests__/auth.test.ts
import request from "supertest";
import { app } from '../index.js'; // Importa la app desde server/index.ts
describe("Auth Endpoints", () => {
    it("should register a new user", async () => {
        const res = await request(app)
            .post("/api/register")
            .send({
            name: "Test User",
            email: "testuser@example.com",
            password: "password123",
        });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty("userId");
    });
    it("should not register user with existing email", async () => {
        // Registrar usuario la primera vez
        await request(app)
            .post("/api/register")
            .send({
            name: "Test User",
            email: "duplicate@example.com",
            password: "password123",
        });
        // Intentar registrar con el mismo email
        const res = await request(app)
            .post("/api/register")
            .send({
            name: "Test User 2",
            email: "duplicate@example.com",
            password: "password123",
        });
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toMatch(/ya existe/i);
    });
    it("should login with valid credentials", async () => {
        // Primero registra un usuario
        await request(app)
            .post("/api/register")
            .send({
            name: "Login User",
            email: "loginuser@example.com",
            password: "password123",
        });
        // Luego intenta login
        const res = await request(app)
            .post("/api/login")
            .send({
            email: "loginuser@example.com",
            password: "password123",
        });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("token");
    });
    it("should not login with invalid credentials", async () => {
        const res = await request(app)
            .post("/api/login")
            .send({
            email: "nonexistent@example.com",
            password: "wrongpassword",
        });
        expect(res.statusCode).toEqual(401);
    });
});
