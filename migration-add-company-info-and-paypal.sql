-- Migração: Adicionar dados PF/PJ e suporte ao PayPal

-- Adicionar campos para dados da empresa/pessoa
ALTER TABLE payment_methods ADD COLUMN entity_type TEXT; -- 'pf' ou 'pj'
ALTER TABLE payment_methods ADD COLUMN entity_name TEXT; -- Nome completo (PF) ou Razão Social (PJ)
ALTER TABLE payment_methods ADD COLUMN entity_tax_id TEXT; -- CPF (PF) ou CNPJ (PJ)

-- Adicionar campos para PayPal
ALTER TABLE payment_methods ADD COLUMN paypal_email TEXT;
ALTER TABLE payment_methods ADD COLUMN paypal_fee_percentage REAL; -- Taxa em % (ex: 6.0 para 6%)

-- Adicionar payment_method_id padrão aos usuários (clientes)
ALTER TABLE users ADD COLUMN default_payment_method_id TEXT;
