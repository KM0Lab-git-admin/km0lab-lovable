/** An unknown municipality has no public rewards; other failures remain errors. */
export function isUnavailableMunicipalCatalogue(
  method: string,
  target: URL,
  status: number,
  body: string,
): boolean {
  if (
    method !== "GET" ||
    target.pathname !== "/api/v1/rewards/public" ||
    !/^\d{5}$/.test(target.searchParams.get("postal_code") ?? "") ||
    status !== 404
  ) return false;

  try {
    const payload: unknown = JSON.parse(body);
    return typeof payload === "object" && payload !== null &&
      "detail" in payload && payload.detail === "Unknown postal code";
  } catch {
    return false;
  }
}