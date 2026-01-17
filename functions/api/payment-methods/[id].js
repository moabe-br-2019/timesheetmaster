import { verifyAuth, jsonResponse } from '../../utils';

// GET /api/payment-methods/[id] - Obter detalhes de uma forma de pagamento
export async function onRequestGet(context) {
  const user = await verifyAuth(context.request, context.env);
  if (!user || user.role !== 'admin') {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const paymentMethodId = context.params.id;

  try {
    const { results } = await context.env.DB.prepare(`
      SELECT
        id, name, type, currency,
        pix_key, pix_key_type,
        beneficiary_name, beneficiary_account_number, swift_code,
        bank_name, bank_address,
        intermediary_swift_code, intermediary_bank_name,
        intermediary_bank_address, intermediary_account_number,
        entity_type, entity_name, entity_tax_id,
        paypal_email, paypal_fee_percentage,
        is_default, is_active, notes,
        created_at, updated_at
      FROM payment_methods
      WHERE id = ? AND user_id = ?
    `).bind(paymentMethodId, user.id).all();

    if (results.length === 0) {
      return jsonResponse({ error: 'Forma de pagamento não encontrada' }, 404);
    }

    return jsonResponse(results[0]);

  } catch (err) {
    console.error('Error fetching payment method:', err);
    return jsonResponse({ error: err.message }, 500);
  }
}

// PATCH /api/payment-methods/[id] - Atualizar forma de pagamento
export async function onRequestPatch(context) {
  const user = await verifyAuth(context.request, context.env);
  if (!user || user.role !== 'admin') {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const paymentMethodId = context.params.id;

  try {
    const body = await context.request.json();
    const {
      name,
      pixKey,
      pixKeyType,
      beneficiaryName,
      beneficiaryAccountNumber,
      swiftCode,
      bankName,
      bankAddress,
      intermediarySwiftCode,
      intermediaryBankName,
      intermediaryBankAddress,
      intermediaryAccountNumber,
      entityType,
      entityName,
      entityTaxId,
      paypalEmail,
      paypalFeePercentage,
      isDefault,
      isActive,
      notes
    } = body;

    // Verificar se a forma de pagamento existe e pertence ao usuário
    const { results: existing } = await context.env.DB.prepare(`
      SELECT id, type FROM payment_methods WHERE id = ? AND user_id = ?
    `).bind(paymentMethodId, user.id).all();

    if (existing.length === 0) {
      return jsonResponse({ error: 'Forma de pagamento não encontrada' }, 404);
    }

    const now = Math.floor(Date.now() / 1000);

    // Se esta forma de pagamento for marcada como padrão, desmarcar as outras
    if (isDefault) {
      await context.env.DB.prepare(`
        UPDATE payment_methods
        SET is_default = 0
        WHERE user_id = ? AND id != ?
      `).bind(user.id, paymentMethodId).run();
    }

    // Atualizar forma de pagamento
    await context.env.DB.prepare(`
      UPDATE payment_methods
      SET
        name = COALESCE(?, name),
        pix_key = COALESCE(?, pix_key),
        pix_key_type = COALESCE(?, pix_key_type),
        beneficiary_name = COALESCE(?, beneficiary_name),
        beneficiary_account_number = COALESCE(?, beneficiary_account_number),
        swift_code = COALESCE(?, swift_code),
        bank_name = COALESCE(?, bank_name),
        bank_address = COALESCE(?, bank_address),
        intermediary_swift_code = COALESCE(?, intermediary_swift_code),
        intermediary_bank_name = COALESCE(?, intermediary_bank_name),
        intermediary_bank_address = COALESCE(?, intermediary_bank_address),
        intermediary_account_number = COALESCE(?, intermediary_account_number),
        entity_type = COALESCE(?, entity_type),
        entity_name = COALESCE(?, entity_name),
        entity_tax_id = COALESCE(?, entity_tax_id),
        paypal_email = COALESCE(?, paypal_email),
        paypal_fee_percentage = COALESCE(?, paypal_fee_percentage),
        is_default = COALESCE(?, is_default),
        is_active = COALESCE(?, is_active),
        notes = COALESCE(?, notes),
        updated_at = ?
      WHERE id = ? AND user_id = ?
    `).bind(
      name !== undefined ? name : null,
      pixKey !== undefined ? pixKey : null,
      pixKeyType !== undefined ? pixKeyType : null,
      beneficiaryName !== undefined ? beneficiaryName : null,
      beneficiaryAccountNumber !== undefined ? beneficiaryAccountNumber : null,
      swiftCode !== undefined ? swiftCode : null,
      bankName !== undefined ? bankName : null,
      bankAddress !== undefined ? bankAddress : null,
      intermediarySwiftCode !== undefined ? intermediarySwiftCode : null,
      intermediaryBankName !== undefined ? intermediaryBankName : null,
      intermediaryBankAddress !== undefined ? intermediaryBankAddress : null,
      intermediaryAccountNumber !== undefined ? intermediaryAccountNumber : null,
      entityType !== undefined ? entityType : null,
      entityName !== undefined ? entityName : null,
      entityTaxId !== undefined ? entityTaxId : null,
      paypalEmail !== undefined ? paypalEmail : null,
      paypalFeePercentage !== undefined ? paypalFeePercentage : null,
      isDefault !== undefined ? (isDefault ? 1 : 0) : null,
      isActive !== undefined ? (isActive ? 1 : 0) : null,
      notes !== undefined ? notes : null,
      now,
      paymentMethodId,
      user.id
    ).run();

    return jsonResponse({ message: 'Forma de pagamento atualizada com sucesso' });

  } catch (err) {
    console.error('Error updating payment method:', err);
    return jsonResponse({ error: err.message }, 500);
  }
}

// DELETE /api/payment-methods/[id] - Deletar forma de pagamento
export async function onRequestDelete(context) {
  const user = await verifyAuth(context.request, context.env);
  if (!user || user.role !== 'admin') {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const paymentMethodId = context.params.id;

  try {
    // Verificar se a forma de pagamento existe e pertence ao usuário
    const { results: existing } = await context.env.DB.prepare(`
      SELECT id FROM payment_methods WHERE id = ? AND user_id = ?
    `).bind(paymentMethodId, user.id).all();

    if (existing.length === 0) {
      return jsonResponse({ error: 'Forma de pagamento não encontrada' }, 404);
    }

    // Soft delete: marcar como inativa ao invés de deletar
    await context.env.DB.prepare(`
      UPDATE payment_methods
      SET is_active = 0, updated_at = ?
      WHERE id = ? AND user_id = ?
    `).bind(Math.floor(Date.now() / 1000), paymentMethodId, user.id).run();

    return jsonResponse({ message: 'Forma de pagamento desativada com sucesso' });

  } catch (err) {
    console.error('Error deleting payment method:', err);
    return jsonResponse({ error: err.message }, 500);
  }
}
