import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";

const BUCKET_NAME = "termek-kepek";
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

let bucketReady = false;

export const dynamic = "force-dynamic";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function ensureProductImageBucket(supabase: SupabaseClient) {
  if (bucketReady) return;

  const { data: existingBucket, error: getBucketError } = await supabase.storage.getBucket(BUCKET_NAME);

  if (existingBucket && !getBucketError) {
    if (!existingBucket.public) {
      const { error: updateBucketError } = await supabase.storage.updateBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: MAX_IMAGE_SIZE_BYTES,
        allowedMimeTypes: Object.keys(ALLOWED_IMAGE_TYPES),
      });

      if (updateBucketError) {
        throw new Error(updateBucketError.message);
      }
    }

    bucketReady = true;
    return;
  }

  const { error: createBucketError } = await supabase.storage.createBucket(BUCKET_NAME, {
    public: true,
    fileSizeLimit: MAX_IMAGE_SIZE_BYTES,
    allowedMimeTypes: Object.keys(ALLOWED_IMAGE_TYPES),
  });

  if (createBucketError && !createBucketError.message.toLowerCase().includes("already exists")) {
    throw new Error(createBucketError.message);
  }

  bucketReady = true;
}

function toSafePathSegment(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value : "";

  return (
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "termek"
  );
}

function getStoragePath(value: unknown) {
  if (typeof value !== "string") return null;
  if (!value.startsWith("termekek/") || value.includes("..")) return null;

  return value;
}

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();
  const authError = await requireAdmin(request, supabase);

  if (authError) return authError;

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return jsonError("Nem érkezett feltölthető képfájl.", 400);
  }

  const extension = ALLOWED_IMAGE_TYPES[file.type];

  if (!extension) {
    return jsonError("Csak JPG, PNG vagy WebP kép tölthető fel.", 400);
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return jsonError("A kép legfeljebb 5 MB lehet.", 400);
  }

  try {
    await ensureProductImageBucket(supabase);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Nem sikerült előkészíteni a képtárhelyet.", 500);
  }

  const pathSegment = toSafePathSegment(formData.get("slug") ?? formData.get("name"));
  const objectPath = `termekek/${pathSegment}/${Date.now()}-${randomUUID()}.${extension}`;
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(objectPath, fileBuffer, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return jsonError(uploadError.message, 500);
  }

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(objectPath);

  return NextResponse.json({
    url: data.publicUrl,
    path: objectPath,
  });
}

export async function DELETE(request: Request) {
  const supabase = getSupabaseAdmin();
  const authError = await requireAdmin(request, supabase);

  if (authError) return authError;

  const body = await request.json().catch(() => ({}));
  const storagePath = getStoragePath(body.path);

  if (!storagePath) {
    return jsonError("Érvénytelen képútvonal.", 400);
  }

  const { error } = await supabase.storage.from(BUCKET_NAME).remove([storagePath]);

  if (error) {
    return jsonError(error.message, 500);
  }

  return NextResponse.json({ ok: true });
}
