import {
  DeleteObjectCommand,
  HeadObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

if (!process.env.R2_ACCOUNT_ID) {
  throw new Error("R2_ACCOUNT_ID environment variable is not set");
}

if (!process.env.R2_ACCESS_KEY_ID) {
  throw new Error("R2_ACCESS_KEY_ID environment variable is not set");
}

if (!process.env.R2_SECRET_ACCESS_KEY) {
  throw new Error("R2_SECRET_ACCESS_KEY environment variable is not set");
}

if (!process.env.R2_BUCKET_NAME) {
  throw new Error("R2_BUCKET_NAME environment variable is not set");
}

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

function getPublicDomain(): string {
  const domain = process.env.NEXT_PUBLIC_R2_DOMAIN;

  if (!domain) {
    throw new Error("NEXT_PUBLIC_R2_DOMAIN environment variable is not set");
  }

  return domain.replace(/\/+$/, "");
}

export function buildPublicUrl(fileKey: string): string {
  return `${getPublicDomain()}/${fileKey}`;
}

export function fileKeyFromPublicUrl(fileUrl: string): string | null {
  const prefix = `${getPublicDomain()}/`;

  return fileUrl.startsWith(prefix) ? fileUrl.slice(prefix.length) : null;
}

export type StoredObjectInfo = {
  sizeBytes: number;
  contentType: string | null;
};

/**
 * The authoritative size of an uploaded object. Guests tell us how big a file is
 * before uploading, but only R2 knows what actually landed.
 */
export async function getObjectInfo(
  fileKey: string,
): Promise<StoredObjectInfo | null> {
  try {
    const result = await r2Client.send(
      new HeadObjectCommand({ Bucket: R2_BUCKET_NAME, Key: fileKey }),
    );

    if (typeof result.ContentLength !== "number") {
      return null;
    }

    return {
      sizeBytes: result.ContentLength,
      contentType: result.ContentType ?? null,
    };
  } catch (error) {
    console.error("[getObjectInfo] Failed to head object:", fileKey, error);
    return null;
  }
}

export async function deleteObject(fileKey: string): Promise<boolean> {
  try {
    await r2Client.send(
      new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: fileKey }),
    );

    return true;
  } catch (error) {
    console.error("[deleteObject] Failed to delete object:", fileKey, error);
    return false;
  }
}
