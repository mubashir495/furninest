import api, { getApiErrorMessage } from '@/lib/axios';
import { BlogPost, BlogListResponse, BlogFormValues } from '@/Type/blog';

export interface BlogQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category?: string;
}

export const blogService = {
  // ── Admin ───────────────────────────────────────────────────────────────

  async listAdmin(query: BlogQuery = {}): Promise<BlogListResponse> {
    try {
      const { data } = await api.get('/admin/blog', { params: query });
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load posts.'));
    }
  },

  async getOne(id: string): Promise<BlogPost> {
    try {
      const { data } = await api.get(`/admin/blog/${id}`);
      return data.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load post.'));
    }
  },

  async create(values: BlogFormValues): Promise<BlogPost> {
    try {
      const body = {
        ...values,
        tags: values.tags
          ? values.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
      };
      const { data } = await api.post('/admin/blog', body);
      return data.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to create post.'));
    }
  },

  async update(id: string, values: Partial<BlogFormValues>): Promise<BlogPost> {
    try {
      const body: Record<string, unknown> = { ...values };
      if (typeof values.tags === 'string') {
        body.tags = values.tags.split(',').map((t) => t.trim()).filter(Boolean);
      }
      const { data } = await api.patch(`/admin/blog/${id}`, body);
      return data.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update post.'));
    }
  },

  async remove(id: string): Promise<void> {
    try {
      await api.delete(`/admin/blog/${id}`);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to delete post.'));
    }
  },

  /** Upload image (cover or inline via Tiptap). Returns { url }. */
  async uploadImage(file: File): Promise<string> {
    try {
      const form = new FormData();
      form.append('file', file);
      const { data } = await api.post('/admin/upload', form);
      return data.url as string;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Image upload failed.'));
    }
  },

  // ── Public ──────────────────────────────────────────────────────────────

  async listPublic(query: BlogQuery = {}): Promise<BlogListResponse> {
    try {
      const { data } = await api.get('/blog', { params: query });
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load posts.'));
    }
  },

  async getBySlug(slug: string): Promise<BlogPost> {
    try {
      const { data } = await api.get(`/blog/${slug}`);
      return data.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Post not found.'));
    }
  },
};
