import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { env } from "@/lib/env";

// Cloudflare R2 is S3-compatible. Point the AWS SDK at the R2 endpoint,
// pass a fixed "auto" region, and everything else works like S3.
let _client: S3Client | null = null;
export function getR2(): S3Client {
  if (_client) return _client;
  _client = new S3Client({
    region: "auto",
    endpoint: `https://${env.r2.accountId()}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.r2.accessKeyId(),
      secretAccessKey: env.r2.secretAccessKey(),
    },
  });
  return _client;
}

// Object-key conventions we use across the pipeline:
export const r2Keys = {
  source:   (videoId: string) => `videos/${videoId}/source.mp4`,
  audio:    (videoId: string) => `videos/${videoId}/audio.m4a`,
  clip:     (videoId: string, clipId: string) => `videos/${videoId}/clips/${clipId}.mp4`,
  thumbnail:(videoId: string, clipId: string) => `videos/${videoId}/clips/${clipId}.jpg`,
};

// Upload from a local file path — used by the worker after ffmpeg produces
// a file on disk. Streaming keeps memory low for large videos.
export async function uploadFromPath(
  key: string,
  filePath: string,
  contentType: string,
): Promise<void> {
  const { size } = await stat(filePath);
  await getR2().send(
    new PutObjectCommand({
      Bucket: env.r2.bucket(),
      Key: key,
      Body: createReadStream(filePath),
      ContentType: contentType,
      ContentLength: size,
    }),
  );
}

export async function uploadBuffer(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<void> {
  await getR2().send(
    new PutObjectCommand({
      Bucket: env.r2.bucket(),
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

// Signed URLs. Two use cases:
//   1. Give Replicate a URL to fetch audio from (long-ish TTL, needs to
//      outlive queueing + processing).
//   2. Give the user a download link for a finished clip (short TTL, one-shot).
export async function signedGetUrl(
  key: string,
  ttlSeconds: number = 60 * 60,
): Promise<string> {
  return getSignedUrl(
    getR2(),
    new GetObjectCommand({ Bucket: env.r2.bucket(), Key: key }),
    { expiresIn: ttlSeconds },
  );
}

export async function objectExists(key: string): Promise<boolean> {
  try {
    await getR2().send(
      new HeadObjectCommand({ Bucket: env.r2.bucket(), Key: key }),
    );
    return true;
  } catch (err) {
    if ((err as { name?: string })?.name === "NotFound") return false;
    throw err;
  }
}

export async function deleteObject(key: string): Promise<void> {
  await getR2().send(
    new DeleteObjectCommand({ Bucket: env.r2.bucket(), Key: key }),
  );
}
