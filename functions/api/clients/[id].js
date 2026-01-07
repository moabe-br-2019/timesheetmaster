import { verifyAuth, jsonResponse } from '../../utils';

export async function onRequestPut(context) {
  const user = await verifyAuth(context.request, context.env);
  if (!user || user.role !== 'admin') return jsonResponse({ error: 'Unauthorized' }, 401);

  const clientId = context.params.id;
  const { projectIds } = await context.request.json();

  try {
    // Use batch transaction to ensure atomicity (delete + inserts in single transaction)
    const statements = [
      context.env.DB.prepare('DELETE FROM user_projects WHERE user_id = ?').bind(clientId)
    ];

    if (projectIds && projectIds.length > 0) {
      // Add all insert statements to the batch
      projectIds.forEach(pid => {
        statements.push(
          context.env.DB.prepare('INSERT INTO user_projects (user_id, project_id) VALUES (?, ?)').bind(clientId, pid)
        );
      });
    }

    // Execute all operations atomically (all succeed or all fail)
    await context.env.DB.batch(statements);

    return jsonResponse({ message: 'Client updated' });
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
}

export async function onRequestDelete(context) {
  const user = await verifyAuth(context.request, context.env);
  if (!user || user.role !== 'admin') return jsonResponse({ error: 'Unauthorized' }, 401);

  const clientId = context.params.id;

  try {
    // Verify that the user being deleted is actually a client (not another admin)
    const { results } = await context.env.DB.prepare(
      'SELECT role FROM users WHERE id = ?'
    ).bind(clientId).all();

    if (results.length === 0) {
      return jsonResponse({ error: 'User not found' }, 404);
    }

    if (results[0].role !== 'client') {
      return jsonResponse({ error: 'Cannot delete admin users via this endpoint' }, 403);
    }

    // Delete the client (CASCADE will remove user_projects associations)
    await context.env.DB.prepare('DELETE FROM users WHERE id = ?').bind(clientId).run();
    return jsonResponse({ message: 'Client deleted' });
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
}
