import { verifyAuth, jsonResponse } from '../../utils';

export async function onRequestGet(context) {
  const user = await verifyAuth(context.request, context.env);
  if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

  try {
    let query;
    let params;

    if (user.role === 'client') {
       query = `
        SELECT r.* 
        FROM registros r
        JOIN user_projects up ON r.projeto_id = up.project_id
        WHERE up.user_id = ?
        ORDER BY r.data DESC, r.created_at DESC
      `;
      params = [user.id];
    } else {
      query = 'SELECT * FROM registros WHERE user_id = ? ORDER BY data DESC, created_at DESC';
      params = [user.id];
    }

    const { results } = await context.env.DB.prepare(query).bind(...params).all();

    const records = results.map(r => ({
      ...r,
      horas: r.horas, // Ensure horas is mapped
      valorHoraNaEpoca: r.valor_hora_na_epoca,
      moedaNaEpoca: r.moeda_na_epoca,
      projetoNome: r.projeto_nome,
      projetoId: r.projeto_id,
      pago: r.pago === 1 // Convert 0/1 to boolean
    }));

    return jsonResponse(records);
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
}

export async function onRequestPost(context) {
  const user = await verifyAuth(context.request, context.env);
  if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

  // Only admins can create records (log time worked)
  if (user.role !== 'admin') {
    return jsonResponse({ error: 'Forbidden: Only admins can log time' }, 403);
  }

  try {
    const { id, projetoId, atividade, descricao, hours, data, valorHoraNaEpoca, moedaNaEpoca, projetoNome, pago } = await context.request.json();

    // CRITICAL SECURITY: Verify admin can only create records for their own projects
    const { results } = await context.env.DB.prepare(
      'SELECT id FROM projetos WHERE id = ? AND user_id = ?'
    ).bind(projetoId, user.id).all();

    if (results.length === 0) {
      return jsonResponse({ error: 'Forbidden: You can only log time on your own projects' }, 403);
    }

    await context.env.DB.prepare(
      `INSERT INTO registros (id, user_id, projeto_id, atividade, descricao, horas, data, valor_hora_na_epoca, moeda_na_epoca, projeto_nome, pago)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, user.id, projetoId, atividade, descricao, hours, data, valorHoraNaEpoca, moedaNaEpoca, projetoNome, pago ? 1 : 0).run();

    return jsonResponse({ message: 'Record created' }, 201);
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
}
