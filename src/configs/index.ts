if (!process.env.JWT_SECRET) {
  throw new Error(
    'JWT_SECRET environment variable is required and must not be empty',
  );
}

export const CONFIGS = {
  PORT: process.env.PORT || 3000,
  ACCESS_TOKEN_LIFETIME_MINS: 60,
  REFRESH_TOKEN_LIFETIME_DAYS: 7,
  INVITE_TOKEN_LIFETIME_DAYS: 7,
  JWT_SECRET: process.env.JWT_SECRET,
  BCRYPT_SALT_ROUNDS: 10,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
};
