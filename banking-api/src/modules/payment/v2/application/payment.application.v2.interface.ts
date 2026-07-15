import { PaginatedResponse, PaginationOptions } from '@/common/types/pagination';

import { FilterOptions, PaymentType } from '@/modules/payment/types/payment';
import { Amount } from '@/common/types/money';

import { Payment } from '@/modules/payment/domain/entities/payment.entity';

export interface CreatePaymentInput {
  userId: string;
  type: PaymentType;
  amount: Amount;
  idempotencyKey: string;
  sourceAccountId?: string;
  destinationAccountId?: string;
  description?: string;
}

export interface PaymentApplicationService {
  findPayments(
    pagination: PaginationOptions,
    filter?: FilterOptions,
    userId?: string,
    isAdmin?: boolean,
  ): Promise<PaginatedResponse<Payment>>;

  getPaymentById(id: string, userId: string, isAdmin: boolean): Promise<Payment>;

  createPayment(input: CreatePaymentInput): Promise<Payment>;
}
