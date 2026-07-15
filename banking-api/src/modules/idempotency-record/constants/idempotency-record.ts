import { MILLISECONDS_PER_SECOND } from '@/common/constants/time';

const SECONDS_PER_HOUR = 3600;
const REPLAY_WINDOW_IN_HOURS = 24;

/** How long a completed record stays replayable before a cleanup job may reclaim it. */
export const IDEMPOTENCY_RECORD_TTL_IN_MILLISECONDS =
  REPLAY_WINDOW_IN_HOURS * SECONDS_PER_HOUR * MILLISECONDS_PER_SECOND;
