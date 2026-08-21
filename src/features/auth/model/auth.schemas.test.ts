import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "./auth.schemas";

describe("auth validation schemas", () => {
  describe("loginSchema", () => {
    it("passes validation with valid username and password", () => {
      const result = v.safeParse(loginSchema, {
        username: "alex_dev",
        password: "secretpassword123",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.output).toEqual({
          username: "alex_dev",
          password: "secretpassword123",
        });
      }
    });

    it("fails when username is empty", () => {
      const result = v.safeParse(loginSchema, {
        username: "",
        password: "password123",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.issues[0]?.message).toBe("Username is required");
      }
    });

    it("fails when password is empty", () => {
      const result = v.safeParse(loginSchema, {
        username: "alex",
        password: "",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.issues[0]?.message).toBe("Password is required");
      }
    });
  });

  describe("registerSchema", () => {
    const validRegistrationData = {
      username: "alex_99",
      password: "securepassword123",
      password_confirm: "securepassword123",
      invite_token: "valid-invite-uuid",
    };

    it("passes validation with complete and valid registration data", () => {
      const result = v.safeParse(registerSchema, validRegistrationData);
      expect(result.success).toBe(true);
    });

    describe("username rules", () => {
      it("fails when username is shorter than 3 characters", () => {
        const result = v.safeParse(registerSchema, {
          ...validRegistrationData,
          username: "ab",
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.issues[0]?.message).toBe("Username must be at least 3 characters");
        }
      });

      it("fails when username exceeds 32 characters", () => {
        const result = v.safeParse(registerSchema, {
          ...validRegistrationData,
          username: "a".repeat(33),
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.issues[0]?.message).toBe("Username must not exceed 32 characters");
        }
      });

      it("allows latin letters, numbers, hyphens, and underscores", () => {
        const validUsernames = ["alex-123", "user_name", "VoxholdUser", "a-b_c-9"];

        for (const username of validUsernames) {
          const result = v.safeParse(registerSchema, {
            ...validRegistrationData,
            username,
          });
          expect(result.success).toBe(true);
        }
      });

      it("rejects special characters, spaces, and non-latin symbols", () => {
        const invalidUsernames = ["user@name", "user name", "пользователь", "alex!", "alex#1"];

        for (const username of invalidUsernames) {
          const result = v.safeParse(registerSchema, {
            ...validRegistrationData,
            username,
          });
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.issues[0]?.message).toBe(
              "Only Latin letters, numbers, hyphens, and underscores are allowed",
            );
          }
        }
      });
    });

    describe("password rules", () => {
      it("fails when password is shorter than 8 characters", () => {
        const result = v.safeParse(registerSchema, {
          ...validRegistrationData,
          password: "short",
          password_confirm: "short",
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.issues[0]?.message).toBe("Password must be at least 8 characters");
        }
      });

      it("fails when password exceeds 72 characters", () => {
        const longPassword = "p".repeat(73);
        const result = v.safeParse(registerSchema, {
          ...validRegistrationData,
          password: longPassword,
          password_confirm: longPassword,
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.issues[0]?.message).toBe("Password must not exceed 72 characters");
        }
      });

      it("accepts password at exact minimum (8 chars) and maximum (72 chars) boundaries", () => {
        const minPass = "12345678";
        const maxPass = "p".repeat(72);

        expect(
          v.safeParse(registerSchema, {
            ...validRegistrationData,
            password: minPass,
            password_confirm: minPass,
          }).success,
        ).toBe(true);

        expect(
          v.safeParse(registerSchema, {
            ...validRegistrationData,
            password: maxPass,
            password_confirm: maxPass,
          }).success,
        ).toBe(true);
      });
    });

    describe("password confirmation and invite token", () => {
      it("fails when passwords do not match", () => {
        const result = v.safeParse(registerSchema, {
          ...validRegistrationData,
          password: "firstPassword123",
          password_confirm: "differentPassword123",
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.issues[0]?.message).toBe("Passwords do not match");
        }
      });

      it("fails when invite token is empty", () => {
        const result = v.safeParse(registerSchema, {
          ...validRegistrationData,
          invite_token: "",
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.issues[0]?.message).toBe("Invite token is required for registration");
        }
      });
    });
  });
});
