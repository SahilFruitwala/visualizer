import { HttpMessage } from "../components/ApiFlow";
import { defineViz, type StepBase, type Topic } from "../engine/types";
import { C, FONT_MONO } from "../theme";

interface Step extends StepBase {
  method: string;
  path: string;
  status: number;
  statusLabel: string;
  reqBody?: string;
  resBody?: string;
}

function build(): Step[] {
  return [
    {
      method: "GET",
      path: "/users/1",
      status: 200,
      statusLabel: "OK",
      resBody: '{ "id": 1, "name": "Alice" }',
      caption: "200 OK — request succeeded; response body contains the resource.",
    },
    {
      method: "POST",
      path: "/users",
      status: 201,
      statusLabel: "Created",
      reqBody: '{ "name": "Bob" }',
      resBody: '{ "id": 2, "name": "Bob" }',
      caption: "201 Created — new resource was created (POST success).",
    },
    {
      method: "POST",
      path: "/users",
      status: 400,
      statusLabel: "Bad Request",
      reqBody: '{ name: Bob }',
      resBody: '{ "error": "Invalid JSON" }',
      caption: "400 Bad Request — client sent malformed or invalid input.",
    },
    {
      method: "GET",
      path: "/profile",
      status: 401,
      statusLabel: "Unauthorized",
      resBody: '{ "error": "Missing token" }',
      caption: "401 Unauthorized — authentication required but not provided.",
    },
    {
      method: "GET",
      path: "/users/999",
      status: 404,
      statusLabel: "Not Found",
      resBody: '{ "error": "User not found" }',
      caption: "404 Not Found — resource does not exist at that URL.",
    },
    {
      method: "GET",
      path: "/search",
      status: 429,
      statusLabel: "Too Many Requests",
      resBody: '{ "error": "Rate limit exceeded" }',
      caption: "429 Too Many Requests — client hit a rate limit; retry after backoff.",
    },
    {
      method: "GET",
      path: "/users/1",
      status: 500,
      statusLabel: "Internal Server Error",
      resBody: '{ "error": "Something went wrong" }',
      caption: "500 Internal Server Error — unexpected failure on the server side.",
    },
  ];
}

const CODE = `const res = await fetch("/users/1");
// res.status tells you what happened:
// 2xx → success (200 OK, 201 Created)
// 4xx → client error (400, 401, 404, 429)
// 5xx → server error (500)

if (res.status === 404) { /* not found */ }
if (res.status === 429) { /* back off and retry */ }`;

export const httpStatusCodes: Topic = {
  id: "http-status-codes",
  title: "HTTP Status Codes",
  category: "API",
  blurb: "2xx success, 4xx client errors, 5xx server errors.",
  create: () =>
    defineViz<Step>({
      steps: build(),
      code: CODE,
      explanation:
        "Status codes are grouped by hundreds digit. 2xx means success. 4xx means the client did something wrong (bad input, missing auth, wrong URL). 5xx means the server failed unexpectedly.\n\nAlways check res.ok or res.status before assuming the response body is what you expect — error responses often carry JSON error messages too.",
      renderStep: (s) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
            <HttpMessage
              direction="request"
              method={s.method}
              path={s.path}
              body={s.reqBody}
              highlight={s.reqBody ? ["line", "body"] : ["line"]}
            />
            <div style={{ fontFamily: FONT_MONO, fontSize: 24, color: C.textMuted }}>→</div>
            <HttpMessage
              direction="response"
              status={s.status}
              statusLabel={s.statusLabel}
              body={s.resBody}
            />
          </div>
        </div>
      ),
    }),
};
