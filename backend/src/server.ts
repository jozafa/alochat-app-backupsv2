import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Fastify from 'fastify';
import fastifyCookie from '@fastify/cookie';
import fastifyStatic from '@fastify/static';
import { markStaleJobs } from './db.js';
import { startScheduler } from './scheduler.js';
import { authRoutes } from './routes/auth.js';
import { apiRoutes } from './routes/api.js';
import { filesRoutes } from './routes/files.js';

const app = Fastify({ logger: true });

await app.register(fastifyCookie);
await app.register(authRoutes);
await app.register(apiRoutes);
await app.register(filesRoutes);

const frontendDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../frontend/dist');
if (existsSync(frontendDist)) {
  await app.register(fastifyStatic, { root: frontendDist });
  app.setNotFoundHandler((req, reply) => {
    if (req.url.startsWith('/api/')) return reply.code(404).send({ message: 'Não encontrado' });
    return reply.sendFile('index.html');
  });
} else {
  app.log.warn({ frontendDist }, 'frontend/dist não encontrado; servindo apenas a API');
}

if (!process.env.APP_PASSWORD) {
  app.log.warn('APP_PASSWORD não definida — UI sem senha');
}

markStaleJobs();
startScheduler(app.log);

await app.listen({ port: Number(process.env.PORT) || 8080, host: '0.0.0.0' });
