import { verifyAuth, jsonResponse } from '../../utils';

export async function onRequestGet(context) {
  const user = await verifyAuth(context.request, context.env);
  if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

  try {
    let results;

    if (user.role === 'client') {
      // Clients see only assigned projects
      const { results: clientProjects } = await context.env.DB.prepare(`
        SELECT p.*
        FROM projetos p
        JOIN user_projects up ON p.id = up.project_id
        WHERE up.user_id = ?
      `).bind(user.id).all();
      results = clientProjects;
    } else {
      // Admins see their own projects
      const { results: adminProjects } = await context.env.DB.prepare('SELECT * FROM projetos WHERE user_id = ?')
        .bind(user.id)
        .all();
      results = adminProjects;
    }
    
    // Parse JSON string back to array
    const projects = results.map(p => ({
      ...p,
      valorHora: p.valor_hora,
      atividades: JSON.parse(p.atividades)
    }));

    return jsonResponse(projects);
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
}

export async function onRequestPost(context) {
  const user = await verifyAuth(context.request, context.env);
  if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

  // Only admins can create projects
  if (user.role !== 'admin') {
    return jsonResponse({ error: 'Forbidden: Only admins can create projects' }, 403);
  }

  try {
    const { id, nome, valorHora, moeda, atividades } = await context.request.json();

    await context.env.DB.prepare(
      'INSERT INTO projetos (id, user_id, nome, valor_hora, moeda, atividades) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(id, user.id, nome, valorHora, moeda, JSON.stringify(atividades)).run();

    return jsonResponse({ message: 'Project created' }, 201);
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
}
