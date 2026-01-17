-- Schema para Sistema de Invoices (Faturas)
-- IMPORTANTE: Este schema adiciona novas tabelas sem afetar dados existentes

CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  user_id INTEGER NOT NULL,
  client_id INTEGER,
  status TEXT DEFAULT 'draft',

  date_from TEXT NOT NULL,
  date_to TEXT NOT NULL,
  issue_date TEXT NOT NULL,
  due_date TEXT,

  total_hours REAL NOT NULL,
  currency TEXT NOT NULL,
  total_amount REAL NOT NULL,

  company_name TEXT,
  company_address TEXT,
  company_tax_id TEXT,
  company_bank_info TEXT,

  client_name TEXT,
  client_email TEXT,
  client_address TEXT,
  client_tax_id TEXT,

  notes TEXT,

  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),

  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (client_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS invoice_items (
  invoice_id TEXT NOT NULL,
  registro_id TEXT NOT NULL,
  PRIMARY KEY (invoice_id, registro_id),
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (registro_id) REFERENCES registros(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS company_settings (
  user_id INTEGER PRIMARY KEY,
  company_name TEXT,
  company_address TEXT,
  company_tax_id TEXT,
  company_email TEXT,
  company_phone TEXT,
  company_bank_info TEXT,
  updated_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
