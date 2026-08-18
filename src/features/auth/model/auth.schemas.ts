import * as v from "valibot";

export const loginSchema = v.object({
  username: v.pipe(v.string(), v.nonEmpty("Username is required")),
  password: v.pipe(v.string(), v.nonEmpty("Password is required")),
});

export type LoginFormData = v.InferOutput<typeof loginSchema>;

export const registerSchema = v.pipe(
  v.object({
    username: v.pipe(
      v.string(),
      v.minLength(3, "Username must be at least 3 characters"),
      v.maxLength(32, "Username must not exceed 32 characters"),
      v.regex(
        /^[a-zA-Z0-9_-]+$/,
        "Only Latin letters, numbers, hyphens, and underscores are allowed",
      ),
    ),
    password: v.pipe(
      v.string(),
      v.minLength(8, "Password must be at least 8 characters"),
      v.maxLength(72, "Password must not exceed 72 characters"),
    ),
    password_confirm: v.pipe(v.string(), v.nonEmpty("Please confirm your password")),
    invite_token: v.pipe(v.string(), v.nonEmpty("Invite token is required for registration")),
  }),
  v.forward(
    v.partialCheck(
      [["password"], ["password_confirm"]],
      (input) => input.password === input.password_confirm,
      "Passwords do not match",
    ),
    ["password_confirm"],
  ),
);

export type RegisterFormData = v.InferOutput<typeof registerSchema>;
