export const INVITE_REWARDS = {
  person: 100,
  business: 500,
} as const;

export type InviteKind = keyof typeof INVITE_REWARDS;

const REFERRAL_STORAGE_KEY = "km0_invite_reference";

export const getOrCreateReferralReference = (): string => {
  const stored = window.localStorage.getItem(REFERRAL_STORAGE_KEY);
  if (stored) return stored;

  const reference = `pilot-${window.crypto.randomUUID()}`;
  window.localStorage.setItem(REFERRAL_STORAGE_KEY, reference);
  return reference;
};

interface InviteLinkOptions {
  kind: InviteKind;
  reference: string;
  town?: string | null;
}

export const buildInviteLink = ({ kind, reference, town }: InviteLinkOptions): string => {
  const url = new URL(kind === "person" ? "/login" : "/business-signup", window.location.origin);
  url.searchParams.set("invite", kind);
  url.searchParams.set("ref", reference);
  if (kind === "person") url.searchParams.set("returnTo", "/invite");
  if (kind === "business" && town) url.searchParams.set("town", town);
  return url.toString();
};
