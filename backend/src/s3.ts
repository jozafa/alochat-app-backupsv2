// Client B2 (S3-compatible). Credenciais vêm da config (env como default).

import { GetObjectCommand, HeadBucketCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getConfig, setConfig } from './db.js';

/**
 * Endpoint, região e bucket podem ficar em branco: são descobertos via
 * b2_authorize_account (o bucket só quando a application key é restrita a um bucket)
 * e persistidos na config.
 */
async function ensureS3Config(): Promise<void> {
  if (getConfig('s3_endpoint') && getConfig('s3_region') && getConfig('s3_bucket')) return;
  const keyId = getConfig('s3_access_key_id');
  const secret = getConfig('s3_secret_access_key');
  if (!keyId || !secret) throw new Error('Credenciais B2 não configuradas (Key ID e Application Key)');
  const res = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
    headers: { authorization: 'Basic ' + Buffer.from(`${keyId}:${secret}`).toString('base64') },
  });
  if (!res.ok) {
    throw new Error('Autenticação no Backblaze B2 falhou — verifique Key ID e Application Key');
  }
  const data = (await res.json()) as { s3ApiUrl?: string; allowed?: { bucketName?: string | null } };
  if (!getConfig('s3_endpoint') || !getConfig('s3_region')) {
    if (!data.s3ApiUrl) throw new Error('B2 não retornou o endpoint S3');
    setConfig('s3_endpoint', data.s3ApiUrl);
    setConfig('s3_region', new URL(data.s3ApiUrl).hostname.split('.')[1]);
  }
  if (!getConfig('s3_bucket')) {
    if (!data.allowed?.bucketName) {
      throw new Error('Informe o nome do bucket (a application key não é restrita a um bucket)');
    }
    setConfig('s3_bucket', data.allowed.bucketName);
  }
}

let cached: { client: S3Client; fingerprint: string } | null = null;

function client(): S3Client {
  const fingerprint = [
    getConfig('s3_endpoint'),
    getConfig('s3_region'),
    getConfig('s3_access_key_id'),
    getConfig('s3_secret_access_key'),
  ].join('|');
  if (!cached || cached.fingerprint !== fingerprint) {
    cached = {
      fingerprint,
      client: new S3Client({
        endpoint: getConfig('s3_endpoint'),
        region: getConfig('s3_region'),
        forcePathStyle: true,
        credentials: {
          accessKeyId: getConfig('s3_access_key_id'),
          secretAccessKey: getConfig('s3_secret_access_key'),
        },
      }),
    };
  }
  return cached.client;
}

export async function putObject(key: string, body: Buffer, contentType: string): Promise<void> {
  await ensureS3Config();
  await client().send(
    new PutObjectCommand({ Bucket: getConfig('s3_bucket'), Key: key, Body: body, ContentType: contentType })
  );
}

export async function testS3(): Promise<{ endpoint: string; bucket: string }> {
  await ensureS3Config();
  await client().send(new HeadBucketCommand({ Bucket: getConfig('s3_bucket') }));
  return { endpoint: getConfig('s3_endpoint'), bucket: getConfig('s3_bucket') };
}

export async function getObjectBuffer(key: string): Promise<Buffer> {
  await ensureS3Config();
  const res = await client().send(new GetObjectCommand({ Bucket: getConfig('s3_bucket'), Key: key }));
  return Buffer.from(await res.Body!.transformToByteArray());
}
