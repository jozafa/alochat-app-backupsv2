// Client B2 (S3-compatible). Credenciais vêm da config (env como default).

import { GetObjectCommand, HeadBucketCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getConfig } from './db.js';

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
  await client().send(
    new PutObjectCommand({ Bucket: getConfig('s3_bucket'), Key: key, Body: body, ContentType: contentType })
  );
}

export async function testS3(): Promise<void> {
  await client().send(new HeadBucketCommand({ Bucket: getConfig('s3_bucket') }));
}

export async function getObjectBuffer(key: string): Promise<Buffer> {
  const res = await client().send(new GetObjectCommand({ Bucket: getConfig('s3_bucket'), Key: key }));
  return Buffer.from(await res.Body!.transformToByteArray());
}
