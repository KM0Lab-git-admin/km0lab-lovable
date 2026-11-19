import { useAppStore } from "@/stores/useAppStore";

/** All municipality-aware views use the same current selection. */
export function useLocationContext() {
  const postalCode = useAppStore(s => s.postalCode);
  const town = useAppStore(s => s.town);
  return { postalCode: postalCode ?? "08380", town: town ?? "Malgrat de Mar" };
}