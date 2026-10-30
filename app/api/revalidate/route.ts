import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

function safeRevalidateTag(tag: string, recorded: string[]) {
  try {
    // In Next.js 16, { expire: 0 } instructs the cache to expire immediately
    revalidateTag(tag, { expire: 0 });
    recorded.push(tag);
  } catch (error) {
    console.warn(`[Revalidate] Error revalidating tag "${tag}":`, error instanceof Error ? error.message : error);
  }
}

function safeRevalidatePath(path: string, recorded: string[]) {
  try {
    revalidatePath(path);
    recorded.push(path);
  } catch (error) {
    console.warn(`[Revalidate] Error revalidating path "${path}":`, error instanceof Error ? error.message : error);
  }
}

export async function POST(req: NextRequest) {
  const configuredSecret = process.env.REVALIDATE_SECRET;
  if (!configuredSecret) {
    console.error('[Revalidate] REVALIDATE_SECRET is not configured on the frontend.');
    return NextResponse.json(
      { revalidated: false, error: 'Server misconfiguration: REVALIDATE_SECRET is missing.' },
      { status: 500 },
    );
  }

  // Extract secret from header or query param
  const authHeader = req.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  const providedSecret =
    req.headers.get('x-revalidate-secret') ||
    bearerToken ||
    req.nextUrl.searchParams.get('secret');

  if (!providedSecret || providedSecret !== configuredSecret) {
    return NextResponse.json(
      { revalidated: false, error: 'Unauthorized: Invalid revalidation secret.' },
      { status: 401 },
    );
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { revalidated: false, error: 'Invalid JSON request body.' },
      { status: 400 },
    );
  }

  const {
    event,
    model = 'product',
    action,
    id,
    slug,
    previousSlug,
    categorySlug,
    tags = [],
    paths = [],
  } = body || {};

  // Must have some identifier or event
  if (!event && !action && !slug && !id && (!tags || tags.length === 0) && (!paths || paths.length === 0)) {
    return NextResponse.json(
      { revalidated: false, error: 'Bad Request: Missing event, action, or identifiers.' },
      { status: 400 },
    );
  }

  const revalidatedTags: string[] = [];
  const revalidatedPaths: string[] = [];

  const isProduct = model === 'product' || (event && event.startsWith('product.'));
  const isCategory = model === 'category' || (event && event.startsWith('category.'));
  const isSubCategory = model === 'subcategory' || (event && event.startsWith('subcategory.'));

  if (isProduct) {
    // 1. Invalidate global product listings & homepage sections
    safeRevalidateTag('products', revalidatedTags);
    safeRevalidatePath('/', revalidatedPaths);
    safeRevalidatePath('/shop', revalidatedPaths);

    // 2. Invalidate specific product detail page if slug is provided
    if (slug) {
      safeRevalidateTag(`product:${slug}`, revalidatedTags);
      safeRevalidatePath(`/product/${slug}`, revalidatedPaths);
    }

    // 3. If product was renamed, invalidate previous slug route & tag
    if (previousSlug && previousSlug !== slug) {
      safeRevalidateTag(`product:${previousSlug}`, revalidatedTags);
      safeRevalidatePath(`/product/${previousSlug}`, revalidatedPaths);
    }

    // 4. If ID is provided (e.g. for deleted products or fallback)
    if (id) {
      safeRevalidateTag(`product:${id}`, revalidatedTags);
    }

    // 5. Invalidate category route if categorySlug is known
    if (categorySlug) {
      safeRevalidateTag(`category:${categorySlug}`, revalidatedTags);
      safeRevalidatePath(`/category/${categorySlug}`, revalidatedPaths);
    }
  } else if (isCategory) {
    // Invalidate categories and their product listings
    safeRevalidateTag('categories', revalidatedTags);
    safeRevalidateTag('products', revalidatedTags);
    safeRevalidatePath('/categories', revalidatedPaths);
    safeRevalidatePath('/', revalidatedPaths);
    safeRevalidatePath('/shop', revalidatedPaths);

    if (slug) {
      safeRevalidateTag(`category:${slug}`, revalidatedTags);
      safeRevalidatePath(`/category/${slug}`, revalidatedPaths);
    }
    if (previousSlug && previousSlug !== slug) {
      safeRevalidateTag(`category:${previousSlug}`, revalidatedTags);
      safeRevalidatePath(`/category/${previousSlug}`, revalidatedPaths);
    }
  } else if (isSubCategory) {
    safeRevalidateTag('subcategories', revalidatedTags);
    safeRevalidateTag('categories', revalidatedTags);
    safeRevalidateTag('products', revalidatedTags);
    safeRevalidatePath('/', revalidatedPaths);
    safeRevalidatePath('/shop', revalidatedPaths);

    if (slug) {
      safeRevalidateTag(`subcategory:${slug}`, revalidatedTags);
      safeRevalidatePath(`/subcategory/${slug}`, revalidatedPaths);
    }
    if (categorySlug) {
      safeRevalidateTag(`category:${categorySlug}`, revalidatedTags);
      safeRevalidatePath(`/category/${categorySlug}`, revalidatedPaths);
    }
  }

  // Handle any additional custom tags or paths explicitly requested
  if (Array.isArray(tags)) {
    for (const tag of tags) {
      if (typeof tag === 'string' && !revalidatedTags.includes(tag)) {
        safeRevalidateTag(tag, revalidatedTags);
      }
    }
  }

  if (Array.isArray(paths)) {
    for (const path of paths) {
      if (typeof path === 'string' && !revalidatedPaths.includes(path)) {
        safeRevalidatePath(path, revalidatedPaths);
      }
    }
  }

  return NextResponse.json(
    {
      revalidated: true,
      event: event || `${model}.${action || 'update'}`,
      tags: revalidatedTags,
      paths: revalidatedPaths,
      timestamp: new Date().toISOString(),
    },
    { status: 200 },
  );
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method Not Allowed. Use POST with authorization to revalidate.' },
    { status: 405 },
  );
}
