import { createSupabaseAdminClient } from '@/lib/auth/supabase-admin';

export const INVOICES_BUCKET = 'invoices';

/**
 * Uploads a buffer to Supabase Storage and returns the public URL.
 * The bucket must exist (create it manually in Supabase Studio with
 * "Public bucket" = on for now). RLS policies stay default.
 */
export async function uploadToStorage(input: {
  bucket: string;
  path: string;
  buffer: Buffer;
  contentType: string;
}): Promise<string> {
  const client = createSupabaseAdminClient();
  const { error } = await client.storage.from(input.bucket).upload(input.path, input.buffer, {
    contentType: input.contentType,
    upsert: true,
  });
  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }
  const { data } = client.storage.from(input.bucket).getPublicUrl(input.path);
  return data.publicUrl;
}
