-- Schema para sistema de formas de pagamento
-- Suporta pagamentos brasileiros (PIX), internacionais (transferência bancária) e PayPal

CREATE TABLE IF NOT EXISTS payment_methods (
  id TEXT PRIMARY KEY,                           -- UUID
  user_id INTEGER NOT NULL,                      -- Admin que criou
  name TEXT NOT NULL,                            -- Nome descritivo (ex: "PIX Principal", "Bank Transfer USD", "PayPal")
  type TEXT NOT NULL CHECK(type IN ('pix', 'international', 'paypal', 'stripe')), -- Tipo de pagamento
  currency TEXT NOT NULL,                        -- BRL para PIX, USD para internacional/PayPal

  -- Campos para PIX (Brasil)
  pix_key TEXT,                                  -- Chave PIX (CPF, CNPJ, email, telefone, ou aleatória)
  pix_key_type TEXT,                             -- Tipo da chave: 'cpf', 'cnpj', 'email', 'phone', 'random'

  -- Campos para pagamentos internacionais
  beneficiary_name TEXT,                         -- Nome do beneficiário
  beneficiary_account_number TEXT,               -- IBAN ou número da conta
  swift_code TEXT,                               -- SWIFT/BIC code
  bank_name TEXT,                                -- Nome do banco
  bank_address TEXT,                             -- Endereço do banco

  -- Campos opcionais para banco intermediário
  intermediary_swift_code TEXT,                  -- SWIFT do banco intermediário
  intermediary_bank_name TEXT,                   -- Nome do banco intermediário
  intermediary_bank_address TEXT,                -- Endereço do banco intermediário
  intermediary_account_number TEXT,              -- Número da conta no banco intermediário

  -- Dados da entidade (PF/PJ)
  entity_type TEXT,                              -- 'pf' ou 'pj'
  entity_name TEXT,                              -- Nome completo (PF) ou Razão Social (PJ)
  entity_tax_id TEXT,                            -- CPF (PF) ou CNPJ (PJ)

  -- Campos para PayPal
  paypal_email TEXT,                             -- Email PayPal
  paypal_fee_percentage REAL,                    -- Taxa em % (ex: 6.0 para 6%)

  -- Campos para Stripe
  stripe_email TEXT,                             -- Email da conta Stripe
  stripe_fee_percentage REAL DEFAULT 6.0,        -- Taxa padrão 6%
  show_fee_on_invoice INTEGER DEFAULT 1,         -- 1 = mostra taxa na invoice, 0 = não mostra

  -- Metadata
  is_default INTEGER DEFAULT 0,                  -- 1 se for forma de pagamento padrão
  is_active INTEGER DEFAULT 1,                   -- 1 se ativo, 0 se desativado
  notes TEXT,                                    -- Observações adicionais
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índice para busca rápida por usuário
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);

-- Índice para busca por tipo e moeda
CREATE INDEX IF NOT EXISTS idx_payment_methods_type_currency ON payment_methods(type, currency);
