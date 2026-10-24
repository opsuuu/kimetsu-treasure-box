interface Env {
  BUCKET: R2Bucket;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  PUBLIC_R2_URL: string;
}

function resolveItemFolder(characterSlugs: string[]): string {
  const hasGiyu = characterSlugs.includes('giyu');
  const hasShinobu = characterSlugs.includes('shinobu');
  if (hasGiyu && !hasShinobu) return 'giyu';
  if (hasShinobu && !hasGiyu) return 'shinobu';
  return 'both';
}

async function verifyUser(request: Request, env: Env): Promise<boolean> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;

  const res = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: {
      Authorization: authHeader,
      apikey: env.SUPABASE_ANON_KEY,
    },
  });
  return res.ok;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!(await verifyUser(request, env))) {
    return Response.json({ error: '登入已失效，請重新登入' }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return Response.json({ error: '缺少圖片檔案' }, { status: 400 });
  }

  const characterSlugs = form.getAll('characterSlugs').map(String);
  const folder = resolveItemFolder(characterSlugs);
  const ext = file.name.split('.').pop() ?? 'jpg';
  const key = `${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  try {
    await env.BUCKET.put(key, file, {
      httpMetadata: { contentType: file.type || 'application/octet-stream' },
    });
  } catch {
    return Response.json({ error: '圖片上傳失敗，請稍後再試' }, { status: 500 });
  }

  const url = `${env.PUBLIC_R2_URL.replace(/\/$/, '')}/${key}`;
  return Response.json({ url });
};

/**
 * 從公開圖片網址還原 R2 object key。
 * 只接受本 bucket 的公開網址，避免呼叫端直接指定任意 key。
 */
function resolveKeyFromUrl(url: string, publicBase: string): string | null {
  const base = publicBase.replace(/\/$/, '');
  if (!url.startsWith(`${base}/`)) return null;
  const key = decodeURIComponent(url.slice(base.length + 1));
  if (!key || key.includes('..')) return null;
  return key;
}

export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  if (!(await verifyUser(request, env))) {
    return Response.json({ error: '登入已失效，請重新登入' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { url?: string } | null;
  if (!body?.url) {
    return Response.json({ error: '缺少圖片網址' }, { status: 400 });
  }

  const key = resolveKeyFromUrl(body.url, env.PUBLIC_R2_URL);
  if (!key) {
    return Response.json({ error: '圖片網址不合法' }, { status: 400 });
  }

  try {
    // R2 delete 對不存在的 key 不會拋錯，重複刪除視為成功
    await env.BUCKET.delete(key);
  } catch {
    return Response.json({ error: '圖片刪除失敗，請稍後再試' }, { status: 500 });
  }

  return Response.json({ ok: true });
};
