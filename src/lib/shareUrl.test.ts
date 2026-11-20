import { describe, expect, it } from "vitest";
import { getCanonicalWebLink, getShareLink } from "@/lib/shareUrl";
import { buildPublicShareLink } from "@/data/inviteConfig";

describe("share URL boundary", () => {
  it("preserves and encodes event identifiers without preview parameters", () => {
    const url = new URL(getShareLink("/event", { id: "cine & teatre/42" }));
    expect(url.pathname).toBe("/event");
    expect(url.searchParams.get("id")).toBe("cine & teatre/42");
    expect([...url.searchParams.keys()]).toEqual(["id"]);
  });

  it("omits null and undefined values but preserves empty values", () => {
    const url = new URL(getShareLink("/home?existing=1", { absent: null, missing: undefined, empty: "" }));
    expect(url.search).toBe("?existing=1&empty=");
  });

  it("keeps canonical web and share links equivalent in the prototype", () => {
    expect(getCanonicalWebLink("/home", { town: "Malgrat de Mar", lang: "ca" }))
      .toBe(getShareLink("/home", { town: "Malgrat de Mar", lang: "ca" }));
  });

  it("keeps public sharing free from referral attribution", () => {
    const url = new URL(buildPublicShareLink("Malgrat de Mar", "ca"));
    expect(url.pathname).toBe("/home");
    expect(url.searchParams.get("town")).toBe("Malgrat de Mar");
    expect(url.searchParams.has("ref")).toBe(false);
    expect(url.searchParams.has("invite")).toBe(false);
  });
});