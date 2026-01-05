import { httpGet, httpPost } from './http';

export type Address = {
  id: number;
  user_id: number;
  full_name: string;
  phone: string;
  line1: string;
  ward?: string | null;
  district?: string | null;
  city?: string | null;
  is_default: number | boolean;
  created_at?: string;
};

export class AddressService {
  static async getDefaultAddress(userId: number): Promise<Address | null> {
    const resp = await httpGet<{ data: Address | null }>(`users/${userId}/address-default`);
    return resp?.data || null;
  }

  static async saveDefaultAddress(
    userId: number,
    payload: Pick<Address, 'full_name' | 'phone' | 'line1' | 'ward' | 'district' | 'city'>
  ): Promise<{ success: boolean; id: number }> {
    return httpPost<{ success: boolean; id: number }>(`users/${userId}/address-default`, payload);
  }
}


