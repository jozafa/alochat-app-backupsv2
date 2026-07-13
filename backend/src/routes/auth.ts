// Gate simples por senha única (APP_PASSWORD) com cookie de sessão em memória.

import { randomUUID } from 'node:crypto';
import type { FastifyInstance, FastifyRequest } from 'fastify';

const sessions = new Set<string>();

export function isAuthenticated(req: FastifyRequest): boolean {
  if (!process.env.APP_PASSWORD) return true;
  const token = req.cookies.session;
  return !!token && sessions.has(token);
}

export async function authRoutes(app: FastifyInstance) {
  app.post('/api/login', async (req, reply) => {
    const { password } = (req.body ?? {}) as { password?: string };
    if (process.env.APP_PASSWORD && password !== process.env.APP_PASSWORD) {
      return reply.code(401).send({ message: 'Senha incorreta' });
    }
    const token = randomUUID();
    sessions.add(token);
    reply.setCookie('session', token, { path: '/', httpOnly: true, sameSite: 'lax' });
    return { ok: true };
  });

  app.post('/api/logout', async (req, reply) => {
    const token = req.cookies.session;
    if (token) sessions.delete(token);
    reply.clearCookie('session', { path: '/' });
    return { ok: true };
  });
}
