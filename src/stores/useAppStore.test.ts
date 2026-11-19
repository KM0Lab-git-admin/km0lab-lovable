import { describe, expect, it } from "vitest";
import { useAppStore } from "@/stores/useAppStore";
describe("one municipality context", () => {
  it("updates the selected municipality when the current profile changes", () => {
    useAppStore.setState({ session: { user: { id: "town-test", email: "town@example.test" }, createdAt: "2026-11-19" }, profiles: {} });
    useAppStore.getState().upsertProfile("town-test", { postal_code: "08001", town: "Barcelona" });
    expect(useAppStore.getState().postalCode).toBe("08001");
    expect(useAppStore.getState().town).toBe("Barcelona");
    useAppStore.getState().setLocation("08380", "Malgrat de Mar");
    expect(useAppStore.getState().profiles["town-test"].town).toBe("Malgrat de Mar");
  });
});