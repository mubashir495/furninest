import api, { getApiErrorMessage } from '@/lib/axios';
import { PaginatedUsers, User } from '@/Type/user';

const DEFAULT_PAGE_LIMIT = 20;

export const userService = {
  async getUsers(page = 1, limit = DEFAULT_PAGE_LIMIT, search = ''): Promise<PaginatedUsers> {
    try {
      const { data } = await api.get('/auth/users', {
        params: {
          page,
          limit,
          ...(search ? { search } : {}),
        },
      });

      return {
        data: data.data ?? [],
        meta: data.meta ?? { total: 0, page, limit, totalPages: 0 },
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not load customers.'));
    }
  },

  async updateUserStatus(id: string, isActive: boolean): Promise<User> {
    try {
      const { data } = await api.patch(`/auth/users/${id}/status`, { isActive });
      return data.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Could not update customer status.'));
    }
  },

  async findUserById(id: string): Promise<User | null> {
    const limit = 50;
    let page = 1;

    while (true) {
      const response = await this.getUsers(page, limit);
      const found = response.data.find((user) => user._id === id || user.id === id);

      if (found) {
        return found;
      }

      if (page >= response.meta.totalPages || response.meta.totalPages === 0) {
        break;
      }

      page += 1;
    }

    return null;
  },
};
