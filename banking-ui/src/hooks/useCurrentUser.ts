/**
 * Stub — will be replaced with a real React Query implementation in Step 5.
 * Returns isLoading: true so AdminRoute shows a spinner until the hook is wired up.
 */
export const useCurrentUser = () => {
  return {
    data: null as null | { role: 'admin' | 'user' },
    isLoading: true,
  };
};
