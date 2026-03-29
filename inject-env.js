// netlify/edge-functions/inject-env.js
//
// This edge function intercepts requests for index.html and replaces
// the %%PLACEHOLDER%% tokens with real env vars AT REQUEST TIME.
// The keys never appear in your source repository.
//
// Setup:
//   1. Place this file at: netlify/edge-functions/inject-env.js
//   2. Add to netlify.toml:
//
//      [[edge_functions]]
//        path = "/"
//        function = "inject-env"
//
//   3. Add all keys in Netlify dashboard → Site Settings → Environment Variables.

export default async (request, context) => {
  const response = await context.next();

  // Only process HTML responses
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  let html = await response.text();

  const replacements = {
    "%%GEMINI_API_KEY%%":             Deno.env.get("GEMINI_API_KEY")             || "",
    "%%ADMIN_EMAIL%%":                Deno.env.get("ADMIN_EMAIL")                || "",
    "%%FIREBASE_API_KEY%%":           Deno.env.get("FIREBASE_API_KEY")           || "",
    "%%FIREBASE_AUTH_DOMAIN%%":       Deno.env.get("FIREBASE_AUTH_DOMAIN")       || "",
    "%%FIREBASE_PROJECT_ID%%":        Deno.env.get("FIREBASE_PROJECT_ID")        || "",
    "%%FIREBASE_STORAGE_BUCKET%%":    Deno.env.get("FIREBASE_STORAGE_BUCKET")    || "",
    "%%FIREBASE_MESSAGING_SENDER_ID%%": Deno.env.get("FIREBASE_MESSAGING_SENDER_ID") || "",
    "%%FIREBASE_APP_ID%%":            Deno.env.get("FIREBASE_APP_ID")            || "",
  };

  for (const [token, value] of Object.entries(replacements)) {
    html = html.replaceAll(token, value);
  }

  return new Response(html, {
    status: response.status,
    headers: response.headers,
  });
};
