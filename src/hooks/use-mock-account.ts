import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/stores/useAppStore";
import { useMockAccountStore } from "@/stores/useMockAccountStore";
import { loadMockAccount } from "@/services/mock/account";
import { accountTotals } from "@/types/mockAccount";

export function useMockAccount() {
  const userId = useAppStore(s => s.session?.user.id);
  const account = useMockAccountStore(s => userId ? s.accounts[userId] : undefined);
  const query = useQuery({ queryKey: ["mock-account", userId], queryFn: () => loadMockAccount(userId ?? ""), enabled: !!userId, staleTime: Infinity });
  const transactions = account?.transactions ?? [];
  return { ...accountTotals(transactions), transactions, redemptions: account?.redemptions ?? [],
    loading: !!userId && !account && query.isLoading, error: query.isError, reload: () => { void query.refetch(); } };
}