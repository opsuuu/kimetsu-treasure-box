import { supabase } from '@/lib/supabase';

export async function uploadItemImage(
  file: File,
  characterSlugs: string[],
): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error('登入已失效，請重新登入');

  const form = new FormData();
  form.append('file', file);
  for (const slug of characterSlugs) {
    form.append('characterSlugs', slug);
  }

  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.access_token}` },
    body: form,
  });

  const data = (await res.json().catch(() => null)) as
    | { url: string }
    | { error: string }
    | null;

  if (!res.ok || !data || !('url' in data)) {
    throw new Error((data && 'error' in data && data.error) || '圖片上傳失敗');
  }

  return data.url;
}

export async function deleteItemImage(url: string): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error('登入已失效，請重新登入');

  const res = await fetch('/api/upload', {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error || '圖片刪除失敗');
  }
}
