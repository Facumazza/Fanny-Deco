-- Enable Postgres' unaccent extension so product search can match
-- "maimara" against "Maimará", "cafe" against "café", etc. Without this,
-- Argentine customers who don't type diacritics come back to an empty
-- results grid.
--
-- Extension is idempotent, and only needs to be created once per database.
CREATE EXTENSION IF NOT EXISTS unaccent;
