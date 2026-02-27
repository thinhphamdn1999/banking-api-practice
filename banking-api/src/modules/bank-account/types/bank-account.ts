export interface FilterOptions {
  userId?: string;
}

export interface CreateBankAccountInput {
  name: string;
  userId: string;
}

export interface UpdateBankAccountInput {
  name: string;
  userId: string;
  bankAccountId: string;
}
