import { getDataSource } from '@/common/configs/database';
import { BaseRepository } from '@/common/repository/base.repository';
import { IdempotencyRecord } from '@/modules/idempotency-record/domain/entities/idempotency-record.entity';

export class IdempotencyRecordRepository extends BaseRepository<IdempotencyRecord> {
  constructor() {
    super(getDataSource().getRepository(IdempotencyRecord));
  }

  async findByUserEndpointAndKey(userId: string, endpoint: string, idempotencyKey: string) {
    return this.getRepository().findOne({
      where: { user: { id: userId }, endpoint, idempotencyKey },
    });
  }
}
