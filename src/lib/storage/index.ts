import { mkdir, writeFile } from "fs/promises";
import path from "path";

export type StorageDriver = "local" | "s3";

export interface UploadResult {
  key: string;
  url: string;
  sizeBytes: number;
}

const driver = (process.env.STORAGE_DRIVER ?? "local") as StorageDriver;

export async function uploadFile(
  file: Buffer,
  fileName: string,
  mimeType: string
): Promise<UploadResult> {
  const key = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

  if (driver === "s3") {
    return uploadToS3(file, key, mimeType);
  }

  return uploadToLocal(file, key);
}

async function uploadToLocal(
  file: Buffer,
  key: string
): Promise<UploadResult> {
  const basePath =
    process.env.STORAGE_LOCAL_PATH ?? path.join(process.cwd(), "storage/uploads");
  await mkdir(basePath, { recursive: true });
  const filePath = path.join(basePath, key);
  await writeFile(filePath, file);

  return {
    key,
    url: `/api/files/${key}`,
    sizeBytes: file.length,
  };
}

async function uploadToS3(
  file: Buffer,
  key: string,
  mimeType: string
): Promise<UploadResult> {
  const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");

  const client = new S3Client({
    region: process.env.S3_REGION ?? "us-east-1",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
    ...(process.env.S3_ENDPOINT
      ? { endpoint: process.env.S3_ENDPOINT, forcePathStyle: true }
      : {}),
  });

  const bucket = process.env.S3_BUCKET!;
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file,
      ContentType: mimeType,
    })
  );

  const publicUrl = process.env.S3_PUBLIC_URL
    ? `${process.env.S3_PUBLIC_URL}/${key}`
    : `https://${bucket}.s3.amazonaws.com/${key}`;

  return { key, url: publicUrl, sizeBytes: file.length };
}
