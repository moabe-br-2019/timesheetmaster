import { verifyAuth, jsonResponse } from '../../../utils';

// POST /api/invoices/[id]/mark-paid - Marcar invoice como paga
export async function onRequestPost(context) {
  const user = await verifyAuth(context.request, context.env);
  if (!user || user.role !== 'admin') {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const invoiceId = context.params.id;

  try {
    // Verificar se invoice existe e pertence ao usuário
    const { results: invoices } = await context.env.DB.prepare(`
      SELECT id, status FROM invoices WHERE id = ? AND user_id = ?
    `).bind(invoiceId, user.id).all();

    if (invoices.length === 0) {
      return jsonResponse({ error: 'Invoice not found' }, 404);
    }

    if (invoices[0].status === 'paid') {
      return jsonResponse({ message: 'Invoice já está marcada como paga' });
    }

    // Usar transação para garantir atomicidade
    const statements = [
      // 1. Atualizar status da invoice
      context.env.DB.prepare(`
        UPDATE invoices
        SET status = 'paid', updated_at = ?
        WHERE id = ?
      `).bind(Math.floor(Date.now() / 1000), invoiceId),

      // 2. Marcar todos registros associados como pagos
      context.env.DB.prepare(`
        UPDATE registros
        SET pago = 1
        WHERE id IN (
          SELECT registro_id
          FROM invoice_items
          WHERE invoice_id = ?
        )
      `).bind(invoiceId)
    ];

    await context.env.DB.batch(statements);

    return jsonResponse({ message: 'Invoice marcada como paga com sucesso' });

  } catch (err) {
    console.error('Error marking invoice as paid:', err);
    return jsonResponse({ error: err.message }, 500);
  }
}
