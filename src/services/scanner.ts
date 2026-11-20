import { useAppStore } from "@/stores/useAppStore";
import { useMockAccountStore } from "@/stores/useMockAccountStore";
import { loadMockAccount } from "@/services/mock/account";
import { accountTotals } from "@/types/mockAccount";
import { MOCK_POINTS } from "@/data/mockPointsConfig";
/**
 * scannerService — Mock del escaneig de QR de comerç.
 *
 * FRONTERA: aquí NO es llegeix cap càmera real ni s'escriuen punts al
 * backend. El service simula la latència de validació i retorna un
 * `ScanResult` a partir del `code` demanat (útil per demostrar cadascun
 * dels estats del flux). La FIRMA és el contracte estable: en producció
 * es substitueix la implementació sense tocar la UI.
 */
import { COMERCIOS_ADHERITS } from "@/data/comerciosAdheridos";

import type { ScanResult } from "@/types/scan";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const rand = (min: number, max: number) => min + Math.random() * (max - min);

/**
 * Mocks pre-definits per demostrar cada estat en preview:
 *  - "OK_FORN_ROVIRA"   → èxit (+20 pts, total 1.260, nivell 4)
 *  - "ERR_JA_VISITAT"   → ja visitat (comerç conegut)
 *  - "ERR_CODI"         → codi no vàlid
 *  - "ERR_CADUCAT"      → QR caducat
 *  - "ERR_CONNEXIO"     → sense connexió
 *  - qualsevol altre    → èxit amb un comerç aleatori
 */
export const scannerService = {
  async scan(code?: string): Promise<ScanResult> {
    await delay(rand(600, 1200));

    switch (code) {
      case "ERR_JA_VISITAT":
        return { ok: false, kind: "ja_visitat", comercNom: "Forn Rovira" };
      case "ERR_CODI":
        return { ok: false, kind: "codi_no_valid" };
      case "ERR_CADUCAT":
        return { ok: false, kind: "qr_caducat" };
      case "ERR_CONNEXIO":
        return { ok: false, kind: "sense_connexio" };
      case "OK_FORN_ROVIRA":
      default: {
        const forn = COMERCIOS_ADHERITS.find((c) => c.id === "forn-rovira");
        const userId = useAppStore.getState().session?.user.id;
        if (!userId) return { ok: false, kind: "codi_no_valid" };
        await loadMockAccount(userId);
        const account = useMockAccountStore.getState().accounts[userId];
        if (!account) return { ok: false, kind: "sense_connexio" };
        const transactionId = `scan-${forn?.id ?? "forn-rovira"}`;
        if (account.transactions.some(tx => tx.id === transactionId)) return { ok: false, kind: "ja_visitat", comercNom: forn?.nom };
        const transactions = [{ id: transactionId, type: "scan" as const, conceptKey: "points.history.type.scan" as const, place: forn?.nom, date: new Date().toISOString(), points: MOCK_POINTS.scan }, ...account.transactions];
        useMockAccountStore.getState().putAccount(userId, { ...account, transactions });
        const total = accountTotals(transactions).balance;
        return {
          ok: true,
          comercId: forn?.id ?? "forn-rovira",
          comercNom: forn?.nom ?? "Forn Rovira",
          puntsGuanyats: MOCK_POINTS.scan,
          totalPunts: total,
          nivell: Math.floor(total / 1000) + 1,
        };
      }
    }
  },
};
