/** Public town artwork, read through the same CORS proxy as the rewards catalogue. */
import { z } from "zod";
import { RewardsApiError, RewardsApiContractError } from "@/services/rewardsApi";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
const BASE_URL = SUPABASE_URL ? `${SUPABASE_URL}/functions/v1/rewards-api` : "";
const TOWNS_HOST = "https://api.uat.km0lab.com";

export const publicTownResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string().optional(),
  postal_codes: z.array(z.string()).optional(),
  art_url: z.string().nullable().optional(),
});

/** Decorative only: unavailable, older or invalid responses never fail the screen. */
export async function getTownArtUrl(postalCode: string): Promise<string | null> {
  const search = new URLSearchParams({ postal_code: postalCode });
  const path = `/api/v1/towns/public?${search.toString()}`;
  try {
    const authHeaders: Record<string, string> = SUPABASE_KEY
      ? { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
      : {};
    const response = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json", ...authHeaders },
    });
    if (!response.ok) {
      throw new RewardsApiError(response.status, `API ${path} respondió ${response.status}`);
    }
    const json: unknown = await response.json();
    const parsed = publicTownResponseSchema.safeParse(json);
    if (!parsed.success) {
      throw new RewardsApiContractError(path, parsed.error.issues);
    }
    return parsed.data.art_url ? new URL(parsed.data.art_url, TOWNS_HOST).href : null;
  } catch {
    return null;
  }
}