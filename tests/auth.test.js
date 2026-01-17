const request = require("supertest");
const app = require("../src/app");
const { query } = require("../src/config/database");

describe("Auth API", () => {
  beforeEach(async () => {
    // Clean up users table before each test
    await query("DELETE FROM users WHERE email LIKE $1", ["%test%"]);
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const res = await request(app).post("/api/auth/register").send({
        email: "test@example.com",
        password: "Password123!",
        first_name: "John",
        last_name: "Doe",
      });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toHaveProperty("email", "test@example.com");
      expect(res.body.data).toHaveProperty("token");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login existing user", async () => {
      // First register
      await request(app).post("/api/auth/register").send({
        email: "test@example.com",
        password: "Password123!",
        first_name: "John",
        last_name: "Doe",
      });

      // Then login
      const res = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "Password123!",
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe("test@example.com");
      expect(res.body.data).toHaveProperty("token");
    });
  });
});
