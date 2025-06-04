import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';

export const GET: APIRoute = async ({ params, request }) => {
  const url = new URL(request.url);
  const dir = url.searchParams.get('dir') || '';
  const safePath = path.join(process.cwd(), 'public', dir);

  try {
    const files = await fs.readdir(safePath);
    let fileTable = files.reduce((acc, str) => {
        acc[str] = true; // 值可以是任意内容（true、1、自定义值等）
        return acc;
    }, {});
    return new Response(JSON.stringify( fileTable ), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Invalid directory" }), {
      status: 400
    });
  }
};