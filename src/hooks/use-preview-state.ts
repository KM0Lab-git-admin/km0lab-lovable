import { useSearchParams } from "react-router-dom";

/** Sample is an explicit data source, not a fifth loading/error state. */
export type ContentSource = "live" | "sample";
export const getContentSource = (state: string | null): ContentSource => state === "sample" ? "sample" : "live";
export function useContentSource(): ContentSource {
  const [params] = useSearchParams();
  return getContentSource(params.get("state"));
}

/** Preserve the explicit source only while navigating the content preview. */
export function getContentPath(path: string, source: ContentSource): string {
  if (source === "live") return path;
  const [pathname, query = ""] = path.split("?");
  const params = new URLSearchParams(query);
  params.set("state", "sample");
  return `${pathname}?${params}`;
}

export type ScreenState = "loading" | "empty" | "error" | "ready";
export function usePreviewState(loading: boolean, error: boolean, empty: boolean) {
  const [params, setParams] = useSearchParams();
  const forced = params.get("state");
  const state: ScreenState = forced === "loading" || forced === "error" || forced === "empty" ? forced : loading ? "loading" : error ? "error" : empty ? "empty" : "ready";
  const retry = (reload: () => void) => {
    if (forced) { const next = new URLSearchParams(params); next.delete("state"); setParams(next, { replace: true }); }
    reload();
  };
  return { state, retry, isSample: getContentSource(forced) === "sample" };
}