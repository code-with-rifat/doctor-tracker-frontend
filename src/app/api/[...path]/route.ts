import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const TARGET =
  process.env.API_PROXY_TARGET || 'https://doctor-tracker-backend-puce.vercel.app';

function cleanSetCookie(raw: string) {
  return raw
    .split(';')
    .map((part) => part.trim())
    .filter((part) => part && !/^domain=/i.test(part))
    .map((part) => {
      // Same-origin proxy: Lax is enough and works with middleware redirects
      if (/^samesite=/i.test(part)) {
        return 'SameSite=Lax';
      }
      return part;
    })
    .join('; ');
}

async function proxy(req: NextRequest, path: string[]) {
  if (!TARGET) {
    return NextResponse.json(
      { message: 'API_PROXY_TARGET is not configured' },
      { status: 500 }
    );
  }

  const incomingUrl = new URL(req.url);
  const targetUrl = `${TARGET.replace(/\/$/, '')}/api/${path.join('/')}${incomingUrl.search}`;

  const headers = new Headers();
  const contentType = req.headers.get('content-type');
  if (contentType) {
    headers.set('content-type', contentType);
  }
  const cookie = req.headers.get('cookie');
  if (cookie) {
    headers.set('cookie', cookie);
  }

  const method = req.method.toUpperCase();
  const body = method === 'GET' || method === 'HEAD' ? undefined : await req.arrayBuffer();

  const upstream = await fetch(targetUrl, {
    method,
    headers,
    body,
    redirect: 'manual',
  });

  const responseHeaders = new Headers();
  const upstreamContentType = upstream.headers.get('content-type');
  if (upstreamContentType) {
    responseHeaders.set('content-type', upstreamContentType);
  }

  const response = new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });

  const setCookies =
    typeof upstream.headers.getSetCookie === 'function'
      ? upstream.headers.getSetCookie()
      : [];

  if (setCookies.length) {
    setCookies.forEach((value) => {
      response.headers.append('set-cookie', cleanSetCookie(value));
    });
  } else {
    const single = upstream.headers.get('set-cookie');
    if (single) {
      response.headers.append('set-cookie', cleanSetCookie(single));
    }
  }

  return response;
}

type Ctx = { params: { path: string[] } };

export async function GET(req: NextRequest, ctx: Ctx) {
  return proxy(req, ctx.params.path);
}

export async function POST(req: NextRequest, ctx: Ctx) {
  return proxy(req, ctx.params.path);
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  return proxy(req, ctx.params.path);
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  return proxy(req, ctx.params.path);
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  return proxy(req, ctx.params.path);
}
