import dotenv from 'dotenv';

dotenv.config();

export const jwtConfig = {
  secret:
    process.env.JWT_SECRET ||
    "woow_super_secret_jwt_key_cambiar_en_produccion_2024",
  expiresIn: process.env.JWT_EXPIRES_IN || "24h",
};
