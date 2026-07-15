import { DeepPartial } from 'typeorm';

import { RequestStatus } from '@/modules/idempotency-record/type/idempotency-record';
import { IdempotencyRecord } from '@/modules/idempotency-record/domain/entities/idempotency-record.entity';

import { IdempotencyRecordRepository } from '../repository/idempotency-record.repository';

export class IdempotencyRecordService {
  constructor(private readonly idempotencyRecordRepository: IdempotencyRecordRepository) {}

  async findByUserEndpointAndKey(userId: string, endpoint: string, idempotencyKey: string) {
    return this.idempotencyRecordRepository.findByUserEndpointAndKey(
      userId,
      endpoint,
      idempotencyKey,
    );
  }

  async create(data: DeepPartial<IdempotencyRecord>) {
    return this.idempotencyRecordRepository.create(data);
  }

  async deleteById(id: string) {
    return this.idempotencyRecordRepository.delete(id);
  }

  async markCompleted(id: string, responseStatusCode: number, responseBody: unknown) {
    return this.idempotencyRecordRepository.update(
      {
        status: RequestStatus.COMPLETED,
        responseStatusCode,
        responseBody: responseBody as IdempotencyRecord['responseBody'],
      },
      id,
    );
  }
}
