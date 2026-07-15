import { DeepPartial, EntityManager } from 'typeorm';

import {
  DEFAULT_PAGINATION_LIMIT_ITEM,
  DEFAULT_PAGINATION_PAGE,
} from '@/common/constants/pagination';
import { ERROR_CODES } from '@/common/constants/error';

import { PaginationOptions } from '@/common/types/pagination';
import { BaseError } from '@/common/types/error';

import { PaymentRepository } from '@/modules/payment/domain/repository/payment.repository';
import { Payment } from '@/modules/payment/domain/entities/payment.entity';

import { FilterOptions, PaymentStatus } from '@/modules/payment/types/payment';

export class PaymentService {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async findPayments(
    pagination: PaginationOptions = {
      page: DEFAULT_PAGINATION_PAGE,
      limit: DEFAULT_PAGINATION_LIMIT_ITEM,
    },
    filter?: FilterOptions,
    userId?: string,
    isAdmin?: boolean,
  ) {
    return this.paymentRepository.findPayments(pagination, filter, userId, isAdmin);
  }

  async getPaymentById(id: string, userId: string, isAdmin: boolean) {
    const payment = await this.paymentRepository.findByIdWithRelation(id, userId, isAdmin);

    if (!payment) {
      throw new BaseError({ message: ERROR_CODES.PAYMENT_NOT_FOUND });
    }

    return payment;
  }

  async createPayment(data: DeepPartial<Payment>, manager?: EntityManager) {
    return this.paymentRepository.create(data, manager);
  }

  async updatePaymentStatus(
    id: string,
    status: PaymentStatus,
    expectedStatus: PaymentStatus,
    providerStatus?: string,
  ) {
    const updated = await this.paymentRepository.updatePaymentStatus(
      id,
      status,
      expectedStatus,
      providerStatus,
    );

    if (!updated) {
      throw new BaseError({ message: ERROR_CODES.PAYMENT_NOT_CANCELLABLE });
    }
  }
}
