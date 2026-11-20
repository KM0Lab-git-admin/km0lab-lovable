import { beforeEach, describe, expect, it } from "vitest";
import { scannerService } from "@/services/scanner";
import { loadMockAccount } from "@/services/mock/account";
import { useAppStore } from "@/stores/useAppStore";
import { useMockAccountStore } from "@/stores/useMockAccountStore";
import { accountTotals } from "@/types/mockAccount";

beforeEach(() => {
  useMockAccountStore.setState({ accounts: {} });
  useAppStore.setState({ session: { user: { id: "scanner-test", email: "scanner@example.test" }, createdAt: "2026-11-20" } });
});

describe("portable scanner contract", () => {
  it.each([
    ["ERR_JA_VISITAT", "ja_visitat"], ["ERR_CODI", "codi_no_valid"],
    ["ERR_CADUCAT", "qr_caducat"], ["ERR_CONNEXIO", "sense_connexio"],
  ] as const)("preserves %s and does not create transactions", async (code, kind) => {
    expect(await scannerService.scan(code)).toMatchObject({ ok: false, kind });
    expect(useMockAccountStore.getState().accounts).toEqual({});
  });
  it("adds 20 scan points once and rejects the second scan", async () => {
    const account = await loadMockAccount("scanner-test");
    const before = accountTotals(account.transactions).balance;
    expect(await scannerService.scan("OK_FORN_ROVIRA")).toMatchObject({ ok: true, comercId: "forn-rovira", puntsGuanyats: 20, totalPunts: before + 20 });
    expect(await scannerService.scan("OK_FORN_ROVIRA")).toMatchObject({ ok: false, kind: "ja_visitat" });
    const stored = useMockAccountStore.getState().accounts["scanner-test"];
    expect(stored.transactions.filter(tx => tx.id === "scan-forn-rovira")).toHaveLength(1);
    expect(accountTotals(stored.transactions).balance).toBe(before + 20);
  });
  it("rejects a guest scan without changing any account", async () => {
    useAppStore.setState({ session: null });
    expect(await scannerService.scan("OK_FORN_ROVIRA")).toEqual({ ok: false, kind: "codi_no_valid" });
    expect(useMockAccountStore.getState().accounts).toEqual({});
  });
});