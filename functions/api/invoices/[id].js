import { verifyAuth, jsonResponse } from '../../utils';

// GET /api/invoices/[id] - Obter detalhes de uma invoice
export async function onRequestGet(context) {
  const user = await verifyAuth(context.request, context.env);
  if (!user || user.role !== 'admin') {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const invoiceId = context.params.id;

  try {
    // Buscar invoice
    const { results: invoices } = await context.env.DB.prepare(`
      SELECT * FROM invoices
      WHERE id = ? AND user_id = ?
    `).bind(invoiceId, user.id).all();

    if (invoices.length === 0) {
      return jsonResponse({ error: 'Invoice not found' }, 404);
    }

    const invoice = invoices[0];

    // Buscar forma de pagamento se existir
    let paymentMethod = null;
    if (invoice.payment_method_id) {
      const { results: pmResults } = await context.env.DB.prepare(`
        SELECT * FROM payment_methods WHERE id = ?
      `).bind(invoice.payment_method_id).all();

      if (pmResults.length > 0) {
        paymentMethod = pmResults[0];
      }
    }

    // Buscar itens da invoice (registros)
    const { results: items } = await context.env.DB.prepare(`
      SELECT r.*
      FROM registros r
      JOIN invoice_items ii ON r.id = ii.registro_id
      WHERE ii.invoice_id = ?
      ORDER BY r.data ASC
    `).bind(invoiceId).all();

    return jsonResponse({
      ...invoice,
      payment_method: paymentMethod,
      items
    });

  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
}

// PATCH /api/invoices/[id] - Atualizar invoice
export async function onRequestPatch(context) {
  const user = await verifyAuth(context.request, context.env);
  if (!user || user.role !== 'admin') {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const invoiceId = context.params.id;

  try {
    const body = await context.request.json();
    const { status, notes, dueDate, issueDate, paymentMethodId, stripePaymentLink } = body;

    // Verificar se invoice existe e pertence ao usuário
    const { results: invoices } = await context.env.DB.prepare(`
      SELECT * FROM invoices WHERE id = ? AND user_id = ?
    `).bind(invoiceId, user.id).all();

    if (invoices.length === 0) {
      return jsonResponse({ error: 'Invoice not found' }, 404);
    }

    // Não permitir editar campos críticos se invoice está paga (exceto notes e stripePaymentLink)
    if (invoices[0].status === 'paid') {
      if (status && status !== 'paid') {
        return jsonResponse({ error: 'Não é possível alterar status de invoice já paga' }, 400);
      }
      if (issueDate || dueDate || paymentMethodId) {
        return jsonResponse({
          error: 'Não é possível alterar datas ou payment method de invoice paga'
        }, 400);
      }
    }

    // Validar datas se fornecidas
    if (issueDate && !/^\d{4}-\d{2}-\d{2}$/.test(issueDate)) {
      return jsonResponse({ error: 'Data de emissão inválida (formato: YYYY-MM-DD)' }, 400);
    }

    if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      return jsonResponse({ error: 'Data de vencimento inválida (formato: YYYY-MM-DD)' }, 400);
    }

    // Validar payment method se fornecido
    if (paymentMethodId) {
      const { results: pmResults } = await context.env.DB.prepare(`
        SELECT id FROM payment_methods WHERE id = ? AND user_id = ?
      `).bind(paymentMethodId, user.id).all();

      if (pmResults.length === 0) {
        return jsonResponse({ error: 'Payment method não encontrado' }, 404);
      }
    }

    // Validar link Stripe se fornecido
    if (stripePaymentLink && stripePaymentLink !== '') {
      try {
        const url = new URL(stripePaymentLink);
        if (!url.hostname.includes('stripe.com')) {
          return jsonResponse({
            error: 'Link Stripe deve ser um URL do domínio stripe.com'
          }, 400);
        }
      } catch {
        return jsonResponse({ error: 'Link Stripe inválido (deve ser uma URL válida)' }, 400);
      }
    }

    // Montar query dinâmica
    const updates = [];
    const values = [];

    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      values.push(notes);
    }
    if (dueDate !== undefined) {
      updates.push('due_date = ?');
      values.push(dueDate);
    }
    if (issueDate !== undefined) {
      updates.push('issue_date = ?');
      values.push(issueDate);
    }
    if (paymentMethodId !== undefined) {
      updates.push('payment_method_id = ?');
      values.push(paymentMethodId);
    }
    if (stripePaymentLink !== undefined) {
      updates.push('stripe_payment_link = ?');
      values.push(stripePaymentLink || null); // Permitir limpar o campo enviando string vazia
    }

    updates.push('updated_at = ?');
    values.push(Math.floor(Date.now() / 1000));

    values.push(invoiceId);
    values.push(user.id);

    await context.env.DB.prepare(`
      UPDATE invoices
      SET ${updates.join(', ')}
      WHERE id = ? AND user_id = ?
    `).bind(...values).run();

    return jsonResponse({ message: 'Invoice updated successfully' });

  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
}

// DELETE /api/invoices/[id] - Deletar invoice
export async function onRequestDelete(context) {
  const user = await verifyAuth(context.request, context.env);
  if (!user || user.role !== 'admin') {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const invoiceId = context.params.id;

  try {
    // Verificar se invoice existe e pertence ao usuário
    const { results: invoices } = await context.env.DB.prepare(`
      SELECT status FROM invoices WHERE id = ? AND user_id = ?
    `).bind(invoiceId, user.id).all();

    if (invoices.length === 0) {
      return jsonResponse({ error: 'Invoice not found' }, 404);
    }

    // Apenas permitir deletar se status for 'draft' ou 'cancelled'
    if (invoices[0].status !== 'draft' && invoices[0].status !== 'cancelled') {
      return jsonResponse({
        error: 'Apenas invoices com status "Rascunho" ou "Cancelada" podem ser deletadas'
      }, 400);
    }

    // Deletar invoice (CASCADE vai deletar invoice_items automaticamente)
    await context.env.DB.prepare(`
      DELETE FROM invoices WHERE id = ? AND user_id = ?
    `).bind(invoiceId, user.id).run();

    return jsonResponse({ message: 'Invoice deleted successfully' });

  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
}
