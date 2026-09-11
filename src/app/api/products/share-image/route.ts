import { NextRequest, NextResponse } from 'next/server';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB limit
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function getApprovedStorageBucket(): string {
  return process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'khushi-ornament-house.firebasestorage.app';
}

function getApprovedProjectId(): string {
  return process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'khushi-ornament-house';
}

/**
 * Validates whether a target URL is an approved KOH product-image source.
 */
function isApprovedProductImageUrl(rawUrl: string, requestOrigin?: string): boolean {
  try {
    const url = new URL(rawUrl);

    // 1. Strict HTTPS requirement
    if (url.protocol !== 'https:') {
      return false;
    }

    const host = url.hostname.toLowerCase();

    // 2. Local/Same-origin check if relative URL or matching current host
    if (requestOrigin) {
      try {
        const originUrl = new URL(requestOrigin);
        if (host === originUrl.hostname) {
          return url.pathname.startsWith('/assets/products/') || url.pathname.startsWith('/public/assets/products/');
        }
      } catch {
        // Ignore invalid origin
      }
    }

    const bucket = getApprovedStorageBucket().toLowerCase();
    const projectId = getApprovedProjectId().toLowerCase();

    // 3. Firebase Storage host validation
    if (host === 'firebasestorage.googleapis.com') {
      const pathname = decodeURIComponent(url.pathname);
      // Path must target the approved bucket and products folder
      // e.g. /v0/b/khushi-ornament-house.firebasestorage.app/o/products/...
      // or /v0/b/khushi-ornament-house.appspot.com/o/products/...
      const isApprovedBucketPath =
        pathname.startsWith(`/v0/b/${bucket}/o/products/`) ||
        pathname.startsWith(`/v0/b/${projectId}.appspot.com/o/products/`) ||
        pathname.startsWith(`/v0/b/${projectId}.firebasestorage.app/o/products/`);

      return isApprovedBucketPath;
    }

    // 4. Google Cloud Storage host validation
    if (host === 'storage.googleapis.com') {
      const pathname = decodeURIComponent(url.pathname);
      // e.g. /khushi-ornament-house.firebasestorage.app/products/...
      const isApprovedBucketPath =
        pathname.startsWith(`/${bucket}/products/`) ||
        pathname.startsWith(`/${projectId}.appspot.com/products/`) ||
        pathname.startsWith(`/${projectId}.firebasestorage.app/products/`);

      return isApprovedBucketPath;
    }

    return false;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing target image URL parameter.' }, { status: 400 });
  }

  const requestOrigin = request.nextUrl.origin;

  // Validate URL security constraints
  if (!isApprovedProductImageUrl(targetUrl, requestOrigin)) {
    return NextResponse.json(
      { error: 'Unapproved or invalid product image URL source.' },
      { status: 400 }
    );
  }

  try {
    // Perform initial request with redirect manual mode to prevent open redirects
    const upstreamRes = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        Accept: 'image/jpeg, image/png, image/webp',
      },
      redirect: 'manual',
    });

    // Check for redirects and validate redirect target location
    if (upstreamRes.status >= 300 && upstreamRes.status < 400) {
      const redirectLocation = upstreamRes.headers.get('location');
      if (!redirectLocation || !isApprovedProductImageUrl(redirectLocation, requestOrigin)) {
        return NextResponse.json(
          { error: 'Image request redirected to unapproved location.' },
          { status: 400 }
        );
      }
      // If redirect target is approved, perform fetch to that target location
      const redirectedRes = await fetch(redirectLocation, {
        method: 'GET',
        headers: { Accept: 'image/jpeg, image/png, image/webp' },
        redirect: 'manual',
      });
      return await handleProxyResponse(redirectedRes);
    }

    return await handleProxyResponse(upstreamRes);
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to fetch upstream product image.', details: err instanceof Error ? err.message : String(err) },
      { status: 502 }
    );
  }
}

async function handleProxyResponse(res: Response): Promise<NextResponse> {
  if (!res.ok) {
    return NextResponse.json(
      { error: `Upstream storage responded with status ${res.status}` },
      { status: res.status >= 400 && res.status < 500 ? 400 : 502 }
    );
  }

  const contentType = res.headers.get('content-type')?.toLowerCase().split(';')[0].trim() || '';
  if (!ALLOWED_MIME_TYPES.has(contentType)) {
    return NextResponse.json(
      { error: `Unsupported MIME type '${contentType}'. Only JPEG, PNG, and WebP are allowed.` },
      { status: 400 }
    );
  }

  const contentLengthHeader = res.headers.get('content-length');
  if (contentLengthHeader) {
    const contentLength = parseInt(contentLengthHeader, 10);
    if (!isNaN(contentLength) && contentLength > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `Image size exceeds maximum allowed limit of 5 MB.` },
        { status: 400 }
      );
    }
  }

  const arrayBuffer = await res.arrayBuffer();
  if (arrayBuffer.byteLength > MAX_IMAGE_SIZE_BYTES) {
    return NextResponse.json(
      { error: `Image payload size exceeds maximum allowed limit of 5 MB.` },
      { status: 400 }
    );
  }

  return new NextResponse(arrayBuffer, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Length': String(arrayBuffer.byteLength),
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
