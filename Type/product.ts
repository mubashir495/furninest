import { Category, SubCategory } from './category';

export interface ProductVariant {
  _id: string;
  configName: string;
  colorName?: string;
  colorHex?: string;
  sku?: string;
  price: number;
  /** Backend sends null when there is no sale. */
  salePrice?: number | null;
  stock: number;
  images: string[];
  isActive: boolean;
  dimensions?: string;
  material?: string;
  weight?: number | null;
  attributes?: Record<string, string>;
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  price: number;
  discount: number;
  finalPrice: number; // virtual: price - price*discount/100
  stock: number;
  thumbnailImage: string;
  images: string[];
  category: Category | string;
  subCategory: SubCategory | string;
  suggestionItems?: string[];
  isActive: boolean;
  created_date: string;
  updated_date: string;
  color?: string[];
  size?: string[];
  sku?: string;
  brand?: string;
  variants?: ProductVariant[];

  // Added by the backend (public responses)
  inStock?: boolean;
  startingPrice?: number;

  // New optional product fields
  features?: string[];
  specifications?: ProductSpecification[];
  material?: string;
  dimensions?: string;
  careInstructions?: string;
  seoTitle?: string;
  seoDescription?: string;
  isFeatured?: boolean;
  isArchived?: boolean;
}

export interface ProductDetail extends Product {
  suggestions: ProductSuggestion[];
}

export interface ProductSuggestion {
  _id: string;
  name: string;
  slug: string;
  price: number;
  discount: number;
  thumbnailImage: string;
  images: string[];
  stock: number;
  variants?: ProductVariant[];
  inStock?: boolean;
  startingPrice?: number;
}

export type SortOption =
  | 'featured'
  | 'price-asc'
  | 'price-desc'
  | 'newest'
  | 'name-asc';

export interface ProductFilter {
  categoryId?: string;
  subCategoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  onSale?: boolean;
  search?: string;
  sortBy?: SortOption;
}

export function getCategoryName(product: Product): string {
  if (!product || !product.category) return '';
  return typeof product.category === 'string' ? '' : product.category?.name ?? '';
}

export function getSubCategoryName(product: Product): string {
  if (!product || !product.subCategory) return '';
  return typeof product.subCategory === 'string' ? '' : product.subCategory?.name ?? '';
}

export function suggestionToProduct(s: ProductSuggestion): Product {
  const finalPrice = s.discount > 0 ? Math.round(s.price - (s.price * s.discount) / 100) : s.price;
  return {
    _id: s._id,
    name: s.name,
    slug: s.slug,
    shortDescription: '',
    longDescription: '',
    price: s.price,
    discount: s.discount,
    finalPrice,
    stock: s.stock,
    thumbnailImage: s.thumbnailImage,
    images: s.images,
    category: '',
    subCategory: '',
    isActive: true,
    created_date: '',
    updated_date: '',
    variants: s.variants,
    inStock: s.inStock,
    startingPrice: s.startingPrice,
  };
}

// ── Variant helpers ──────────────────────────────────────────────────────────

/** True only when a genuine sale price exists (null / undefined / >= price = no sale). */
export function isVariantOnSale(variant: ProductVariant): boolean {
  return variant.salePrice != null && variant.salePrice < variant.price;
}

export function getVariantFinalPrice(variant: ProductVariant): number {
  return isVariantOnSale(variant) ? (variant.salePrice as number) : variant.price;
}

export function getAvailableConfigs(variants: ProductVariant[]): string[] {
  return [...new Set(variants.filter((v) => v.isActive).map((v) => v.configName))];
}

export function getAvailableColors(variants: ProductVariant[], configName?: string): ProductVariant[] {
  const filtered = variants.filter((v) => v.isActive && v.colorName);
  if (configName) return filtered.filter((v) => v.configName === configName);
  return filtered;
}

export function findVariant(
  variants: ProductVariant[],
  configName: string,
  colorName?: string,
): ProductVariant | undefined {
  // Exact config + colour match only — never fall through to another colour.
  return variants.find(
    (v) =>
      v.isActive &&
      v.configName === configName &&
      (v.colorName ?? '') === (colorName ?? ''),
  );
}

// ── Product-level helpers (cards, listing, filters) ──────────────────────────

export function getActiveVariants(product: Pick<Product, 'variants'>): ProductVariant[] {
  return (product.variants ?? []).filter((v) => v.isActive);
}

export function hasVariants(product: Pick<Product, 'variants'>): boolean {
  return getActiveVariants(product).length > 0;
}

export function getProductInStock(product: Product): boolean {
  if (hasVariants(product)) return getActiveVariants(product).some((v) => v.stock > 0);
  return product.stock > 0;
}

export function getTotalStock(product: Product): number {
  if (hasVariants(product)) return getActiveVariants(product).reduce((s, v) => s + v.stock, 0);
  return product.stock;
}

export interface ProductPriceInfo {
  /** Price to show (cheapest variant for variant products). */
  price: number;
  /** Struck-through price — only when a genuine sale applies. */
  original: number | null;
  /** Highest final price across variants (for filter ranges). */
  max: number;
  /** True when variants have different prices -> show "From £x". */
  from: boolean;
  discountPct: number;
}

export function getProductPriceInfo(product: Product): ProductPriceInfo {
  const variants = getActiveVariants(product);
  if (variants.length === 0) {
    const onSale = product.discount > 0;
    return {
      price: product.finalPrice,
      original: onSale ? product.price : null,
      max: product.finalPrice,
      from: false,
      discountPct: onSale ? product.discount : 0,
    };
  }
  const finals = variants.map(getVariantFinalPrice);
  const cheapest = variants.reduce((a, b) => (getVariantFinalPrice(b) < getVariantFinalPrice(a) ? b : a));
  const onSale = isVariantOnSale(cheapest);
  return {
    price: Math.min(...finals),
    original: onSale ? cheapest.price : null,
    max: Math.max(...finals),
    from: new Set(finals).size > 1,
    discountPct: onSale ? Math.round((1 - getVariantFinalPrice(cheapest) / cheapest.price) * 100) : 0,
  };
}

/** Gallery for cards / quick view: product images, else thumbnail, else first variant images. */
export function getProductGallery(product: Product): string[] {
  if (product.images?.length) return product.images;
  if (product.thumbnailImage) return [product.thumbnailImage];
  const withImages = getActiveVariants(product).find((v) => v.images?.length);
  return withImages?.images ?? [];
}

export function getProductImage(product: Product): string {
  return product.thumbnailImage || getProductGallery(product)[0] || '/window.svg';
}

/** Unique colour swatches across active variants (for product cards). */
export function getColorSwatches(product: Product): { name: string; hex: string }[] {
  const seen = new Set<string>();
  const out: { name: string; hex: string }[] = [];
  for (const v of getActiveVariants(product)) {
    if (!v.colorName || seen.has(v.colorName)) continue;
    seen.add(v.colorName);
    out.push({ name: v.colorName, hex: v.colorHex || v.colorName });
  }
  return out;
}
