import { INVITE_REWARDS } from "@/data/inviteConfig";

export function useInviteRewards(): { person: number; business: number } {
  return { person: INVITE_REWARDS.person, business: INVITE_REWARDS.business };
}