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
