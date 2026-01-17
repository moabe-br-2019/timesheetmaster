import { verifyAuth, jsonResponse } from '../../utils';

// GET /api/settings/company - Obter configurações da empresa
export async function onRequestGet(context) {
  const user = await verifyAuth(context.request, context.env);
  if (!user || user.role !== 'admin') {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  try {
    const { results } = await context.env.DB.prepare(`
      SELECT * FROM company_settings WHERE user_id = ?
    `).bind(user.id).all();

    if (results.length === 0) {
      return jsonResponse({
        companyName: '',
        companyAddress: '',
        companyTaxId: '',
        companyEmail: '',
        companyPhone: '',
        companyBankInfo: ''
      });
    }

    return jsonResponse({
      companyName: results[0].company_name || '',
      companyAddress: results[0].company_address || '',
      companyTaxId: results[0].company_tax_id || '',
      companyEmail: results[0].company_email || '',
      companyPhone: results[0].company_phone || '',
      companyBankInfo: results[0].company_bank_info || ''
    });

  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
}

// PUT /api/settings/company - Atualizar configurações da empresa
export async function onRequestPut(context) {
  const user = await verifyAuth(context.request, context.env);
  if (!user || user.role !== 'admin') {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  try {
    const body = await context.request.json();
    const {
      companyName,
      companyAddress,
      companyTaxId,
      companyEmail,
      companyPhone,
      companyBankInfo
    } = body;

    // Verificar se já existe registro
    const { results } = await context.env.DB.prepare(`
      SELECT user_id FROM company_settings WHERE user_id = ?
    `).bind(user.id).all();

    const now = Math.floor(Date.now() / 1000);

    if (results.length === 0) {
      // INSERT
      await context.env.DB.prepare(`
        INSERT INTO company_settings (
          user_id, company_name, company_address, company_tax_id,
          company_email, company_phone, company_bank_info, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        user.id,
        companyName || null,
        companyAddress || null,
        companyTaxId || null,
        companyEmail || null,
        companyPhone || null,
        companyBankInfo || null,
        now
      ).run();
    } else {
      // UPDATE
      await context.env.DB.prepare(`
        UPDATE company_settings
        SET company_name = ?,
            company_address = ?,
            company_tax_id = ?,
            company_email = ?,
            company_phone = ?,
            company_bank_info = ?,
            updated_at = ?
        WHERE user_id = ?
      `).bind(
        companyName || null,
        companyAddress || null,
        companyTaxId || null,
        companyEmail || null,
        companyPhone || null,
        companyBankInfo || null,
        now,
        user.id
      ).run();
    }

    return jsonResponse({ message: 'Configurações salvas com sucesso' });

  } catch (err) {
    console.error('Error saving company settings:', err);
    return jsonResponse({ error: err.message }, 500);
  }
}
