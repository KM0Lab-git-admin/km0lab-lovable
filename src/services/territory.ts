import { SCOPE_DEFINITIONS } from "@/data/territories";
import { MOCK_POSTAL_CODES } from "@/data/mockPostalCodes";
import { getTownArtUrl } from "@/services/townsApi";
import type { Territory, Town } from "@/types/territory";

const slug = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function orderTowns(towns: Town[], homeTownId: string): Town[] {
  const home = towns.find(town => town.id === homeTownId);
  const rest = towns.filter(town => town.id !== homeTownId).sort((a, b) => a.name.localeCompare(b.name, "ca"));
  return home ? [home, ...rest] : rest;
}

async function withTownArt(towns: Town[]): Promise<Town[]> {
  const results = await Promise.allSettled(towns.map(town => {
    const postalCode = town.postalCodes[0];
    return postalCode ? getTownArtUrl(postalCode) : Promise.resolve(null);
  }));
  return towns.map((town, index) => {
    const result = results[index];
    return { ...town, artUrl: result?.status === "fulfilled" ? result.value : null };
  });
}

/** Local territory metadata is available immediately; it never substitutes API artwork. */
export function resolveTerritory(postalCode: string): Territory | null {
  const cp = postalCode.trim();
  const scope = SCOPE_DEFINITIONS.find(def => def.towns.some(town => town.postalCodes.includes(cp)));
  if (scope) {
    const home = scope.towns.find(town => town.postalCodes.includes(cp));
    if (!home) return null;
    return { scopeId: scope.scopeId, scopeName: scope.scopeName, homeTownId: home.id, towns: orderTowns(scope.towns, home.id).map(town => ({ ...town, artUrl: null })) };
  }
  const name = MOCK_POSTAL_CODES[cp];
  if (!name) return null;
  const id = slug(name);
  const postalCodes = Object.keys(MOCK_POSTAL_CODES).filter(code => MOCK_POSTAL_CODES[code] === name);
  return { scopeId: `town-${id}`, scopeName: name, homeTownId: id, towns: [{ id, name, postalCodes, artUrl: null }] };
}

/** Example metadata enriched by the public API; production keeps this async signature. */
export async function getTerritory(postalCode: string): Promise<Territory | null> {
  const territory = resolveTerritory(postalCode);
  if (!territory) return null;
  await new Promise(resolve => setTimeout(resolve, 150));
  return { ...territory, towns: await withTownArt(territory.towns) };
}
