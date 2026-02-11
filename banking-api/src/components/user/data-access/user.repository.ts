import { getDataSource } from '@/common/configs/db';

import { User } from '@/components/user/domain/entities/user.entity';

export const userRepo = () => getDataSource().getRepository(User);
