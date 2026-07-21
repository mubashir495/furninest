import api from "./axios";

export const getCategories = async () => {
  const res = await api.get("/categories");
  return res.data;
};

export const createCategory = async (name: string) => {
  const res = await api.post("/categories", {
    name,
  });
  return res.data;
};

export const updateCategory = async (id: string, name: string) => {
  const res = await api.patch(`/categories/${id}`, {
    name,
  });

  return res.data;
};

export const deleteCategory = async (id: string) => {
  const res = await api.delete(`/categories/${id}`);
  return res.data;
};