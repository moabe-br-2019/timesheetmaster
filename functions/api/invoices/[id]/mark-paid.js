import { verifyAuth, jsonResponse } from '../../../utils';

// POST /api/invoices/[id]/mark-paid - Marcar invoice como paga
export async function onRequestPost(context) {
  const user = await verifyAuth(context.request, context.env);
  if (!user || user.role !== 'admin') {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const invoiceId = context.params.id;

  try {
    // 1. Verificar se a invoice existe e pertence ao usuário
    const { results: invoices } = await context.env.DB.prepare(`
      SELECT id, status FROM invoices WHERE id = ? AND user_id = ?
    `).bind(invoiceId, user.id).all();

    if (invoices.length === 0) {
      return jsonResponse({ error: 'Invoice não encontrada' }, 404);
    }

    const invoice = invoices[0];

    // 2. Verificar se já está paga
    if (invoice.status === 'paid') {
      return jsonResponse({ message: 'Invoice já está marcada como paga' }, 200);
    }

    // 3. Atualizar status da invoice para 'paid'
    await context.env.DB.prepare(`
      UPDATE invoices
      SET status = 'paid', updated_at = ?
      WHERE id = ?
    `).bind(Date.now(), invoiceId).run();

    // 4. Buscar todos os registros vinculados a esta invoice
    const { results: registroIds } = await context.env.DB.prepare(`
      SELECT registro_id FROM invoice_items WHERE invoice_id = ?
    `).bind(invoiceId).all();

    // 5. Marcar todos os registros como pagos
    if (registroIds.length > 0) {
      const updateStatements = registroIds.map(row =>
        context.env.DB.prepare(
          'UPDATE registros SET pago = 1 WHERE id = ?'
        ).bind(row.registro_id)
      );

      await context.env.DB.batch(updateStatements);
    }

    return jsonResponse({
      success: true,
      message: 'Invoice marcada como paga com sucesso',
      registrosAtualizados: registroIds.length
    });

  } catch (err) {
    console.error('Error marking invoice as paid:', err);
    return jsonResponse({ error: err.message }, 500);
  }
}
