CREATE TABLE admin_users (
    id            BIGSERIAL PRIMARY KEY,
    email         VARCHAR(180)  NOT NULL UNIQUE,
    password_hash VARCHAR(120)  NOT NULL,
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Session storage table for Spring Session JDBC (if we later switch to it).
-- For now, the default HttpSession implementation is in-memory per-instance.
-- This table is not created here; leave it for a future migration when needed.
