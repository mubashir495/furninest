// src/services/productService.ts

import api from '@/lib/axios';
import { Product, Category, SubCategory, PaginatedResponse, ApiResponse } from '@/Type/products';

class ProductService {
  // Helper method to handle API responses
  private handleResponse<T>(response: any): T {
    return response.data;
  }

  // Helper to handle errors
  private handleError(error: any): never {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.response.data?.error || 'An error occurred';
      
      if (status === 401) {
        throw new Error('Session expired. Please login again.');
      }
      
      throw new Error(message);
    } else if (error.request) {
      throw new Error('No response from server. Please check your connection.');
    } else {
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }

  // Products
  async getProducts(page = 1, limit = 10, search = ''): Promise<PaginatedResponse<Product>> {
    try {
      const response = await api.get('/products', {
        params: { page, limit, search: search || undefined },
      });
      
      console.log('Full response:', response);
      
      // The response structure is: response.data.data.data (nested)
      // First check if we have the nested structure
      let productsData = [];
      let total = 0;
      
      if (response.data && response.data.data) {
        // Check if response.data.data is an array (products list)
        if (Array.isArray(response.data.data)) {
          productsData = response.data.data;
          total = productsData.length;
        } 
        // Check if response.data.data has a data property (nested further)
        else if (response.data.data.data && Array.isArray(response.data.data.data)) {
          productsData = response.data.data.data;
          total = response.data.data.total || productsData.length;
        }
        // Check if response.data has a data property with products
        else if (response.data.data.products && Array.isArray(response.data.data.products)) {
          productsData = response.data.data.products;
          total = response.data.data.total || productsData.length;
        }
      }
      
      // If we couldn't find products in the nested structure, try direct access
      if (productsData.length === 0 && Array.isArray(response.data)) {
        productsData = response.data;
        total = productsData.length;
      }
      
      // Map the products to match our Product interface
      const mappedProducts = productsData.map((item: any) => ({
        _id: item._id || item.id,
        name: item.name || '',
        slug: item.slug || '',
        shortDescription: item.shortDescription || '',
        longDescription: item.longDescription || '',
        category: item.category || '',
        subCategory: item.subCategory || '',
        price: item.price || 0,
        discount: item.discount || 0,
        finalPrice: item.finalPrice || item.price || 0,
        stock: item.stock || 0,
        images: item.images || [],
        status: item.isActive ? 'active' : 'inactive',
        createdAt: item.created_date || item.createdAt || new Date().toISOString(),
        updatedAt: item.updated_date || item.updatedAt || new Date().toISOString(),
      }));
      
      return {
        products: mappedProducts,
        total: total || mappedProducts.length,
        page: page,
        limit: limit,
        totalPages: Math.ceil((total || mappedProducts.length) / limit),
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      return {
        products: [],
        total: 0,
        page: page,
        limit: limit,
        totalPages: 1,
      };
    }
  }

  async getProduct(id: string): Promise<Product> {
    try {
      const response = await api.get(`/products/${id}`);
      const data = this.handleResponse<ApiResponse<Product>>(response);
      return data.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async createProduct(data: FormData): Promise<Product> {
    try {
      const response = await api.post('/products', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const result = this.handleResponse<ApiResponse<Product>>(response);
      return result.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateProduct(id: string, data: FormData): Promise<Product> {
    try {
      const response = await api.put(`/products/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const result = this.handleResponse<ApiResponse<Product>>(response);
      return result.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      await api.delete(`/products/${id}`);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    try {
      const response = await api.get('/categories');
      const data = this.handleResponse<ApiResponse<Category[]>>(response);
      return data.data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  // Sub Categories
  async getSubCategories(): Promise<SubCategory[]> {
    try {
      const response = await api.get('/subcategories');
      const data = this.handleResponse<ApiResponse<SubCategory[]>>(response);
      return data.data || [];
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      return [];
    }
  }

  async getSubCategoriesByCategory(categoryId: string): Promise<SubCategory[]> {
    try {
      const allSubCategories = await this.getSubCategories();
      return allSubCategories.filter(sub => 
        typeof sub.category === 'string' 
          ? sub.category === categoryId 
          : (sub.category as Category)._id === categoryId
      );
    } catch (error) {
      console.error('Error fetching subcategories by category:', error);
      return [];
    }
  }

  // Product images
  async uploadImage(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const data = this.handleResponse<{ url: string }>(response);
      return data.url;
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export const productService = new ProductService();