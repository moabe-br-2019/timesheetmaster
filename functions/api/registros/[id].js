import { verifyAuth, jsonResponse } from '../../utils';

export async function onRequestPatch(context) {
  const user = await verifyAuth(context.request, context.env);
  if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

  // Only admins can update records
  if (user.role !== 'admin') {
    return jsonResponse({ error: 'Forbidden: Only admins can update records' }, 403);
  }

  const recordId = context.params.id;

  try {
    const body = await context.request.json();
    
    // Check if it's just a payment status update or full edit
    if (body.pago !== undefined && Object.keys(body).length === 1) {
      // Quick payment toggle
      const { success } = await context.env.DB.prepare(
        'UPDATE registros SET pago = ? WHERE id = ? AND user_id = ?'
      ).bind(body.pago ? 1 : 0, recordId, user.id).run();

      if (!success) return jsonResponse({ error: 'Failed to update or record not found' }, 404);

      return jsonResponse({ message: 'Payment status updated' });
    }
    
    // Full record edit
    const { data, projetoId, atividade, descricao, horas, valorHoraNaEpoca, moedaNaEpoca, projetoNome } = body;
    
    if (!data || !projetoId || !atividade || horas === undefined) {
      return jsonResponse({ error: 'Missing required fields' }, 400);
    }

    const { success } = await context.env.DB.prepare(
      'UPDATE registros SET data = ?, projeto_id = ?, atividade = ?, descricao = ?, horas = ?, valor_hora_na_epoca = ?, moeda_na_epoca = ?, projeto_nome = ? WHERE id = ? AND user_id = ?'
    ).bind(data, projetoId, atividade, descricao || '', horas, valorHoraNaEpoca, moedaNaEpoca, projetoNome, recordId, user.id).run();

    if (!success) return jsonResponse({ error: 'Failed to update or record not found' }, 404);

    return jsonResponse({ message: 'Record updated successfully' });
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
}

export async function onRequestDelete(context) {
  const user = await verifyAuth(context.request, context.env);
  if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

  // Only admins can delete records
  if (user.role !== 'admin') {
    return jsonResponse({ error: 'Forbidden: Only admins can delete records' }, 403);
  }

  const recordId = context.params.id;

  try {
    const { success } = await context.env.DB.prepare(
      'DELETE FROM registros WHERE id = ? AND user_id = ?'
    ).bind(recordId, user.id).run();

    if (!success) return jsonResponse({ error: 'Failed to delete or record not found' }, 404);

    return jsonResponse({ message: 'Record deleted' });
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
}
