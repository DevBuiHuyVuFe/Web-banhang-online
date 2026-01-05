import { httpPost } from './http';

export type CreateMomoPaymentResponse = {
  success: boolean;
  payUrl: string;
  momo?: any;
  order?: { id: number; code: string };
  error?: string;
  detail?: string;
};

export class PaymentService {
  static async createMomoPayment(orderId: number): Promise<CreateMomoPaymentResponse> {
    return httpPost<CreateMomoPaymentResponse>('payments/momo/create', { order_id: orderId });
  }
}


