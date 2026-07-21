import api from "./axios";
import { SubCategory } from "@/Type/subcategory";

// Get All Subcategories
export const getSubCategories = async () => {
  const res = await api.get<{
    success: boolean;
    data: SubCategory[];
  }>("/subcategories");

  return res.data;
};

// Get Single Subcategory
export const getSubCategory = async (id: string) => {
  const res = await api.get<{
    success: boolean;
    data: SubCategory;
  }>(`/subcategories/${id}`);

  return res.data;
};

// Get Subcategories By Category
export const getSubCategoriesByCategory = async (categoryId: string) => {
  const res = await api.get<{
    success: boolean;
    data: SubCategory[];
  }>(`/subcategories/category/${categoryId}`);

  return res.data;
};

// Create Subcategory
export const createSubCategory = async (
  name: string,
  category: string
) => {
  const res = await api.post("/subcategories", {
    name,
    category,
  });

  return res.data;
};

// Update Subcategory
export const updateSubCategory = async (
  id: string,
  name: string,
  category: string
) => {
  const res = await api.patch(`/subcategories/${id}`, {
    name,
    category,
  });

  return res.data;
};

// Delete Subcategory
export const deleteSubCategory = async (id: string) => {
  const res = await api.delete(`/subcategories/${id}`);

  return res.data;
};