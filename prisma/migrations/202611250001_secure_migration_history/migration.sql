-- Prisma creates this table during migrate deploy, but it is absent from shadow databases.
ALTER TABLE IF EXISTS public."_prisma_migrations" ENABLE ROW LEVEL SECURITY;
