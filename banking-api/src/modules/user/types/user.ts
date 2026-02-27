export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum UserStatus {
  ACTIVE = 'active',
  DE_ACTIVE = 'de-active',
  DELETED = 'deleted',
}

export interface FilterOptions {
  status?: UserStatus;
}
