// Image URL resolver. Keeps the fluent `urlFor(src).width().height()....url()`
// interface that page call sites use, but now resolves Firebase Storage refs.
//
// Resolution rules (all synchronous):
//   - empty / non-string            → ''
//   - absolute URL (http/https)     → returned as-is (e.g. legacy Unsplash/picsum)
//   - root-relative asset (/...)    → returned as-is (e.g. /assets/brand/...)
//   - gs:// ref or bare object path → public Storage download URL
//
// Storage objects under public/** are world-readable (storage.rules), so the
// alt=media download URL resolves without a token. The width/height/auto/format
// methods are retained for call-site compatibility; Storage does not do
// on-the-fly transforms, so they are no-ops.

const STORAGE_BUCKET = 'rebuilt-village-web.firebasestorage.app';

function resolve(source: unknown): string {
  if (typeof source !== 'string' || source.length === 0) return '';
  if (/^https?:\/\//.test(source) || source.startsWith('/')) return source;
  const path = source.replace(/^gs:\/\/[^/]+\//, '');
  return `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/${encodeURIComponent(path)}?alt=media`;
}

interface ImageUrlStub {
  width(n: number): ImageUrlStub;
  height(n: number): ImageUrlStub;
  auto(mode: string): ImageUrlStub;
  format(fmt: string): ImageUrlStub;
  url(): string;
}

export function urlFor(source: unknown): ImageUrlStub {
  const stub: ImageUrlStub = {
    width: () => stub,
    height: () => stub,
    auto: () => stub,
    format: () => stub,
    url: () => resolve(source),
  };
  return stub;
}
