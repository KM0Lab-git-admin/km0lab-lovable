import { afterEach, describe, expect, it } from "vitest";
import { updateProfile } from "@/services/profile";
import { useAppStore } from "@/stores/useAppStore";

afterEach(() => useAppStore.setState({ profiles: {}, session: null }));
describe("neutral profile seam", () => {
  it("updates only the local profile without changing the reference town", async () => {
    useAppStore.setState({ postalCode: "17400", town: "Breda" });
    const result = await updateProfile("profile-test", { first_name: "Anna" });
    expect(result.error).toBeNull();
    expect(useAppStore.getState().profiles["profile-test"]?.first_name).toBe("Anna");
    expect(useAppStore.getState().postalCode).toBe("17400");
  });
});