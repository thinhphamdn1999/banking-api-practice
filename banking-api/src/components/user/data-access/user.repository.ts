import { getDataSource } from '@/common/configs/db';

import { User } from '@/components/user/data-access/user.entity';

export const userRepo = () => getDataSource().getRepository(User);
