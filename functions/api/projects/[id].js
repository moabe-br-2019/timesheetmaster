import { verifyAuth, jsonResponse } from '../../utils';

export async function onRequestPut(context) {
  const user = await verifyAuth(context.request, context.env);
  if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

  // Only admins can edit projects
  if (user.role !== 'admin') {
    return jsonResponse({ error: 'Forbidden: Only admins can edit projects' }, 403);
  }

  const projectId = context.params.id;
  const { nome, valorHora, moeda, atividades } = await context.request.json();

  try {
    const { success } = await context.env.DB.prepare(
      'UPDATE projetos SET nome = ?, valor_hora = ?, moeda = ?, atividades = ? WHERE id = ? AND user_id = ?'
    ).bind(nome, valorHora, moeda, JSON.stringify(atividades), projectId, user.id).run();

    if (!success) return jsonResponse({ error: 'Failed to update or project not found' }, 404);

    return jsonResponse({ message: 'Project updated' });
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
}

export async function onRequestDelete(context) {
  const user = await verifyAuth(context.request, context.env);
  if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

  // Only admins can delete projects
  if (user.role !== 'admin') {
    return jsonResponse({ error: 'Forbidden: Only admins can delete projects' }, 403);
  }

  const projectId = context.params.id;

  try {
    const { success } = await context.env.DB.prepare(
      'DELETE FROM projetos WHERE id = ? AND user_id = ?'
    ).bind(projectId, user.id).run();

    if (!success) return jsonResponse({ error: 'Failed to delete or project not found' }, 404);

    return jsonResponse({ message: 'Project deleted' });
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
}
