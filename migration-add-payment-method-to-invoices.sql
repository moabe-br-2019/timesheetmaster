-- Migração: Adicionar coluna payment_method_id à tabela invoices
-- Esta migração é segura e não afeta dados existentes

-- Adicionar coluna payment_method_id (opcional)
ALTER TABLE invoices ADD COLUMN payment_method_id TEXT;

-- Não criamos a foreign key constraint via ALTER TABLE pois SQLite tem limitações
-- A constraint será respeitada pelo código da aplicação
