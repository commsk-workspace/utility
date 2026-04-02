import { NextRequest, NextResponse } from 'next/server';

// [system] Server-side proxy to bypass CORS restrictions for API Tester
export async function GET(request: NextRequest) {
  return proxyRequest(request);
}

export async function POST(request: NextRequest) {
  return proxyRequest(request);
}

export async function PUT(request: NextRequest) {
  return proxyRequest(request);
}

export async function PATCH(request: NextRequest) {
  return proxyRequest(request);
}

export async function DELETE(request: NextRequest) {
  return proxyRequest(request);
}

async function proxyRequest(request: NextRequest) {
  const targetUrl = request.nextUrl.searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json(
      { error: 'Missing "url" query parameter' },
      { status: 400 }
    );
  }

  // Validate URL format
  try {
    new URL(targetUrl);
  } catch {
    return NextResponse.json(
      { error: 'Invalid URL format' },
      { status: 400 }
    );
  }

  // Block requests to internal/private networks
  const blockedPatterns = [
    /^https?:\/\/localhost/i,
    /^https?:\/\/127\./,
    /^https?:\/\/0\./,
    /^https?:\/\/10\./,
    /^https?:\/\/172\.(1[6-9]|2\d|3[01])\./,
    /^https?:\/\/192\.168\./,
    /^https?:\/\/\[::1\]/,
  ];

  if (blockedPatterns.some(pattern => pattern.test(targetUrl))) {
    return NextResponse.json(
      { error: 'Requests to private/internal networks are not allowed' },
      { status: 403 }
    );
  }

  try {
    // Forward headers (exclude host and internal headers)
    const forwardHeaders: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      const skip = ['host', 'connection', 'transfer-encoding', 'content-length'];
      if (!skip.includes(key.toLowerCase()) && !key.startsWith('x-next')) {
        forwardHeaders[key] = value;
      }
    });

    const fetchOptions: RequestInit = {
      method: request.method,
      headers: forwardHeaders,
    };

    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      const body = await request.text();
      if (body) {
        fetchOptions.body = body;
      }
    }

    const response = await fetch(targetUrl, fetchOptions);

    // Forward response
    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      // Skip hop-by-hop headers
      const skip = ['transfer-encoding', 'connection', 'keep-alive'];
      if (!skip.includes(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });

    const responseBody = await response.text();

    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Proxy request failed' },
      { status: 502 }
    );
  }
}
