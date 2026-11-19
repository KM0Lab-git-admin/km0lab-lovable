import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/stores/useAppStore";
import { useMockAccountStore } from "@/stores/useMockAccountStore";
import { loadMockAccount, localizeRedemption } from "@/services/mock/account";
import { accountTotals } from "@/types/mockAccount";
import type { Redemption } from "@/types/redemption";
import type { PointsTransaction } from "@/types/points";

interface AccountResult {
  balance: number;
  earned: number;
  spent: number;
  transactions: PointsTransaction[];
  redemptions: Redemption[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useAccount(): AccountResult {
  const userId = useAppStore(s => s.session?.user.id);
  const lang = useAppStore(s => s.lang);
  const account = useMockAccountStore(s => userId ? s.accounts[userId] : undefined);
  const query = useQuery({ queryKey: ["mock-account", userId], queryFn: () => loadMockAccount(userId ?? ""), enabled: !!userId, staleTime: Infinity });
  const transactions = account?.transactions ?? [];
  const redemptions = useMemo(() => account?.redemptions.map(redemption => localizeRedemption(redemption, lang)) ?? [], [account?.redemptions, lang]);
  return {
    ...accountTotals(transactions), transactions, redemptions,
    loading: !!userId && !account && query.isLoading,
    error: query.error?.message ?? null,
    reload: () => { void query.refetch(); },
  };
}