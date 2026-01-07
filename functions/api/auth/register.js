import { hashPassword, jsonResponse } from '../../utils';

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { email, password } = await request.json();

    if (!email || !password) {
      return jsonResponse({ error: 'Email and password are required' }, 400);
    }

    // Check if user exists
    const { results } = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).all();
    if (results.length > 0) {
      return jsonResponse({ error: 'User already exists' }, 409);
    }

    const passwordHash = await hashPassword(password);

    await env.DB.prepare('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)')
      .bind(email, passwordHash, 'admin')
      .run();

    return jsonResponse({ message: 'User created successfully' }, 201);
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}
