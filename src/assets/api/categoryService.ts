import { httpGet, httpPost } from './http';

export interface CategoryDTO {
  id: number;
  name: string;
  slug: string;
  parent_id?: number | null;
  sort_order: number;
  created_at: string;
}

export const CategoryService = {
  async list(): Promise<{ data: CategoryDTO[] }> {
    return httpGet<{ data: CategoryDTO[] }>('categories');
  },
  async create(payload: { name: string; slug: string; parent_id?: number | null; sort_order?: number; }): Promise<{ success: boolean; id: number }> {
    return httpPost<{ success: boolean; id: number }>('categories?admin=1', payload);
  },
}; 