-- Migração: Adicionar campo para link de pagamento do Stripe
-- Adiciona campo stripe_payment_link para armazenar link de pagamento gerado no Stripe

-- Adicionar coluna stripe_payment_link
ALTER TABLE invoices ADD COLUMN stripe_payment_link TEXT;

-- Comentário: Campo opcional para armazenar URL de pagamento do Stripe
-- Exemplo: https://buy.stripe.com/test_xxx ou https://checkout.stripe.com/xxx
-- Este campo permite que o link de pagamento seja enviado ao cliente junto com a invoice
