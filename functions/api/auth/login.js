import { verifyPassword, generateToken, jsonResponse } from '../../utils';

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { email, password } = await request.json();

    if (!email || !password) {
      return jsonResponse({ error: 'Email and password are required' }, 400);
    }

    const { results } = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).all();
    const user = results[0];

    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return jsonResponse({ error: 'Invalid credentials' }, 401);
    }

    const token = await generateToken({ id: user.id, email: user.email, role: user.role }, env);

    return jsonResponse({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}
