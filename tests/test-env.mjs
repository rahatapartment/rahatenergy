// Unit/API tests must never inherit production credentials from Prisma's .env loader.
for (const key of ["ENERGY_DATABASE_URL", "ENERGY_DIRECT_URL", "ENERGY_ADMIN_PASSWORD", "ENERGY_ADMIN_SESSION_SECRET", "ENERGY_PAYSTACK_SECRET_KEY", "ENERGY_RESEND_API_KEY", "ENERGY_EMAIL_FROM", "ENERGY_ADMIN_EMAIL", "ENERGY_CRON_SECRET"])
  process.env[key] = "";
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3001";
process.env.NODE_ENV = "test";
