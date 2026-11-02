import api, { getApiErrorMessage } from '@/lib/axios';
import {
  ListingDraft,
  ListingDraftsResponse,
  CreateDraftResponse,
  PublishDraftResponse,
} from '@/Type/listing-agent';

export interface ListingDraftQuery {
  page?: number;
  limit?: number;
  status?: string;
}

export const listingAgentService = {
  /**
   * List drafts with optional status filtering and pagination.
   */
  async listDrafts(query: ListingDraftQuery = {}): Promise<ListingDraftsResponse> {
    try {
      const params: Record<string, any> = {
        page: query.page || 1,
        limit: query.limit || 20,
      };
      if (query.status && query.status !== 'all') {
        params.status = query.status;
      }
      const { data } = await api.get<ListingDraftsResponse>('/listing-agent/drafts', {
        params,
      });
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch listing drafts.'));
    }
  },

  /**
   * Get draft by ID.
   */
  async getDraft(id: string): Promise<ListingDraft> {
    try {
      const { data } = await api.get<ListingDraft>(`/listing-agent/drafts/${id}`);
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, `Failed to load draft ${id}.`));
    }
  },

  /**
   * Upload 1-6 photos + cost price -> Creates draft, enqueues BullMQ job.
   */
  async createDraft(formData: FormData): Promise<CreateDraftResponse> {
    try {
      const { data } = await api.post<CreateDraftResponse>(
        '/listing-agent/drafts',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to create listing draft.'));
    }
  },

  /**
   * Admin updates fields in a draft.
   */
  async updateDraft(id: string, payload: Partial<ListingDraft>): Promise<ListingDraft> {
    try {
      const { data } = await api.patch<ListingDraft>(
        `/listing-agent/drafts/${id}`,
        payload,
      );
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to save draft changes.'));
    }
  },

  /**
   * Admin approves a draft.
   */
  async approveDraft(id: string): Promise<ListingDraft> {
    try {
      const { data } = await api.post<ListingDraft>(
        `/listing-agent/drafts/${id}/approve`,
      );
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to approve draft.'));
    }
  },

  /**
   * Publish creates the real Product. Only allowed when status is approved.
   */
  async publishDraft(id: string): Promise<PublishDraftResponse> {
    try {
      const { data } = await api.post<PublishDraftResponse>(
        `/listing-agent/drafts/${id}/publish`,
      );
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to publish product.'));
    }
  },

  /**
   * Retry failed draft execution or regenerate.
   */
  async retryDraft(id: string): Promise<ListingDraft> {
    try {
      const { data } = await api.post<ListingDraft>(
        `/listing-agent/drafts/${id}/retry`,
      );
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to retry draft.'));
    }
  },

  /**
   * AI Image Generation (Phase d placeholder).
   */
  async generateImages(id: string): Promise<{ message: string; draftId: string }> {
    try {
      const { data } = await api.post<{ message: string; draftId: string }>(
        `/listing-agent/drafts/${id}/generate-images`,
      );
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to trigger image generation.'));
    }
  },
};
