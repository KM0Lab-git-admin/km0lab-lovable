import type { Redemption } from "@/types/redemption";

/** Host público de la API de premios: las imágenes son las mismas que muestra el catálogo. */
const REWARDS_HOST = "https://api.uat.km0lab.com";
const rewardImg = (id: string, v: string) =>
  `${REWARDS_HOST}/api/v1/rewards/${id}/media?v=${v}`;

/**
 * Dades fictícies de bescanvis per visualitzar tots els estats possibles.
 *
 * Inclou els exemples demanats: gorra, samarreta, entrada de cinema i val de 20€.
 */
export const REDEMPTIONS: Redemption[] = [
  {
    id: "rdm-val-20",
    rewardId: "val-20eur",
    rewardTitle: "Val de 20€",
    rewardDescription: "Val de descompte bescanviable a qualsevol comerç adherit.",
    rewardCategory: "balance",
    rewardKind: "voucher",
    imageUrl: rewardImg("28f86ca8c4ecdc2c7d36aa9e13e06724", "1789768136"),
    costPoints: 4000,
    valueLabel: "20 €",
    status: "redeemed",
    code: "38421",
    shopName: "Forn Rovira",
    redeemedAt: "2026-07-25T10:30:00Z",
    expiresAt: "2026-08-25T23:59:59Z",
    completedAt: "2026-07-25T11:15:00Z",
  },
  {
    id: "rdm-entrada-cinema",
    rewardId: "entrada-cinema",
    rewardTitle: "Entrada de cinema",
    rewardDescription: "Una entrada per a qualsevol sessió no premium.",
    rewardCategory: "experience",
    rewardKind: "ticket",
    imageUrl: rewardImg("d4a51753cb7262631277bd736e3336af", "1789768137"),
    costPoints: 1500,
    valueLabel: "1 entrada",
    status: "ready",
    code: "19283",
    shopName: "Cinebaix Malgrat",
    redeemedAt: "2026-07-27T09:00:00Z",
    expiresAt: "2026-08-27T23:59:59Z",
  },
  {
    id: "rdm-gorra",
    rewardId: "gorra-km0",
    rewardTitle: "Gorra KM0 LAB",
    rewardDescription: "Gorra oficial del programa KM0 LAB.",
    rewardCategory: "merchandising",
    rewardKind: "product",
    imageUrl: rewardImg("869c2bc2bbd6a0250aef5aa3d377572d", "1789768136"),
    costPoints: 600,
    valueLabel: "1 unitat",
    status: "pending",
    code: "74561",
    shopName: "Llibreria Lola",
    redeemedAt: "2026-07-28T16:20:00Z",
  },
  {
    id: "rdm-samarreta",
    rewardId: "samarreta-km0",
    rewardTitle: "Samarreta KM0 LAB",
    rewardDescription: "Samarreta oficial del programa KM0 LAB.",
    rewardCategory: "merchandising",
    rewardKind: "product",
    imageUrl: rewardImg("4ab8890c66736e1c017a0698ad73939d", "1789768136"),
    costPoints: 800,
    valueLabel: "1 unitat",
    status: "redeemed",
    code: "50192",
    shopName: "Llibreria Lola",
    redeemedAt: "2026-07-15T12:00:00Z",
    completedAt: "2026-07-16T10:00:00Z",
  },
  {
    id: "rdm-val-5-expired",
    rewardId: "val-5eur",
    rewardTitle: "Val de 5€",
    rewardDescription: "Val de descompte bescanviable a qualsevol comerç adherit.",
    rewardCategory: "balance",
    rewardKind: "voucher",
    imageUrl: rewardImg("2f8dd9364967685f775293693a94defe", "1789768136"),
    costPoints: 1000,
    valueLabel: "5 €",
    status: "expired",
    code: "99841",
    shopName: "Forn Rovira",
    redeemedAt: "2026-06-01T08:00:00Z",
    expiresAt: "2026-06-30T23:59:59Z",
  },
];
