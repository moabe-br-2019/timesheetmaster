import { verifyAuth, jsonResponse } from '../../utils';

export async function onRequestPatch(context) {
  const user = await verifyAuth(context.request, context.env);
  if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

  // Only admins can update payment status
  if (user.role !== 'admin') {
    return jsonResponse({ error: 'Forbidden: Only admins can update payment status' }, 403);
  }

  const recordId = context.params.id;

  try {
    const { pago } = await context.request.json();

    // Update payment status only for records owned by the current admin
    const { success } = await context.env.DB.prepare(
      'UPDATE registros SET pago = ? WHERE id = ? AND user_id = ?'
    ).bind(pago ? 1 : 0, recordId, user.id).run();

    if (!success) return jsonResponse({ error: 'Failed to update or record not found' }, 404);

    return jsonResponse({ message: 'Payment status updated' });
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
