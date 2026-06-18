import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { touchVisitor, getActiveVisitors, cleanupVisitors } from "./lib/visitors";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => ((m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry)),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);

      // simple API endpoint to expose active visitors count
      if (url.pathname === "/api/visitors") {
        // cleanup old entries occasionally
        cleanupVisitors();
        const count = await getActiveVisitors();
        return new Response(JSON.stringify({ count }), {
          status: 200,
          headers: { "content-type": "application/json; charset=utf-8" },
        });
      }

      // mark visitor by cookie
      const cookieHeader = request.headers.get("cookie") || "";
      const match = cookieHeader.match(/(?:^|;)\s*visitor_id=([^;]+)/);
      let visitorId = match ? match[1] : null;
      let needSetCookie = false;
      if (!visitorId) {
        visitorId = `v_${Date.now()}_${Math.floor(Math.random() * 1e9)}`;
        needSetCookie = true;
      }
      // touch visitor for activity
      touchVisitor(visitorId);

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);

      // attach Set-Cookie if new visitor id
      if (needSetCookie) {
        const newHeaders = new Headers(response.headers);
        // 1 year
        newHeaders.set("Set-Cookie", `visitor_id=${visitorId}; Path=/; Max-Age=31536000; HttpOnly`);
        const cloned = new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        });
        return await normalizeCatastrophicSsrResponse(cloned);
      }

      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
