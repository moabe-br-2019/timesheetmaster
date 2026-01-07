import { verifyAuth, jsonResponse, hashPassword, verifyPassword } from '../../utils';

export async function onRequestPost(context) {
  const user = await verifyAuth(context.request, context.env);
  if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

  try {
    const { currentPassword, newPassword, targetUserId } = await context.request.json();

    // Admin changing another user's password
    if (targetUserId && user.role === 'admin') {
      if (!newPassword || newPassword.length < 6) {
        return jsonResponse({ error: 'Nova senha deve ter pelo menos 6 caracteres' }, 400);
      }

      // Verify that target user exists and is a client (not another admin)
      const { results } = await context.env.DB.prepare(
        'SELECT role FROM users WHERE id = ?'
      ).bind(targetUserId).all();

      if (results.length === 0) {
        return jsonResponse({ error: 'Usuário não encontrado' }, 404);
      }

      if (results[0].role !== 'client') {
        return jsonResponse({ error: 'Admin só pode alterar senha de clientes' }, 403);
      }

      const newPasswordHash = await hashPassword(newPassword);

      const { success } = await context.env.DB.prepare(
        'UPDATE users SET password_hash = ? WHERE id = ?'
      ).bind(newPasswordHash, targetUserId).run();

      if (!success) {
        return jsonResponse({ error: 'Erro ao atualizar senha' }, 500);
      }

      return jsonResponse({ message: 'Senha alterada com sucesso' });
    }

    // User changing their own password
    if (!currentPassword || !newPassword) {
      return jsonResponse({ error: 'Senha atual e nova senha são obrigatórias' }, 400);
    }

    if (newPassword.length < 6) {
      return jsonResponse({ error: 'Nova senha deve ter pelo menos 6 caracteres' }, 400);
    }

    // Verify current password
    const { results } = await context.env.DB.prepare(
      'SELECT password_hash FROM users WHERE id = ?'
    ).bind(user.id).all();

    if (results.length === 0) {
      return jsonResponse({ error: 'Usuário não encontrado' }, 404);
    }

    const isValid = await verifyPassword(currentPassword, results[0].password_hash);
    if (!isValid) {
      return jsonResponse({ error: 'Senha atual incorreta' }, 401);
    }

    // Update password
    const newPasswordHash = await hashPassword(newPassword);

    const { success } = await context.env.DB.prepare(
      'UPDATE users SET password_hash = ? WHERE id = ?'
    ).bind(newPasswordHash, user.id).run();

    if (!success) {
      return jsonResponse({ error: 'Erro ao atualizar senha' }, 500);
    }

    return jsonResponse({ message: 'Senha alterada com sucesso' });
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
}
