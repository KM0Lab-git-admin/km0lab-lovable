import { useSearchParams } from "react-router-dom";

export type ScreenState = "loading" | "empty" | "error" | "ready";
export function usePreviewState(loading: boolean, error: boolean, empty: boolean) {
  const [params, setParams] = useSearchParams();
  const forced = params.get("state");
  const state: ScreenState = forced === "loading" || forced === "error" || forced === "empty" ? forced : loading ? "loading" : error ? "error" : empty ? "empty" : "ready";
  const retry = (reload: () => void) => {
    if (forced) { const next = new URLSearchParams(params); next.delete("state"); setParams(next, { replace: true }); }
    reload();
  };
  return { state, retry };
}