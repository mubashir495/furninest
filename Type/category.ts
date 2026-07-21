// Client-side category & subcategory types — mirror backend schemas exactly.
// (Admin panel uses its own Type/category_type-equivalent shapes in Type/products.ts — do not merge.)

export interface Category {
  _id: string;
  name: string;
  slug: string;
  created_date: string;
  updated_date: string;
}

export interface SubCategory {
  _id: string;
  name: string;
  slug: string;
  category: Category | string;
  created_date: string;
  updated_date: string;
}

// Shape returned by GET /products/catalog-tree
export interface CatalogSubCategory extends SubCategory {
  products: CatalogProductSummary[];
}

export interface CatalogProductSummary {
  _id: string;
  name: string;
  slug: string;
  price: number;
  discount: number;
  thumbnailImage: string;
  images: string[];
  stock: number;
}

export interface CatalogCategory extends Category {
  subCategories: CatalogSubCategory[];
}
