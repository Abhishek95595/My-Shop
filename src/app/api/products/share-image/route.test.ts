import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';

describe('Share Image Proxy Security & Validation', () => {
  const originalEnvBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const originalEnvProject = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'khushi-ornament-house.firebasestorage.app';
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'khushi-ornament-house';
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = originalEnvBucket;
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = originalEnvProject;
  });

  it('1. accepts approved Firebase Storage product image URL', async () => {
    const validUrl = 'https://firebasestorage.googleapis.com/v0/b/khushi-ornament-house.firebasestorage.app/o/products%2Fkanthi-pendant.jpg?alt=media';
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(new Uint8Array([0xff, 0xd8]).buffer, {
        status: 200,
        headers: { 'content-type': 'image/jpeg' },
      })
    );
    const req = new NextRequest(`http://localhost:3000/api/products/share-image?url=${encodeURIComponent(validUrl)}`);
    const res = await GET(req);
    expect(res.status).toBe(200);
  });

  it('2. rejects non-HTTPS URLs', async () => {
    const httpUrl = 'http://firebasestorage.googleapis.com/v0/b/khushi-ornament-house.firebasestorage.app/o/products%2Fkanthi.jpg';
    const req = new NextRequest(`http://localhost:3000/api/products/share-image?url=${encodeURIComponent(httpUrl)}`);
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it('3. rejects unapproved hostnames (e.g. googleusercontent or malicious external domains)', async () => {
    const unapproved1 = 'https://lh3.googleusercontent.com/some-image.jpg';
    const req = new NextRequest(`http://localhost:3000/api/products/share-image?url=${encodeURIComponent(unapproved1)}`);
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it('4. rejects malformed URLs', async () => {
    const req = new NextRequest('http://localhost:3000/api/products/share-image?url=not-a-valid-url');
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it('5. rejects Firebase Storage URLs targeting non-product buckets or folders', async () => {
    const wrongBucket = 'https://firebasestorage.googleapis.com/v0/b/other-bucket.appspot.com/o/products%2Fitem.jpg';
    const req = new NextRequest(`http://localhost:3000/api/products/share-image?url=${encodeURIComponent(wrongBucket)}`);
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it('6. GET route rejects request when target URL param is missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/products/share-image');
    const res = await GET(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('Missing target image URL');
  });

  it('7. GET route rejects unapproved target image URL', async () => {
    const req = new NextRequest('http://localhost:3000/api/products/share-image?url=https%3A%2F%2Fevil.com%2Fimage.jpg');
    const res = await GET(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('Unapproved or invalid product image URL');
  });

  it('8. GET route rejects upstream response with unsupported MIME type', async () => {
    const approvedUrl = 'https://firebasestorage.googleapis.com/v0/b/khushi-ornament-house.firebasestorage.app/o/products%2Ftest.jpg?alt=media';

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'html/text payload' }), {
        status: 200,
        headers: { 'content-type': 'text/html' },
      })
    );

    const req = new NextRequest(`http://localhost:3000/api/products/share-image?url=${encodeURIComponent(approvedUrl)}`);
    const res = await GET(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('Unsupported MIME type');
  });

  it('9. GET route rejects response exceeding 5 MB limit', async () => {
    const approvedUrl = 'https://firebasestorage.googleapis.com/v0/b/khushi-ornament-house.firebasestorage.app/o/products%2Fhuge.jpg?alt=media';

    // Mock 6 MB response
    const hugeBuffer = new ArrayBuffer(6 * 1024 * 1024);

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(hugeBuffer, {
        status: 200,
        headers: {
          'content-type': 'image/jpeg',
          'content-length': String(6 * 1024 * 1024),
        },
      })
    );

    const req = new NextRequest(`http://localhost:3000/api/products/share-image?url=${encodeURIComponent(approvedUrl)}`);
    const res = await GET(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('exceeds maximum allowed limit of 5 MB');
  });

  it('10. GET route rejects redirect to an unapproved host', async () => {
    const approvedUrl = 'https://firebasestorage.googleapis.com/v0/b/khushi-ornament-house.firebasestorage.app/o/products%2Fredirect.jpg?alt=media';

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(null, {
        status: 302,
        headers: { location: 'https://evil.com/malicious-redirect.jpg' },
      })
    );

    const req = new NextRequest(`http://localhost:3000/api/products/share-image?url=${encodeURIComponent(approvedUrl)}`);
    const res = await GET(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('Image request redirected to unapproved location');
  });

  it('11. GET route handles upstream network failures with 502', async () => {
    const approvedUrl = 'https://firebasestorage.googleapis.com/v0/b/khushi-ornament-house.firebasestorage.app/o/products%2Ffail.jpg?alt=media';

    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network connection timeout'));

    const req = new NextRequest(`http://localhost:3000/api/products/share-image?url=${encodeURIComponent(approvedUrl)}`);
    const res = await GET(req);
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toContain('Failed to fetch upstream product image');
  });

  it('12. GET route successfully proxies valid image', async () => {
    const approvedUrl = 'https://firebasestorage.googleapis.com/v0/b/khushi-ornament-house.firebasestorage.app/o/products%2Fvalid.jpg?alt=media';

    const mockBuffer = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]).buffer;

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(mockBuffer, {
        status: 200,
        headers: {
          'content-type': 'image/jpeg',
          'content-length': String(mockBuffer.byteLength),
        },
      })
    );

    const req = new NextRequest(`http://localhost:3000/api/products/share-image?url=${encodeURIComponent(approvedUrl)}`);
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('image/jpeg');
  });
});
