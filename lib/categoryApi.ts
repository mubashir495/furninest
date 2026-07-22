import api, { getApiErrorMessage } from './axios';

export interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  created_date?: string;
}

export const getCategories = async () => {
  try {
    const res = await api.get('/categories');
    return res.data;
  } catch (err) {
    throw new Error(getApiErrorMessage(err, 'Failed to load categories'));
  }
};

export const createCategory = async (name: string, image?: File, description?: string) => {
  try {
    const formData = new FormData();
    formData.append('name', name);
    if (image) {
      formData.append('image', image);
    }
    if (description !== undefined) {
      formData.append('description', description);
    }
    const res = await api.post('/categories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  } catch (err) {
    throw new Error(getApiErrorMessage(err, 'Failed to create category'));
  }
};

export const updateCategory = async (id: string, name: string, image?: File, description?: string) => {
  try {
    const formData = new FormData();
    formData.append('name', name);
    if (image) {
      formData.append('image', image);
    }
    if (description !== undefined) {
      formData.append('description', description);
    }
    const res = await api.patch(`/categories/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  } catch (err) {
    throw new Error(getApiErrorMessage(err, 'Failed to update category'));
  }
};

export const deleteCategory = async (id: string) => {
  try {
    const res = await api.delete(`/categories/${id}`);
    return res.data;
  } catch (err) {
    throw new Error(getApiErrorMessage(err, 'Failed to delete category'));
  }
};