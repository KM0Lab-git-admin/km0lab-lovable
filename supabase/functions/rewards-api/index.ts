import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
    console.log("proxy", req.method, url.pathname, url.search, "->", target);

    const hasBody = req.method !== "GET" && req.method !== "HEAD";
    const body = hasBody ? await req.text() : undefined;

    const apiRes = await fetch(target, {
      method: req.method,
      headers: { "Content-Type": "application/json" },
      body,
    });

    const respBody = await apiRes.arrayBuffer();
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
