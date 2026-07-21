export interface Category {
  _id: string;
  name: string;
  slug: string;
}

export interface SubCategory {
  _id: string;
  name: string;
  slug: string;
  category: Category;
  created_date: string;
  updated_date: string;
}