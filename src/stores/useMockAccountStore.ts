import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MockAccount } from "@/types/mockAccount";

interface MockAccountState {
  accounts: Record<string, MockAccount>;
  putAccount: (userId: string, account: MockAccount) => void;
}
export const useMockAccountStore = create<MockAccountState>()(persist(set => ({
  accounts: {},
  putAccount: (userId, account) => set(state => ({ accounts: { ...state.accounts, [userId]: account } })),
}), { name: "km0_mock_accounts" }));