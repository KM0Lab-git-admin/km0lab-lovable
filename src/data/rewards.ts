import { t, type Lang } from "@/lib/i18n";
import type { Reward } from "@/types/reward";

/**
 * Catálogo mock de premios canjeables por puntos.
 * Reproduce el listado definido en el back-office del programa.
 */
export const REWARDS: Reward[] = [
  {
    id: "val-5eur",
    title: "Val de 5€",
    description: "Val bescanviable a qualsevol comerç adherit de la població.",
    category: "balance",
    status: "active",
    kind: "voucher",
    costPoints: 50,
    valueLabel: "5 €",
    stock: null,
    scope: "Tots els comerços adherits",
  },
  {
    id: "val-10eur",
    title: "Val de 10€",
    description: "Val bescanviable a qualsevol comerç adherit de la població.",
    category: "balance",
    status: "active",
    kind: "voucher",
    costPoints: 100,
    valueLabel: "10 €",
    stock: null,
    scope: "Tots els comerços adherits",
  },
  {
    id: "entrada-cinema",
    title: "Entrada de cinema",
    description: "Una entrada per a qualsevol sessió no premium.",
    category: "experience",
    status: "active",
    kind: "ticket",
    costPoints: 200,
    valueLabel: "1 entrada",
    stock: 20,
    scope: "1 comerç",
  },
  {
    id: "gorra-km0",
    title: "Gorra KM0 LAB",
    description: "Gorra oficial del programa KM0 LAB.",
    category: "merchandising",
    status: "active",
    kind: "product",
    costPoints: 180,
    valueLabel: "1 unitat",
    stock: 45,
    scope: "Tots els comerços adherits",
  },
  {
    id: "samarreta-km0",
    title: "Samarreta KM0 LAB",
    description: "Samarreta oficial del programa KM0 LAB.",
    category: "merchandising",
    status: "sold_out",
    kind: "product",
    costPoints: 300,
    valueLabel: "1 unitat",
    stock: 0,
    scope: "Tots els comerços adherits",
  },
];

export function getMockRewards(lang: Lang): Reward[] {
  const titleKeys = { "val-5eur": "reward.mock.voucher5", "val-10eur": "reward.mock.voucher10", "entrada-cinema": "reward.mock.cinema.title", "gorra-km0": "reward.mock.cap.title", "samarreta-km0": "reward.mock.shirt.title" } as const;
  const descriptionKeys = { voucher: "reward.mock.voucher.description", ticket: "reward.mock.cinema.description", product: "reward.mock.cap.description", discount: "reward.mock.voucher.description" } as const;
  return REWARDS.map(reward => ({ ...reward,
    title: t(titleKeys[reward.id as keyof typeof titleKeys], lang),
    description: t(reward.id === "samarreta-km0" ? "reward.mock.shirt.description" : descriptionKeys[reward.kind], lang),
    scope: t("catalog.scope", lang), valueLabel: reward.kind === "product" ? t("reward.mock.unit", lang) : reward.kind === "ticket" ? t("reward.mock.ticket", lang) : reward.valueLabel,
  }));
}
