import { verifyAuth, jsonResponse } from '../../utils';

// GET /api/payment-methods - Listar formas de pagamento
export async function onRequestGet(context) {
  const user = await verifyAuth(context.request, context.env);
  if (!user || user.role !== 'admin') {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

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
      WHERE user_id = ? AND is_active = 1
      ORDER BY is_default DESC, created_at DESC
    `).bind(user.id).all();

    return jsonResponse(results);

  } catch (err) {
    console.error('Error fetching payment methods:', err);
    return jsonResponse({ error: err.message }, 500);
  }
}

// POST /api/payment-methods - Criar nova forma de pagamento
export async function onRequestPost(context) {
  const user = await verifyAuth(context.request, context.env);
  if (!user || user.role !== 'admin') {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  try {
    const body = await context.request.json();
    const {
      name,
      type,
      currency,
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
      notes
    } = body;

    // Validações básicas
    if (!name || !type || !currency) {
      return jsonResponse({ error: 'Nome, tipo e moeda são obrigatórios' }, 400);
    }

    if (!['pix', 'international', 'paypal'].includes(type)) {
      return jsonResponse({ error: 'Tipo deve ser "pix", "international" ou "paypal"' }, 400);
    }

    if (type === 'pix' && currency !== 'BRL') {
      return jsonResponse({ error: 'PIX só pode ser usado com BRL' }, 400);
    }

    if (type === 'international' && currency !== 'USD') {
      return jsonResponse({ error: 'Pagamentos internacionais devem usar USD' }, 400);
    }

    if (type === 'paypal' && currency !== 'USD') {
      return jsonResponse({ error: 'PayPal deve usar USD' }, 400);
    }

    if (type === 'pix' && !pixKey) {
      return jsonResponse({ error: 'Chave PIX é obrigatória para pagamentos PIX' }, 400);
    }

    if (type === 'international' && (!beneficiaryName || !beneficiaryAccountNumber || !swiftCode || !bankName)) {
      return jsonResponse({ error: 'Dados bancários completos são obrigatórios para pagamentos internacionais' }, 400);
    }

    if (type === 'paypal' && !paypalEmail) {
      return jsonResponse({ error: 'Email PayPal é obrigatório' }, 400);
    }

    const now = Math.floor(Date.now() / 1000);
    const id = crypto.randomUUID();

    // Se esta forma de pagamento for marcada como padrão, desmarcar as outras
    if (isDefault) {
      await context.env.DB.prepare(`
        UPDATE payment_methods
        SET is_default = 0
        WHERE user_id = ?
      `).bind(user.id).run();
    }

    // Inserir nova forma de pagamento
    await context.env.DB.prepare(`
      INSERT INTO payment_methods (
        id, user_id, name, type, currency,
        pix_key, pix_key_type,
        beneficiary_name, beneficiary_account_number, swift_code,
        bank_name, bank_address,
        intermediary_swift_code, intermediary_bank_name,
        intermediary_bank_address, intermediary_account_number,
        entity_type, entity_name, entity_tax_id,
        paypal_email, paypal_fee_percentage,
        is_default, is_active, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,                                  // 1
      user.id,                             // 2
      name,                                // 3
      type,                                // 4
      currency,                            // 5
      pixKey || null,                      // 6
      pixKeyType || null,                  // 7
      beneficiaryName || null,             // 8
      beneficiaryAccountNumber || null,    // 9
      swiftCode || null,                   // 10
      bankName || null,                    // 11
      bankAddress || null,                 // 12
      intermediarySwiftCode || null,       // 13
      intermediaryBankName || null,        // 14
      intermediaryBankAddress || null,     // 15
      intermediaryAccountNumber || null,   // 16
      entityType || null,                  // 17
      entityName || null,                  // 18
      entityTaxId || null,                 // 19
      paypalEmail || null,                 // 20
      paypalFeePercentage || null,         // 21
      isDefault ? 1 : 0,                   // 22
      1,                                   // 23 - is_active
      notes || null,                       // 24
      now,                                 // 25 - created_at
      now                                  // 26 - updated_at
    ).run();

    return jsonResponse({
      message: 'Forma de pagamento criada com sucesso',
      id
    }, 201);

  } catch (err) {
    console.error('Error creating payment method:', err);
    return jsonResponse({ error: err.message }, 500);
  }
}
