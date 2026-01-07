import { verifyAuth, jsonResponse, hashPassword } from '../../utils';

export async function onRequestGet(context) {
  const user = await verifyAuth(context.request, context.env);
  if (!user || user.role !== 'admin') return jsonResponse({ error: 'Unauthorized' }, 401);

  try {
    // Get all clients
    const { results: clients } = await context.env.DB.prepare("SELECT id, email, created_at FROM users WHERE role = 'client'").all();

    // Get project assignments for each client
    const clientsWithProjects = await Promise.all(clients.map(async (client) => {
      const { results } = await context.env.DB.prepare('SELECT project_id FROM user_projects WHERE user_id = ?').bind(client.id).all();
      return {
        ...client,
        projectIds: results.map(r => r.project_id)
      };
    }));

    return jsonResponse(clientsWithProjects);
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
}

export async function onRequestPost(context) {
  const user = await verifyAuth(context.request, context.env);
  if (!user || user.role !== 'admin') return jsonResponse({ error: 'Unauthorized' }, 401);

  try {
    const { email, password, projectIds } = await context.request.json();

    if (!email || !password) return jsonResponse({ error: 'Email and password required' }, 400);

    // Check if user exists
    const { results } = await context.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).all();
    if (results.length > 0) return jsonResponse({ error: 'User already exists' }, 409);

    const passwordHash = await hashPassword(password);

    // Use batch transaction to ensure atomicity
    // First, insert client and get the ID
    const { meta } = await context.env.DB.prepare("INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'client')")
      .bind(email, passwordHash)
      .run();

    const newClientId = meta.last_row_id;

    // Then, assign projects in a single batch if there are any
    if (projectIds && projectIds.length > 0) {
      // Build all statements for batch execution (atomic operation)
      const statements = projectIds.map(pid =>
        context.env.DB.prepare('INSERT INTO user_projects (user_id, project_id) VALUES (?, ?)').bind(newClientId, pid)
      );

      // Execute all project assignments atomically
      await context.env.DB.batch(statements);
    }

    return jsonResponse({ message: 'Client created', id: newClientId }, 201);
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
}
