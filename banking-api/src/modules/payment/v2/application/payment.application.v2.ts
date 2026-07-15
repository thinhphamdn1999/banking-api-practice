import { DataSource } from 'typeorm';

import { ERROR_CODES } from '@/common/constants/error';
import HttpStatusCode from '@/common/constants/http-status-code';

import { BaseError } from '@/common/types/error';
import { PaginationOptions, PaginatedResponse } from '@/common/types/pagination';
import { isUniqueViolationError } from '@/common/utils/database';
import { hashRequestPayload } from '@/common/utils/request-hash';

import { CREATE_PAYMENT_ENDPOINT } from '@/modules/payment/constants/payment';
import { IDEMPOTENCY_RECORD_TTL_IN_MILLISECONDS } from '@/modules/idempotency-record/constants/idempotency-record';

import { FilterOptions, PaymentProvider, PaymentStatus } from '@/modules/payment/types/payment';
import { RequestStatus } from '@/modules/idempotency-record/type/idempotency-record';

import { IdempotencyRecord } from '@/modules/idempotency-record/domain/entities/idempotency-record.entity';
import { IdempotencyRecordService } from '@/modules/idempotency-record/domain/services/idempotency-record.service';
import { BankAccountService } from '@/modules/bank-account/domain/services/bank-account.service';
import { Payment } from '@/modules/payment/domain/entities/payment.entity';
import { PaymentService } from '@/modules/payment/domain/services/payment.service';

import { CreatePaymentInput, PaymentApplicationService } from './payment.application.v2.interface';

export class PaymentApplicationServiceV2 implements PaymentApplicationService {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly idempotencyRecordService: IdempotencyRecordService,
    private readonly bankAccountService: BankAccountService,
    private readonly dataSource: DataSource,
  ) {}

  findPayments(
    pagination: PaginationOptions,
    filter?: FilterOptions,
    userId?: string,
    isAdmin?: boolean,
  ): Promise<PaginatedResponse<Payment>> {
    return this.paymentService.findPayments(pagination, filter, userId, isAdmin);
  }

  getPaymentById(id: string, userId: string, isAdmin: boolean): Promise<Payment> {
    return this.paymentService.getPaymentById(id, userId, isAdmin);
  }

  async createPayment(input: CreatePaymentInput): Promise<Payment> {
    const isInvalidAmount =
      !input.amount || !Number.isFinite(input.amount.amount) || input.amount.amount <= 0;

    if (isInvalidAmount) {
      throw new BaseError({ message: ERROR_CODES.INVALID_AMOUNT });
    }

    const requestHash = hashRequestPayload({
      type: input.type,
      amount: input.amount,
      sourceAccountId: input.sourceAccountId,
      destinationAccountId: input.destinationAccountId,
      description: input.description,
    });

    const existingRecord = await this.idempotencyRecordService.findByUserEndpointAndKey(
      input.userId,
      CREATE_PAYMENT_ENDPOINT,
      input.idempotencyKey,
    );

    if (existingRecord) {
      return this.replayRecord(existingRecord, requestHash);
    }

    let claimedRecord: IdempotencyRecord;

    try {
      claimedRecord = await this.claimRecord(input, requestHash);
    } catch (error) {
      if (!isUniqueViolationError(error)) throw error;

      // A concurrent request won the insert, so defer to whatever it recorded.
      const concurrentRecord = await this.idempotencyRecordService.findByUserEndpointAndKey(
        input.userId,
        CREATE_PAYMENT_ENDPOINT,
        input.idempotencyKey,
      );

      if (!concurrentRecord) throw error;

      return this.replayRecord(concurrentRecord, requestHash);
    }

    try {
      const payment = await this.executePayment(input);

      await this.idempotencyRecordService.markCompleted(
        claimedRecord.id,
        HttpStatusCode.CREATED,
        payment,
      );

      return payment;
    } catch (error) {
      // Release the key so a caller whose payment never happened can retry with it.
      await this.idempotencyRecordService.deleteById(claimedRecord.id);
      throw error;
    }
  }

  private claimRecord(input: CreatePaymentInput, requestHash: string): Promise<IdempotencyRecord> {
    return this.idempotencyRecordService.create({
      user: { id: input.userId },
      endpoint: CREATE_PAYMENT_ENDPOINT,
      idempotencyKey: input.idempotencyKey,
      requestHash,
      status: RequestStatus.PROCESSING,
      expiresAt: new Date(Date.now() + IDEMPOTENCY_RECORD_TTL_IN_MILLISECONDS),
    });
  }

  private replayRecord(record: IdempotencyRecord, requestHash: string): Payment {
    if (record.requestHash !== requestHash) {
      throw new BaseError({ message: ERROR_CODES.IDEMPOTENCY_KEY_REUSED });
    }

    if (record.status === RequestStatus.PROCESSING) {
      throw new BaseError({ message: ERROR_CODES.IDEMPOTENT_REQUEST_IN_PROGRESS });
    }

    return record.responseBody as unknown as Payment;
  }

  private executePayment(input: CreatePaymentInput): Promise<Payment> {
    return this.dataSource.transaction(async (manager) => {
      const fromAccount = input.sourceAccountId
        ? await this.bankAccountService.debitAccount(
            input.sourceAccountId,
            input.amount.amount,
            manager,
          )
        : null;

      const toAccount = input.destinationAccountId
        ? await this.bankAccountService.creditAccount(
            input.destinationAccountId,
            input.amount.amount,
            manager,
          )
        : null;

      return this.paymentService.createPayment(
        {
          user: { id: input.userId },
          type: input.type,
          amount: input.amount.amount.toString(),
          currency: input.amount.currency,
          description: input.description,
          status: PaymentStatus.SUCCESS,
          provider: PaymentProvider.INTERNAL,
          fromAccount: fromAccount ?? undefined,
          toAccount: toAccount ?? undefined,
        },
        manager,
      );
    });
  }
}
