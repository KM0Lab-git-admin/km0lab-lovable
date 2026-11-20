import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { isUnavailableMunicipalCatalogue } from "./publicRewardsResponse.ts";

const UPSTREAM = "https://api.uat.km0lab.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const marker = "/rewards-api";
    const idx = url.pathname.indexOf(marker);
    let rawPath = idx >= 0 ? url.pathname.slice(idx + marker.length) : "";
    // The Supabase gateway sometimes URL-encodes the entire subpath, turning
    // `?` into `%3F`. Decode so we can properly split path from query string.
    rawPath = decodeURIComponent(rawPath);
    const qIdx = rawPath.indexOf("?");
    let subpath = qIdx >= 0 ? rawPath.slice(0, qIdx) : rawPath;
    const inlineSearch = qIdx >= 0 ? rawPath.slice(qIdx) : "";
    if (!subpath || subpath === "/") subpath = "/api/v1/rewards/public";
    const search = url.search || inlineSearch;

    const target = `${UPSTREAM}${subpath}${search}`;

    const hasBody = req.method !== "GET" && req.method !== "HEAD";
    const body = hasBody ? await req.text() : undefined;

    const apiRes = await fetch(target, {
      method: req.method,
      headers: { "Content-Type": "application/json" },
      body,
    });

    const respBody = await apiRes.arrayBuffer();
    if (isUnavailableMunicipalCatalogue(
      req.method, new URL(target), apiRes.status, new TextDecoder().decode(respBody),
    )) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!apiRes.ok) {
      console.error("Upstream error:", apiRes.status, target);
    }
    return new Response(respBody, {
      status: apiRes.status,
      headers: {
        ...corsHeaders,
        "Content-Type": apiRes.headers.get("Content-Type") ?? "application/json",
      },
    });
  } catch (e) {
    console.error("rewards-api error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
