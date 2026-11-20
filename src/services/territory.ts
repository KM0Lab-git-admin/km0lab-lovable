import { SCOPE_DEFINITIONS } from "@/data/territories";
import { MOCK_POSTAL_CODES } from "@/data/mockPostalCodes";
import type { Territory, Town } from "@/types/territory";

const slug = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function orderTowns(towns: Town[], homeTownId: string): Town[] {
  const home = towns.find(town => town.id === homeTownId);
  const rest = towns.filter(town => town.id !== homeTownId).sort((a, b) => a.name.localeCompare(b.name, "ca"));
  return home ? [home, ...rest] : rest;
}

/** Example implementation; production keeps this signature against the business API. */
export async function getTerritory(postalCode: string): Promise<Territory | null> {
  await new Promise(resolve => setTimeout(resolve, 150));
  const cp = postalCode.trim();
  const scope = SCOPE_DEFINITIONS.find(def => def.towns.some(town => town.postalCodes.includes(cp)));
  if (scope) {
    const home = scope.towns.find(town => town.postalCodes.includes(cp));
    if (!home) return null;
    return { scopeId: scope.scopeId, scopeName: scope.scopeName, homeTownId: home.id, towns: orderTowns(scope.towns, home.id) };
  }
  const name = MOCK_POSTAL_CODES[cp];
  if (!name) return null;
  const id = slug(name);
  const postalCodes = Object.keys(MOCK_POSTAL_CODES).filter(code => MOCK_POSTAL_CODES[code] === name);
  return { scopeId: `town-${id}`, scopeName: name, homeTownId: id, towns: [{ id, name, postalCodes }] };
}
