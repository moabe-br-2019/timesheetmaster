-- Migração: Adicionar Stripe como tipo de pagamento
-- Adiciona 'stripe' como opção válida e campo para controlar exibição da taxa

-- SQLite não suporta ALTER COLUMN para modificar constraints
-- Então precisamos:
-- 1. Criar nova tabela com constraint correta
-- 2. Copiar dados
-- 3. Deletar tabela antiga
-- 4. Renomear nova tabela

-- 1. Criar tabela temporária com constraint atualizada (incluindo 'stripe')
CREATE TABLE payment_methods_new (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('pix', 'international', 'paypal', 'stripe')),
  currency TEXT NOT NULL,

  -- Campos para PIX (Brasil)
  pix_key TEXT,
  pix_key_type TEXT,

  -- Campos para pagamentos internacionais
  beneficiary_name TEXT,
  beneficiary_account_number TEXT,
  swift_code TEXT,
  bank_name TEXT,
  bank_address TEXT,

  -- Campos opcionais para banco intermediário
  intermediary_swift_code TEXT,
  intermediary_bank_name TEXT,
  intermediary_bank_address TEXT,
  intermediary_account_number TEXT,

  -- Dados da entidade (PF/PJ)
  entity_type TEXT,
  entity_name TEXT,
  entity_tax_id TEXT,

  -- Campos para PayPal
  paypal_email TEXT,
  paypal_fee_percentage REAL,

  -- Campos para Stripe
  stripe_email TEXT,                      -- Email da conta Stripe
  stripe_fee_percentage REAL DEFAULT 6.0, -- Taxa padrão 6%
  show_fee_on_invoice INTEGER DEFAULT 1,  -- 1 = mostra taxa na invoice, 0 = não mostra

  -- Metadata
  is_default INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  notes TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. Copiar todos os dados da tabela antiga (se existir)
INSERT INTO payment_methods_new
SELECT
  id, user_id, name, type, currency,
  pix_key, pix_key_type,
  beneficiary_name, beneficiary_account_number, swift_code,
  bank_name, bank_address,
  intermediary_swift_code, intermediary_bank_name,
  intermediary_bank_address, intermediary_account_number,
  entity_type, entity_name, entity_tax_id,
  paypal_email, paypal_fee_percentage,
  NULL, -- stripe_email (novo campo)
  6.0,  -- stripe_fee_percentage (novo campo, padrão 6%)
  1,    -- show_fee_on_invoice (novo campo, padrão mostra)
  is_default, is_active, notes, created_at, updated_at
FROM payment_methods
WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='payment_methods');

-- 3. Deletar tabela antiga (se existir)
DROP TABLE IF EXISTS payment_methods;

-- 4. Renomear nova tabela
ALTER TABLE payment_methods_new RENAME TO payment_methods;

-- 5. Recriar índices
CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX idx_payment_methods_type_currency ON payment_methods(type, currency);
