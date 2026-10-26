-- Qobban staff portal — foundation (migration 001). Target: MariaDB 11.8, utf8mb4.
-- All DATETIMEs are UTC; the UI shows Bahrain time (UTC+3, no daylight saving).
-- Money is integer fils (1 BHD = 1000 fils). Never FLOAT: the totals must reconcile exactly.
-- Issued documents are never edited or deleted — they are voided, and corrected with a
-- new document. Everything that changes is written to audit_log.

SET NAMES utf8mb4;

-- ------------------------------------------------------------ the company itself
-- One row. Its legal details are printed on every customer document, so they live in
-- the database rather than in code: the owner can correct them without a deploy.
CREATE TABLE company (
  id            TINYINT UNSIGNED NOT NULL PRIMARY KEY DEFAULT 1,
  name_en       VARCHAR(160) NOT NULL,
  name_ar       VARCHAR(160) NOT NULL,
  cr_no         VARCHAR(20),
  vat_no        VARCHAR(40),              -- a tax invoice is not valid without this
  address_en    TEXT,
  address_ar    TEXT,
  phone         VARCHAR(60),
  whatsapp      VARCHAR(60),
  email         VARCHAR(160),
  website       VARCHAR(160),
  hours_en      VARCHAR(160),
  hours_ar      VARCHAR(160),
  vat_rate_bp   SMALLINT NOT NULL DEFAULT 1000,   -- 1000 = 10%
  labour_rate_fils BIGINT NOT NULL DEFAULT 10000, -- default BHD/hour in the build-up
  margin_pct    DECIMAL(5,2) NOT NULL DEFAULT 20.00,
  quote_valid_days SMALLINT NOT NULL DEFAULT 14,
  CHECK (id = 1)
);

-- ------------------------------------------------------------ people and permissions
CREATE TABLE users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name_en       VARCHAR(120) NOT NULL,
  name_ar       VARCHAR(120),
  phone         VARCHAR(60) NOT NULL UNIQUE,      -- the login name
  email         VARCHAR(160),
  pin_hash      VARCHAR(255) NOT NULL,            -- scrypt; never the PIN itself
  active        TINYINT(1) NOT NULL DEFAULT 1,    -- staff leave; their documents stay
  placeholder   TINYINT(1) NOT NULL DEFAULT 0,    -- seat reserved, real details to come
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roles (
  id            SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(30) NOT NULL UNIQUE,
  name_en       VARCHAR(80) NOT NULL,
  name_ar       VARCHAR(80) NOT NULL
);

-- Roles live in a table, not an enum, so 'workshop' can be added as a row later.
CREATE TABLE user_roles (
  user_id       INT UNSIGNED NOT NULL,
  role_id       SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE sessions (
  token_hash    CHAR(64) PRIMARY KEY,             -- SHA-256 of the cookie value
  user_id       INT UNSIGNED NOT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at    DATETIME NOT NULL,
  ip            VARCHAR(45),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE audit_log (                          -- append-only; who did what, when
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  user_id       INT UNSIGNED,
  action        VARCHAR(40) NOT NULL,             -- create / issue / void / accept / login
  entity        VARCHAR(40) NOT NULL,
  entity_id     BIGINT UNSIGNED,
  detail        JSON,
  KEY (entity, entity_id),
  KEY (at)
);

-- ------------------------------------------------------------ clients and suppliers
CREATE TABLE customers (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(160) NOT NULL,
  kind          ENUM('person','company') NOT NULL DEFAULT 'person',
  phone         VARCHAR(60) NOT NULL UNIQUE,      -- one client per phone, as asked
  phone2        VARCHAR(60),
  email         VARCHAR(160),
  company_name  VARCHAR(160),
  cr_no         VARCHAR(20),
  vat_no        VARCHAR(40),                      -- printed on their tax invoice when given
  address       TEXT,
  area          VARCHAR(80),                      -- Riffa, Muharraq, Sitra...
  note          TEXT,
  created_by    INT UNSIGNED,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY (name)
);

CREATE TABLE suppliers (                          -- used from phase 3; defined here so
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,   -- purchase orders have a home
  name          VARCHAR(160) NOT NULL,
  phone         VARCHAR(60),
  vat_no        VARCHAR(40),
  address       TEXT,
  note          TEXT,
  active        TINYINT(1) NOT NULL DEFAULT 1
);

-- ------------------------------------------------------------ price list
-- Materials, labour rates and unit rates a quote picks from. No stock counting yet:
-- stock_moves exists so stock can be switched on later without rewriting history.
CREATE TABLE price_list (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(40) UNIQUE,
  name_en       VARCHAR(160) NOT NULL,
  name_ar       VARCHAR(160),
  kind          ENUM('material','labour','unit_rate','product') NOT NULL,
  category      VARCHAR(60),                      -- Steel sections, Sheets, Paint...
  unit          ENUM('piece','m','m2','kg','hour','set','job') NOT NULL DEFAULT 'piece',
  rate_fils     BIGINT NOT NULL DEFAULT 0,        -- sell rate, before VAT
  cost_fils     BIGINT,                           -- buy price — owner only, for margin
  track_stock   TINYINT(1) NOT NULL DEFAULT 0,    -- off everywhere for now
  active        TINYINT(1) NOT NULL DEFAULT 1,
  KEY (kind, category)
);

CREATE TABLE stock_moves (                        -- unused in phase 1, shape ready
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  price_list_id INT UNSIGNED NOT NULL,
  at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  qty           DECIMAL(12,3) NOT NULL,           -- + in, - out
  reason        ENUM('receive','use','damage','count','return') NOT NULL,
  document_id   BIGINT UNSIGNED,
  user_id       INT UNSIGNED,
  FOREIGN KEY (price_list_id) REFERENCES price_list(id)
);

-- ------------------------------------------------------------ document numbering
-- One running series per type. Taken with SELECT ... FOR UPDATE inside the same
-- transaction as the row, so two people saving at once cannot take the same number.
CREATE TABLE doc_sequences (
  doc_type      VARCHAR(20) NOT NULL PRIMARY KEY,
  prefix        VARCHAR(8) NOT NULL,
  next_no       INT UNSIGNED NOT NULL DEFAULT 1
);

-- ------------------------------------------------------------ quotes and invoices
CREATE TABLE documents (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  doc_type      ENUM('quote','invoice','credit_note') NOT NULL,
  doc_no        INT UNSIGNED NOT NULL,
  version       SMALLINT UNSIGNED NOT NULL DEFAULT 1,  -- a sent quote locks; an edit makes v2
  supersedes_id BIGINT UNSIGNED,                       -- the version this one replaced
  job_id        BIGINT UNSIGNED,                       -- filled from phase 2
  status        ENUM('draft','sent','accepted','cancelled','void') NOT NULL DEFAULT 'draft',
  lang          ENUM('ar','en') NOT NULL DEFAULT 'ar',
  customer_id   INT UNSIGNED,
  customer_name VARCHAR(160) NOT NULL,             -- as printed, frozen at issue
  customer_phone VARCHAR(60),
  customer_vat  VARCHAR(40),
  subject       VARCHAR(200),
  -- every amount in fils, computed on the server
  subtotal_fils BIGINT NOT NULL DEFAULT 0,
  discount_fils BIGINT NOT NULL DEFAULT 0,
  special_fils  BIGINT NOT NULL DEFAULT 0,         -- the part of the discount that rounds the total
  delivery_fils BIGINT NOT NULL DEFAULT 0,
  vat_fils      BIGINT NOT NULL DEFAULT 0,
  total_fils    BIGINT NOT NULL DEFAULT 0,
  vat_on        TINYINT(1) NOT NULL DEFAULT 1,
  valid_days    SMALLINT NOT NULL DEFAULT 14,
  note          TEXT,                              -- shown to the customer
  internal_note TEXT,                              -- never printed
  token         CHAR(32) UNIQUE,                   -- the /q/<token> customer link
  issued_at     DATETIME,
  accepted_at   DATETIME,
  accepted_name VARCHAR(160),                      -- who clicked Accept, and from where
  accepted_ip   VARCHAR(45),
  cancel_reason VARCHAR(255),                      -- cancelling always needs a reason
  created_by    INT UNSIGNED,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY (doc_type, doc_no, version),
  KEY (status, issued_at),
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE document_lines (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  document_id   BIGINT UNSIGNED NOT NULL,
  sort          SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  -- how this line was priced; the customer only ever sees the resulting amounts
  mode          ENUM('build_up','unit_rate','fixed') NOT NULL,
  price_list_id INT UNSIGNED,
  description   VARCHAR(255) NOT NULL,
  unit_label    VARCHAR(16),
  qty           DECIMAL(12,3) NOT NULL DEFAULT 1,
  unit_fils     BIGINT NOT NULL DEFAULT 0,
  net_fils      BIGINT NOT NULL DEFAULT 0,         -- unit x qty
  discount_fils BIGINT NOT NULL DEFAULT 0,         -- this line's share of the document discount
  vat_rate_bp   SMALLINT NOT NULL DEFAULT 0,
  vat_fils      BIGINT NOT NULL DEFAULT 0,
  line_total_fils BIGINT NOT NULL DEFAULT 0,       -- net - discount + vat
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  KEY (document_id, sort)
);

-- The materials-and-labour workings behind a build_up line.
-- INTERNAL ONLY. Staff see it; the customer document prints only the line total.
-- Nothing that renders a customer-facing page may join this table.
CREATE TABLE line_build_up (
  line_id         BIGINT UNSIGNED NOT NULL PRIMARY KEY,
  material_fils   BIGINT NOT NULL DEFAULT 0,
  hours           DECIMAL(8,2) NOT NULL DEFAULT 0,
  labour_rate_fils BIGINT NOT NULL DEFAULT 0,
  margin_pct      DECIMAL(5,2) NOT NULL DEFAULT 0,
  note            VARCHAR(255),
  FOREIGN KEY (line_id) REFERENCES document_lines(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------ quote terms
-- Ready-made conditions the person quoting ticks on or off, rather than retyping.
CREATE TABLE quote_terms (
  id            SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(40) NOT NULL UNIQUE,
  text_en       TEXT NOT NULL,
  text_ar       TEXT NOT NULL,
  default_on    TINYINT(1) NOT NULL DEFAULT 1,
  sort          SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  active        TINYINT(1) NOT NULL DEFAULT 1
);

-- The text is copied onto the document, not just referenced: editing a term later must
-- not silently change what a customer already agreed to.
CREATE TABLE document_terms (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  document_id   BIGINT UNSIGNED NOT NULL,
  term_code     VARCHAR(40),
  text_en       TEXT NOT NULL,
  text_ar       TEXT NOT NULL,
  sort          SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);
