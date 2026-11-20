import { afterEach, describe, expect, it, vi } from "vitest";
import { openShareChannel } from "@/lib/openShareChannel";

afterEach(() => vi.unstubAllGlobals());

describe("share channels", () => {
  const options = { message: "KM0 & barri: https://example.org/home?ref=abc", subject: "KM0 invitació", link: "https://example.org/home?ref=abc" };

  it("opens WhatsApp with the prepared message in a protected new window", async () => {
    const open = vi.fn();
    vi.stubGlobal("window", { open });
    await openShareChannel({ ...options, channel: "whatsapp" });
    expect(open).toHaveBeenCalledWith(`https://wa.me/?text=${encodeURIComponent(options.message)}`, "_blank", "noopener,noreferrer");
  });

  it("opens email with the unchanged subject and invitation message", async () => {
    const location = { href: "" };
    vi.stubGlobal("window", { location });
    await openShareChannel({ ...options, channel: "email" });
    expect(location.href).toBe(`mailto:?subject=${encodeURIComponent(options.subject)}&body=${encodeURIComponent(options.message)}`);
  });

  it("shares the exact personal link on Facebook", async () => {
    const open = vi.fn();
    vi.stubGlobal("window", { open });
    await openShareChannel({ ...options, channel: "facebook" });
    expect(open).toHaveBeenCalledWith(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(options.link)}`, "_blank", "noopener,noreferrer");
  });
});