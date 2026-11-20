import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { HomeContentProps } from "@/components/HomeContent";
import HomeHero from "@/components/HomeHero";
import Home from "@/pages/Home";
import { useTerritory } from "@/hooks/use-territory";
import { DEFAULT_TOWN_ART } from "@/data/townArt";

vi.mock("@/components/HomeContent", () => ({ default: (props: HomeContentProps) => <HomeHero cityName={props.cityName} townArtSrc={props.townArtSrc} hasAlerts={false} onToggleAlerts={() => {}} showGreeting={false} /> }));
vi.mock("@/components/TownPickerSheet", () => ({ default: () => null }));
vi.mock("@/components/NotificationsOverlay", () => ({ default: () => null }));
vi.mock("@/components/PointsRewardOverlay", () => ({ default: () => null }));
vi.mock("@/hooks/use-territory", () => ({ useTerritory: vi.fn(), useSetHomeTown: () => () => {} }));
vi.mock("@/hooks/use-location-context", () => ({ useLocationContext: () => ({ town: "Reference town" }) }));
vi.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ user: null, loading: false }) }));
vi.mock("@/hooks/useProfile", () => ({ useProfile: () => ({ profile: null }) }));
vi.mock("@/hooks/use-account", () => ({ useAccount: () => ({ balance: 0 }) }));
vi.mock("@/hooks/use-points-config", () => ({ usePointsConfig: () => ({}) }));
vi.mock("@/hooks/useNotifications", () => ({ useNotifications: () => ({ items: [], hasUnread: false }) }));
vi.mock("@/hooks/use-invite-summary", () => ({ useInviteSummary: () => ({ summary: null }) }));
vi.mock("@/hooks/useFeaturedPromos", () => ({ useFeaturedPromos: () => ({ promos: [] }) }));
vi.mock("@/hooks/usePublicRewards", () => ({ usePublicRewards: () => ({ rewards: [] }) }));
vi.mock("@/hooks/use-scope-news", () => ({ useScopeNews: () => ({ home: [], nearby: [], failedTownIds: [] }) }));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let root: Root | null = null;
const container = document.createElement("div");
function renderHome() {
  root ??= createRoot(container);
  act(() => root?.render(<MemoryRouter><Home /></MemoryRouter>));
}
afterEach(() => { act(() => root?.unmount()); root = null; });
describe("Home reference town artwork", () => {
  it("passes the reference artwork to the existing header and updates with the reference town", () => {
    const reference = { id: "reference", name: "Reference town", postalCodes: ["12345"], artUrl: "/reference.webp" };
    const state = { territory: null, homeTown: reference, nearbyTowns: [], isGrouped: false, loading: false, error: null, reload: () => {} };
    vi.mocked(useTerritory).mockReturnValue(state);
    renderHome();
    expect(container.querySelector("header img")?.getAttribute("src")).toBe("/reference.webp");
    vi.mocked(useTerritory).mockReturnValue({ ...state, homeTown: { ...reference, artUrl: "/next-reference.webp" } });
    renderHome();
    expect(container.querySelector("header img")?.getAttribute("src")).toBe("/reference.webp");
    const pending = container.querySelector('header img[src="/next-reference.webp"]');
    if (!pending) throw new Error("Missing replacement artwork");
    act(() => pending.dispatchEvent(new Event("load")));
    expect(container.querySelector("header img")?.getAttribute("src")).toBe("/next-reference.webp");
  });
  it("passes no specific artwork while territory loads", () => {
    vi.mocked(useTerritory).mockReturnValue({ territory: null, homeTown: null, nearbyTowns: [], isGrouped: false, loading: true, error: null, reload: () => {} });
    renderHome();
    expect(container.querySelector("header img")?.getAttribute("src")).toBe(DEFAULT_TOWN_ART);
  });
});