import { verifyAuth, jsonResponse } from '../../utils';

// GET /api/invoices - Listar todas as invoices do admin
export async function onRequestGet(context) {
  const user = await verifyAuth(context.request, context.env);
  if (!user || user.role !== 'admin') {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  try {
    const { results } = await context.env.DB.prepare(`
      SELECT
        id,
        invoice_number,
        client_id,
        client_name,
        client_email,
        status,
        date_from,
        date_to,
        issue_date,
        due_date,
        total_hours,
        currency,
        total_amount,
        created_at,
        updated_at
      FROM invoices
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).bind(user.id).all();

    return jsonResponse(results);
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
}

// POST /api/invoices - Criar nova invoice
export async function onRequestPost(context) {
  const user = await verifyAuth(context.request, context.env);
  if (!user || user.role !== 'admin') {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  try {
    const body = await context.request.json();
    const {
      clientId,
      projectIds,
      dateFrom,
      dateTo,
      issueDate,
      dueDate,
      paymentMethodId,
      companyInfo,
      clientInfo,
      notes,
      status = 'draft'
    } = body;

    // Validações básicas
    if (!projectIds || projectIds.length === 0) {
      return jsonResponse({ error: 'Selecione pelo menos um projeto' }, 400);
    }
    if (!dateFrom || !dateTo) {
      return jsonResponse({ error: 'Período de datas é obrigatório' }, 400);
    }
    if (new Date(dateFrom) > new Date(dateTo)) {
      return jsonResponse({ error: 'Data inicial deve ser anterior à data final' }, 400);
    }

    // Buscar registros não pagos no período e projetos selecionados
    const placeholders = projectIds.map(() => '?').join(',');
    const { results: registros } = await context.env.DB.prepare(`
      SELECT
        r.*
      FROM registros r
      WHERE r.user_id = ?
        AND r.projeto_id IN (${placeholders})
        AND r.data >= ?
        AND r.data <= ?
        AND r.pago = 0
        AND r.id NOT IN (
          SELECT registro_id FROM invoice_items
        )
      ORDER BY r.data ASC
    `).bind(user.id, ...projectIds, dateFrom, dateTo).all();

    if (registros.length === 0) {
      return jsonResponse({
        error: 'Nenhuma atividade não paga encontrada no período e projetos selecionados'
      }, 400);
    }

    // Calcular totais (assume moeda única - primeira moeda encontrada)
    const currency = registros[0].moeda_na_epoca || 'BRL';
    let totalHours = 0;
    let totalAmount = 0;

    registros.forEach(reg => {
      totalHours += Number(reg.horas);
      totalAmount += Number(reg.horas) * (Number(reg.valor_hora_na_epoca) || 0);
    });

    // Gerar número da invoice
    const { results: lastInvoice } = await context.env.DB.prepare(`
      SELECT invoice_number
      FROM invoices
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `).bind(user.id).all();

    let invoiceNumber = 'INV-0001';
    if (lastInvoice.length > 0) {
      const lastNumber = parseInt(lastInvoice[0].invoice_number.split('-')[1]);
      invoiceNumber = `INV-${String(lastNumber + 1).padStart(4, '0')}`;
    }

    // Criar invoice
    const invoiceId = crypto.randomUUID();
    await context.env.DB.prepare(`
      INSERT INTO invoices (
        id, invoice_number, user_id, client_id, status, payment_method_id,
        date_from, date_to, issue_date, due_date,
        total_hours, currency, total_amount,
        company_name, company_address, company_tax_id, company_bank_info,
        client_name, client_email, client_address, client_tax_id,
        notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      invoiceId,
      invoiceNumber,
      user.id,
      clientId || null,
      status,
      paymentMethodId || null,
      dateFrom,
      dateTo,
      issueDate || new Date().toISOString().split('T')[0],
      dueDate || null,
      totalHours,
      currency,
      totalAmount,
      companyInfo?.name || null,
      companyInfo?.address || null,
      companyInfo?.taxId || null,
      companyInfo?.bankInfo || null,
      clientInfo?.name || null,
      clientInfo?.email || null,
      clientInfo?.address || null,
      clientInfo?.taxId || null,
      notes || null
    ).run();

    // Criar invoice_items (relacionar registros com invoice)
    const itemStatements = registros.map(reg =>
      context.env.DB.prepare(
        'INSERT INTO invoice_items (invoice_id, registro_id) VALUES (?, ?)'
      ).bind(invoiceId, reg.id)
    );

    await context.env.DB.batch(itemStatements);

    return jsonResponse({
      id: invoiceId,
      invoiceNumber,
      status,
      totalHours,
      totalAmount,
      currency,
      itemsCount: registros.length
    }, 201);

  } catch (err) {
    console.error('Error creating invoice:', err);
    return jsonResponse({ error: err.message }, 500);
  }
}
