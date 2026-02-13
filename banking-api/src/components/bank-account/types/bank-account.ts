export interface FilterOptions {
  userId?: string;
  bankAccountIds?: string[];
}

export interface CreateBankAccountInput {
  name: string;
  clerkUserId: string;
}

export interface UpdateBankAccountInput {
  name: string;
  clerkUserId: string;
  bankAccountId: string;
}
